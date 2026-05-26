import { Request, Response, NextFunction } from 'express';
import { createAppError } from '../utils/helpers';

export const siteContextMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  // Priority: query param > header > JWT currentSiteId
  const querySiteId = req.query.siteId as string | undefined;
  const headerSiteId = req.headers['x-site-id'] as string | undefined;
  const jwtSiteId = req.currentSiteId;

  const siteId = querySiteId || headerSiteId || jwtSiteId;

  if (!siteId) {
    next(createAppError('缺少站点上下文', 400, 1006));
    return;
  }

  // If user is authenticated, verify the siteId is in their allowed sites
  if (req.siteIds && req.siteIds.length > 0 && req.roleCode !== 'super_admin') {
    if (!req.siteIds.includes(siteId)) {
      next(createAppError('无权访问该站点', 403, 1004));
      return;
    }
  }

  req.siteId = siteId;
  next();
};

export default siteContextMiddleware;
