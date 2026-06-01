import { Request, Response, NextFunction } from 'express';
import * as portalService from '../services/portal.service';
import { successResponse } from '../utils/helpers';

/**
 * Get siteId from either domain resolution (req.currentSiteId)
 * or query parameter (?siteId=...). Domain resolution takes priority.
 */
function resolveSiteId(req: Request): string | undefined {
  const fromDomain = (req as any).currentSiteId as string | undefined;
  const fromQuery = req.query.siteId as string | undefined;
  return fromDomain || fromQuery || undefined;
}

/**
 * GET /api/portal/home — Home page data
 */
export const getHome = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = resolveSiteId(req);
    const data = await portalService.getSiteHome(siteId);
    res.json(successResponse(data));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/portal/articles — Article list (public, only PUBLISHED)
 */
export const getArticleList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = resolveSiteId(req);
    const page = parseInt(req.query.page as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 20;
    const nodeId = req.query.nodeId as string | undefined;
    const keyword = req.query.keyword as string | undefined;

    const result = await portalService.getArticleList(siteId, page, pageSize, nodeId, keyword);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/portal/articles/:id — Article detail (viewCount +1)
 */
export const getArticleDetail = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const article = await portalService.getArticleDetail(id);

    // Get prev/next navigation
    let navigation: { prev: { id: string; title: string } | null; next: { id: string; title: string } | null } = { prev: null, next: null };
    try {
      navigation = await portalService.getArticleNavigation(id, article.siteId);
    } catch (_) {
      // Ignore navigation errors
    }

    // Get related articles
    let related: any[] = [];
    try {
      related = await portalService.getArticleRelated(id, 5);
    } catch (_) {
      // Ignore related article errors
    }

    res.json(successResponse({ ...article, navigation, related }));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/portal/nodes/:id — Node detail with children
 */
export const getNodeDetail = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const node = await portalService.getNodeDetail(id);
    res.json(successResponse(node));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/portal/leaders — Leader list
 */
export const getLeaders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = resolveSiteId(req);
    const leaders = await portalService.getLeaders(siteId);
    res.json(successResponse(leaders));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/portal/teachers — Teacher list
 */
export const getTeachers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = resolveSiteId(req);
    const teachers = await portalService.getTeachers(siteId);
    res.json(successResponse(teachers));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/portal/banners — Banner list
 */
export const getBanners = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = resolveSiteId(req);
    const banners = await portalService.getBanners(siteId);
    res.json(successResponse(banners));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/portal/quicklinks — Quick links
 */
export const getQuickLinks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = resolveSiteId(req);
    const links = await portalService.getQuickLinks(siteId);
    res.json(successResponse(links));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/portal/friendlinks — Friend links
 */
export const getFriendLinks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = resolveSiteId(req);
    const links = await portalService.getFriendLinks(siteId);
    res.json(successResponse(links));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/portal/nav — Navigation tree
 */
export const getNavTree = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = resolveSiteId(req);
    const navTree = await portalService.getNavTree(siteId);
    res.json(successResponse(navTree));
  } catch (error) {
    next(error);
  }
};

export default {
  getHome,
  getArticleList,
  getArticleDetail,
  getNodeDetail,
  getLeaders,
  getTeachers,
  getBanners,
  getQuickLinks,
  getFriendLinks,
  getNavTree,
};
