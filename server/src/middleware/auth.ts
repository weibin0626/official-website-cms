import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import config from '../config';
import { createAppError } from '../utils/helpers';

const prisma = new PrismaClient();

// In-memory cache for domain → siteId (1 min TTL)
const domainCache = new Map<string, { siteId: string; expiry: number }>();
const CACHE_TTL = 60_000;

export interface JwtPayload {
  userId: string;
  username: string;
  roleCode: string;
  siteIds: string[];
  currentSiteId: string;
  iat?: number;
  exp?: number;
}

/**
 * Resolve currentSiteId from Host header.
 * Priority: X-Site-Host header (browser hostname) > Host header > null
 * Returns siteId if Host matches an ACTIVE site domain, otherwise null.
 */
async function resolveSiteByDomain(host: string | undefined): Promise<string | null> {
  if (!host) return null;
  const hostname = host.split(':')[0]; // strip port
  if (hostname === 'localhost' || hostname === '127.0.0.1') return null;

  // Check cache
  const cached = domainCache.get(hostname);
  if (cached && cached.expiry > Date.now()) {
    return cached.siteId;
  }

  // DB lookup: match exact domain or wildcard (*.domain)
  const site = await prisma.site.findFirst({
    where: {
      status: 'ACTIVE',
      domain: { not: null },
      OR: [{ domain: hostname }, { domain: { endsWith: '.' + hostname } }],
    },
    select: { id: true, domain: true },
  });

  if (site && site.domain) {
    domainCache.set(hostname, { siteId: site.id, expiry: Date.now() + CACHE_TTL });
    return site.id;
  }
  return null;
}

// Helper: set user info on req from JWT payload
function setUserInfoFromJwt(req: Request, decoded: JwtPayload) {
  (req as any).userId = decoded.userId;
  (req as any).username = decoded.username;
  (req as any).roleCode = decoded.roleCode;
  (req as any).siteIds = decoded.siteIds;
  // currentSiteId is set by domain resolver (see below)
}

/**
 * Auth middleware – requires valid JWT.
 * Priority: domain resolution > JWT currentSiteId
 */
export const authMiddleware = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createAppError('未提供认证令牌', 401, 1003);
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    setUserInfoFromJwt(req, decoded);

    // Domain resolution: read X-Site-Host first (browser hostname via proxy/API),
    // fallback to Host header
    const domainHeader = (req.headers['x-site-host'] as string) || req.headers.host;
    const domainSiteId = await resolveSiteByDomain(domainHeader);
    if (domainSiteId) {
      (req as any).currentSiteId = domainSiteId;
      (req as any)._resolvedByDomain = true;
    } else {
      (req as any).currentSiteId = decoded.currentSiteId;
    }

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

/**
 * Optional auth – sets user info if token present, but doesn't require it.
 * Priority: domain resolution > JWT currentSiteId > undefined
 */
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    let jwtSiteId: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
      setUserInfoFromJwt(req, decoded);
      jwtSiteId = decoded.currentSiteId;
    }

    // Domain resolution always runs (even without JWT)
    // Read X-Site-Host first (browser hostname), fallback to Host header
    const domainHeader = (req.headers['x-site-host'] as string) || req.headers.host;
    const domainSiteId = await resolveSiteByDomain(domainHeader);
    if (domainSiteId) {
      (req as any).currentSiteId = domainSiteId;
      (req as any)._resolvedByDomain = true;
    } else if (jwtSiteId) {
      (req as any).currentSiteId = jwtSiteId;
    }
  } catch {
    // Ignore errors for optional auth
  }
  next();
};

export default authMiddleware;
