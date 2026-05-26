import { PrismaClient } from '@prisma/client';
import { parsePagination, formatPaginatedResponse, PaginatedData, createAppError } from '../utils/helpers';

const prisma = new PrismaClient();

/**
 * Resolve siteId: if not provided, use the first ACTIVE site.
 */
const resolveSiteId = async (siteId?: string): Promise<string> => {
  if (siteId) {
    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site || site.status !== 'ACTIVE') {
      throw createAppError('站点不存在或已停用', 404, 1005);
    }
    return siteId;
  }
  const firstSite = await prisma.site.findFirst({ where: { status: 'ACTIVE' }, orderBy: { createdAt: 'asc' } });
  if (!firstSite) {
    throw createAppError('暂无可用站点', 404, 1005);
  }
  return firstSite.id;
};

/**
 * Get home page data: site info + banners + quick links + featured articles + announcements + leaders + teachers + friend links
 */
export const getSiteHome = async (siteId?: string) => {
  const resolvedSiteId = await resolveSiteId(siteId);

  const [
    site,
    banners,
    quickLinks,
    featuredArticles,
    announcements,
    leaders,
    teachers,
    friendLinks,
    navItems,
  ] = await Promise.all([
    prisma.site.findUnique({ where: { id: resolvedSiteId } }),
    prisma.banner.findMany({ where: { siteId: resolvedSiteId, isActive: true }, orderBy: { sort: 'asc' } }),
    prisma.quickLink.findMany({ where: { siteId: resolvedSiteId, isActive: true }, orderBy: { sort: 'asc' } }),
    // Featured articles (school news) - latest 6 PUBLISHED articles with coverImage
    prisma.article.findMany({
      where: { siteId: resolvedSiteId, status: 'PUBLISHED', coverImage: { not: null } },
      orderBy: { publishedAt: 'desc' },
      take: 6,
      include: { node: { select: { id: true, name: true } } },
    }),
    // Announcements - latest 8 PUBLISHED articles (no cover filter)
    prisma.article.findMany({
      where: { siteId: resolvedSiteId, status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 8,
      include: { node: { select: { id: true, name: true } } },
    }),
    prisma.leader.findMany({ where: { siteId: resolvedSiteId, isActive: true }, orderBy: { sort: 'asc' } }),
    prisma.teacher.findMany({ where: { siteId: resolvedSiteId, isActive: true }, orderBy: { sort: 'asc' } }),
    prisma.friendLink.findMany({ where: { siteId: resolvedSiteId, isActive: true }, orderBy: { sort: 'asc' } }),
    prisma.navItem.findMany({
      where: { siteId: resolvedSiteId, isActive: true },
      orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
    }),
  ]);

  // Build nav tree
  const navTree = buildTree(navItems);

  return {
    site,
    banners,
    quickLinks,
    featuredArticles,
    announcements,
    leaders,
    teachers,
    friendLinks,
    navTree,
  };
};

/**
 * List published articles with pagination, optional nodeId and keyword filters.
 * Increments viewCount for listed articles in a batch (light-weight count).
 */
export const getArticleList = async (
  siteId: string | undefined,
  page: number = 1,
  pageSize: number = 20,
  nodeId?: string,
  keyword?: string,
): Promise<PaginatedData<any>> => {
  const resolvedSiteId = await resolveSiteId(siteId);
  const { skip, take } = parsePagination({ page, pageSize });

  const where: any = { siteId: resolvedSiteId, status: 'PUBLISHED' };
  if (nodeId) {
    where.nodeId = nodeId;
  }
  if (keyword) {
    where.title = { contains: keyword };
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      skip,
      take,
      orderBy: { publishedAt: 'desc' },
      include: {
        node: { select: { id: true, name: true } },
        author: { select: { id: true, realName: true } },
      },
    }),
    prisma.article.count({ where }),
  ]);

  return formatPaginatedResponse(articles, total, page, pageSize);
};

/**
 * Get article detail by ID. Only PUBLISHED articles are accessible.
 * Increments viewCount by 1.
 */
export const getArticleDetail = async (articleId: string) => {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: {
      node: { select: { id: true, name: true, parentId: true } },
      author: { select: { id: true, realName: true } },
    },
  });

  if (!article || article.status !== 'PUBLISHED') {
    throw createAppError('文章不存在或未发布', 404, 1005);
  }

  // Increment view count (fire-and-forget style)
  await prisma.article.update({
    where: { id: articleId },
    data: { viewCount: { increment: 1 } },
  });

  return { ...article, viewCount: article.viewCount + 1 };
};

