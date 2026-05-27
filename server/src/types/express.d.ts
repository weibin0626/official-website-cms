import 'express';

declare module 'express' {
  export interface Request {
    userId?: string;
    username?: string;
    roleCode?: string;
    siteIds?: string[];
    currentSiteId?: string;
    siteId?: string;
    permissions?: string[];
  }
}
