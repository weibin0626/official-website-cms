import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { createAppError } from '../utils/helpers';

export interface JwtPayload {
  userId: string;
  username: string;
  roleCode: string;
  siteIds: string[];
  currentSiteId: string;
  iat?: number;
  exp?: number;
}

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createAppError('未提供认证令牌', 401, 1003);
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    // @ts-ignore - Custom properties added to Express Request
    (req as any).userId = decoded.userId;
    // @ts-ignore
    (req as any).username = decoded.username;
    // @ts-ignore
    (req as any).roleCode = decoded.roleCode;
    // @ts-ignore
    (req as any).siteIds = decoded.siteIds;
    // @ts-ignore
    (req as any).currentSiteId = decoded.currentSiteId;

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      next(createAppError('Token无效', 401, 1003));
    } else if (error.name === 'TokenExpiredError') {
      next(createAppError('Token已过期', 401, 1003));
    } else {
      next(error);
    }
  }
};

/** Optional auth - sets user info if token present, but doesn't require it */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
      // @ts-ignore - Custom properties added to Express Request
      (req as any).userId = decoded.userId;
      // @ts-ignore
      (req as any).username = decoded.username;
      // @ts-ignore
      (req as any).roleCode = decoded.roleCode;
      // @ts-ignore
      (req as any).siteIds = decoded.siteIds;
      // @ts-ignore
      (req as any).currentSiteId = decoded.currentSiteId;
    }
  } catch {
    // Ignore errors for optional auth
  }
  next();
};

export default authMiddleware;
