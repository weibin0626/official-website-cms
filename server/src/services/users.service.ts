import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { createAppError, parsePagination, formatPaginatedResponse, PaginatedData } from '../utils/helpers';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = '123456';

interface UserListResult {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
  realName: string | null;
  avatar: string | null;
  isActive: boolean;
  isGlobal: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  siteUsers: Array<{
    siteId: string;
    site: { id: string; name: string; nameCn: string };
    role: { id: string; name: string; displayName: string };
    isDefault: boolean;
  }>;
}

/**
 * List users with pagination, search, and role filter
 */
export const listUsers = async (
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  roleId?: string,
): Promise<PaginatedData<UserListResult>> => {
  const where: any = {};

  if (search) {
    where.OR = [
      { username: { contains: search } },
      { realName: { contains: search } },
      { email: { contains: search } },
    ];
  }

  if (roleId) {
    where.siteUsers = { some: { roleId } };
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
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
        siteUsers: {
          select: {
            siteId: true,
            site: { select: { id: true, name: true, nameCn: true } },
            role: { select: { id: true, name: true, displayName: true } },
            isDefault: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return formatPaginatedResponse(users as any, total, page, pageSize);
};

/**
 * Get user by ID
 */
export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
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
      updatedAt: true,
      siteUsers: {
        select: {
          siteId: true,
          site: { select: { id: true, name: true, nameCn: true } },
          role: { select: { id: true, name: true, displayName: true } },
          isDefault: true,
        },
      },
    },
  });

  if (!user) {
    throw createAppError('用户不存在', 404, 1005);
  }

  return user;
};

/**
 * Create a new user
 */
export const createUser = async (data: {
  username: string;
  password: string;
  email?: string;
  phone?: string;
  realName?: string;
  isActive?: boolean;
  isGlobal?: boolean;
}) => {
  // Check unique username
  const existing = await prisma.user.findUnique({ where: { username: data.username } });
  if (existing) {
    throw createAppError('用户名已存在', 409, 1007);
  }

  // Check unique email
  if (data.email) {
    const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingEmail) {
      throw createAppError('邮箱已存在', 409, 1007);
    }
  }

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      username: data.username,
      password: hashedPassword,
      email: data.email || null,
      phone: data.phone || null,
      realName: data.realName || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      isGlobal: data.isGlobal || false,
    },
    select: {
      id: true,
      username: true,
      email: true,
      phone: true,
      realName: true,
      isActive: true,
      isGlobal: true,
      createdAt: true,
    },
  });

  return user;
};

/**
 * Update a user
 */
export const updateUser = async (id: string, data: {
  email?: string;
  phone?: string;
  realName?: string;
  isActive?: boolean;
}) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw createAppError('用户不存在', 404, 1005);
  }

  // Check unique email
  if (data.email && data.email !== user.email) {
    const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingEmail) {
      throw createAppError('邮箱已存在', 409, 1007);
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      email: data.email,
      phone: data.phone,
      realName: data.realName,
      isActive: data.isActive,
    },
    select: {
      id: true,
      username: true,
      email: true,
      phone: true,
      realName: true,
      isActive: true,
      isGlobal: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updated;
};

/**
 * Delete a user
 */
export const deleteUser = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw createAppError('用户不存在', 404, 1005);
  }

  await prisma.user.delete({ where: { id } });
  return { id };
};

/**
 * Toggle user active status
 */
export const updateUserStatus = async (id: string, isActive: boolean) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw createAppError('用户不存在', 404, 1005);
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive },
    select: {
      id: true,
      username: true,
      isActive: true,
    },
  });

  return updated;
};

/**
 * Reset user password to default
 */
export const resetPassword = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw createAppError('用户不存在', 404, 1005);
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });

  return { id, message: `密码已重置为 ${DEFAULT_PASSWORD}` };
};

export default {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  resetPassword,
};
