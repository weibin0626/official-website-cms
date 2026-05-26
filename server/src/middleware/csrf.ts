import { Request, Response, NextFunction } from 'express';
import config from '../config';

const CSRF_TOKEN_HEADER = 'x-csrf-token';
const CSRF_COOKIE_NAME = 'csrf-token';

/**
 * CSRF protection using double-submit cookie pattern.
 * In development mode, CSRF checks can be skipped.
 */
export const csrfMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }

  // Skip in development if configured
  if (config.nodeEnv === 'development') {
    next();
    return;
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_TOKEN_HEADER] as string | undefined;

  if (!cookieToken || !headerToken) {
    res.status(403).json({ code: 1004, data: null, message: '缺少CSRF令牌' });
    return;
  }

  if (cookieToken !== headerToken) {
    res.status(403).json({ code: 1004, data: null, message: 'CSRF令牌验证失败' });
    return;
  }

  next();
};

/** Generate and set CSRF token cookie */
export const generateCsrfToken = (req: Request, res: Response, next: NextFunction): void => {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
  });
  res.locals.csrfToken = token;
  next();
};

export default csrfMiddleware;
