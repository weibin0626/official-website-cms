import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { createAppError } from '../utils/helpers';

const prisma = new PrismaClient();

/**
 * RBAC permission check middleware factory.
 * Usage: rbac('site:read') or rbac(['site:read', 'site:write'])
 *
 * Permission format: resource:action (e.g. "site:read", "article:write")
 * super_admin role bypasses all permission checks.
 */
export const rbac = (requiredPermissions: string | string[]) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!(req as any).userId || !(req as any).roleCode) {
        next(createAppError('未认证', 401, 1003));
        return;
      }

      // super_admin has all permissions
      if ((req as any).roleCode.toLowerCase() === 'super_admin') {
        next();
        return;
      }

      const perms = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

      // Get user's permissions from database
      const siteUser = await prisma.siteUser.findFirst({
        where: { userId: (req as any).userId, siteId: (req as any).siteId },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: { permission: true },
              },
            },
          },
        },
      });

      if (!siteUser) {
        next(createAppError('权限不足', 403, 1004));
        return;
      }

      const userPermissions = siteUser.role.rolePermissions.map((rp) => {
        const p = rp.permission;
        return p.resource ? `${p.module}:${p.action}:${p.resource}` : `${p.module}:${p.action}`;
      });

      // Check if user has ANY of the required permissions
      const hasPermission = perms.some((perm) => {
        return userPermissions.some((up) => {
          // Exact match
          if (up === perm) return true;
          // Wildcard: module:* matches all actions in that module
          const [mod, act] = perm.split(':');
          return up === `${mod}:*` || up === `*:*`;
        });
      });

      if (!hasPermission) {
        next(createAppError('权限不足', 403, 1004));
        return;
      }

      // Attach permissions to request for later use
      (req as any).permissions = userPermissions;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default rbac;