/**
 * Get related articles (same node, latest N published, excluding current).
 */
export const getArticleRelated = async (articleId: string, limit: number = 5) => {
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) {
    return [];
  }

  const related = await prisma.article.findMany({
    where: {
      siteId: article.siteId,
      nodeId: article.nodeId,
      status: 'PUBLISHED',
      id: { not: articleId },
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
    include: { node: { select: { id: true, name: true } } },
  });

  return related;
};

/**
 * Get prev/next articles for navigation.
 */
export const getArticleNavigation = async (articleId: string, siteId: string) => {
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article || !article.publishedAt) {
    return { prev: null, next: null };
  }

  const [prev, next] = await Promise.all([
    prisma.article.findFirst({
      where: {
        siteId,
        nodeId: article.nodeId,
        status: 'PUBLISHED',
        publishedAt: { lt: article.publishedAt },
      },
      orderBy: { publishedAt: 'desc' },
      select: { id: true, title: true },
    }),
    prisma.article.findFirst({
      where: {
        siteId,
        nodeId: article.nodeId,
        status: 'PUBLISHED',
        publishedAt: { gt: article.publishedAt },
      },
      orderBy: { publishedAt: 'asc' },
      select: { id: true, title: true },
    }),
  ]);

  return { prev, next };
};

/**
 * Get node detail by ID, including child nodes.
 */
export const getNodeDetail = async (nodeId: string) => {
  const node = await prisma.node.findUnique({
    where: { id: nodeId },
    include: {
      children: { where: { isVisible: true }, orderBy: { sort: 'asc' } },
    },
  });
  if (!node) {
    throw createAppError('栏目不存在', 404, 1005);
  }
  return node;
};

/**
 * Get leaders for a site (only isActive).
 */
export const getLeaders = async (siteId?: string) => {
  const resolvedSiteId = await resolveSiteId(siteId);
  return prisma.leader.findMany({
    where: { siteId: resolvedSiteId, isActive: true },
    orderBy: { sort: 'asc' },
  });
};

/**
 * Get teachers for a site (only isActive).
 */
export const getTeachers = async (siteId?: string) => {
  const resolvedSiteId = await resolveSiteId(siteId);
  return prisma.teacher.findMany({
    where: { siteId: resolvedSiteId, isActive: true },
    orderBy: { sort: 'asc' },
  });
};

/**
 * Get banners for a site (only isActive).
 */
export const getBanners = async (siteId?: string) => {
  const resolvedSiteId = await resolveSiteId(siteId);
  return prisma.banner.findMany({
    where: { siteId: resolvedSiteId, isActive: true },
    orderBy: { sort: 'asc' },
  });
};

/**
 * Get quick links for a site (only isActive).
 */
export const getQuickLinks = async (siteId?: string) => {
  const resolvedSiteId = await resolveSiteId(siteId);
  return prisma.quickLink.findMany({
    where: { siteId: resolvedSiteId, isActive: true },
    orderBy: { sort: 'asc' },
  });
};

/**
 * Get friend links for a site (only isActive).
 */
export const getFriendLinks = async (siteId?: string) => {
  const resolvedSiteId = await resolveSiteId(siteId);
  return prisma.friendLink.findMany({
    where: { siteId: resolvedSiteId, isActive: true },
    orderBy: { sort: 'asc' },
  });
};

/**
 * Get nav tree for a site (only isActive).
 */
export const getNavTree = async (siteId?: string) => {
  const resolvedSiteId = await resolveSiteId(siteId);
  const items = await prisma.navItem.findMany({
    where: { siteId: resolvedSiteId, isActive: true },
    orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
  });
  return buildTree(items);
};

/**
 * Build tree structure from flat nav items.
 */
interface NavTreeNode {
  id: string;
  siteId: string;
  parentId: string | null;
  name: string;
  url: string | null;
  icon: string | null;
  sort: number;
  isActive: boolean;
  children: NavTreeNode[];
}

const buildTree = (items: any[]): NavTreeNode[] => {
  const map = new Map<string, NavTreeNode>();
  const roots: NavTreeNode[] = [];

  for (const item of items) {
    map.set(item.id, { ...item, children: [] });
  }

  for (const item of items) {
    const node = map.get(item.id)!;
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
};

export default {
  getSiteHome,
  getArticleList,
  getArticleDetail,
  getArticleRelated,
  getArticleNavigation,
  getNodeDetail,
  getLeaders,
  getTeachers,
  getBanners,
  getQuickLinks,
  getFriendLinks,
  getNavTree,
};
