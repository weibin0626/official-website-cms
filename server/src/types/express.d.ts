import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      username?: string;
      roleCode?: string;
      siteIds?: string[];
      currentSiteId?: string;
      siteId?: string;
      permissions?: string[];
    }
  }
}

export {};
