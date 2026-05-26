import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config';
import { createAppError } from '../utils/helpers';
import { getCache, setCache, delCache } from '../utils/cache';
import logger from '../utils/logger';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MINUTES = 15;
const JWT_EXPIRES_IN = '8h';

interface LoginResult {
  token: string;
  user: {
    id: string;
    username: string;
    realName: string | null;
    avatar: string | null;
    email: string | null;
    isGlobal: boolean;
  };
}

/**
 * Login with username and password.
 * - Validates credentials
 * - Checks account lock (5 failed attempts → 15 min lock)
 * - Generates JWT
 * - Records audit log
 */
export const login = async (username: string, password: string, ip: string): Promise<LoginResult> => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw createAppError('用户名或密码错误', 401, 1001);
  }

  // Check lock
  const lockKey = `login_lock:${user.id}`;
  const attemptsKey = `login_attempts:${user.id}`;
  const lockedUntil = getCache<number>(lockKey);
  if (lockedUntil && Date.now() < lockedUntil) {
    const remaining = Math.ceil((lockedUntil - Date.now()) / 60000);
    throw createAppError(`账号已锁定，请${remaining}分钟后再试`, 403, 1002);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const attempts = (getCache<number>(attemptsKey) || 0) + 1;
    setCache(attemptsKey, attempts, LOCK_TIME_MINUTES * 60);

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      const lockUntil = Date.now() + LOCK_TIME_MINUTES * 60 * 1000;
      setCache(lockKey, lockUntil, LOCK_TIME_MINUTES * 60);
      delCache(attemptsKey);
      throw createAppError(`连续登录失败${MAX_LOGIN_ATTEMPTS}次，账号已锁定${LOCK_TIME_MINUTES}分钟`, 403, 1002);
    }

    throw createAppError(`用户名或密码错误，还剩${MAX_LOGIN_ATTEMPTS - attempts}次机会`, 401, 1001);
  }

  // Check if user is active
  if (!user.isActive) {
    throw createAppError('账号已被禁用', 403, 1002);
  }

  // Clear login attempts on success
  delCache(attemptsKey);
  delCache(lockKey);

  // Get user's sites and roles
  const siteUsers = await prisma.siteUser.findMany({
    where: { userId: user.id },
    include: { site: true, role: true },
  });

  if (siteUsers.length === 0) {
    throw createAppError('该用户未关联任何站点', 403, 1004);
  }

  const siteIds = siteUsers.map((su) => su.siteId);
  const defaultSite = siteUsers.find((su) => su.isDefault) || siteUsers[0];
  const currentSiteId = defaultSite.siteId;
  const roleCode = defaultSite.role.name;

  // Generate JWT
  const token = generateToken(user, siteIds, currentSiteId, roleCode);

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Record audit log
  await prisma.auditLog.create({
    data: {
      siteId: currentSiteId,
      userId: user.id,
      action: 'LOGIN',
      resource: 'auth',
      detail: `用户 ${username} 登录成功`,
      ipAddress: ip,
    },
  });

  logger.info(`User ${username} logged in from ${ip}`);

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      realName: user.realName,
      avatar: user.avatar,
      email: user.email,
      isGlobal: user.isGlobal,
    },
  };
};

/**
 * Logout - record audit log
 */
export const logout = async (userId: string): Promise<void> => {
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'LOGOUT',
      resource: 'auth',
      detail: '用户登出',
    },
  });

  logger.info(`User ${userId} logged out`);
};

/**
 * Get current user info including sites and permissions
 */
export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      phone: true,
      realName: true,
      avatar: true,
      isActive: true,
      isGlobal: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw createAppError('用户不存在', 404, 1005);
  }

  const siteUsers = await prisma.siteUser.findMany({
    where: { userId },
    include: {
      site: {
        select: { id: true, name: true, nameCn: true, nameEn: true, primaryColor: true, logo: true, status: true },
      },
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  const sites = siteUsers.map((su) => ({
    ...su.site,
    roleId: su.roleId,
    roleName: su.role.displayName,
    roleCode: su.role.name,
    isDefault: su.isDefault,
  }));

  const defaultSiteUser = siteUsers.find((su) => su.isDefault) || siteUsers[0];
  const permissions = defaultSiteUser
    ? defaultSiteUser.role.rolePermissions.map((rp) => {
        const p = rp.permission;
        return p.resource ? `${p.module}:${p.action}:${p.resource}` : `${p.module}:${p.action}`;
      })
    : [];

  return {
    ...user,
    sites,
    currentSiteId: defaultSiteUser?.siteId || null,
    currentRoleCode: defaultSiteUser?.role.name || null,
    permissions,
  };
};

/**
 * Change password
 */
export const changePassword = async (userId: string, oldPassword: string, newPassword: string): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw createAppError('用户不存在', 404, 1005);
  }

  const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isOldPasswordValid) {
    throw createAppError('原密码错误', 400, 1001);
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: 'CHANGE_PASSWORD',
      resource: 'auth',
      detail: '修改密码',
    },
  });

  logger.info(`User ${userId} changed password`);
};

/**
 * Generate JWT token
 */
export const generateToken = (
  user: { id: string; username: string },
  siteIds: string[],
  currentSiteId: string,
  roleCode: string,
): string => {
  const payload = {
    userId: user.id,
    username: user.username,
    roleCode,
    siteIds,
    currentSiteId,
  };

  return jwt.sign(payload, config.jwtSecret, { expiresIn: JWT_EXPIRES_IN });
};

export default {
  login,
  logout,
  getCurrentUser,
  changePassword,
  generateToken,
};
