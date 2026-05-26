import { PrismaClient } from '@prisma/client';
import { parsePagination, formatPaginatedResponse, PaginatedData, createAppError } from '../utils/helpers';
import { sanitize } from '../utils/xss';

const prisma = new PrismaClient();

/** Allowed status transitions */
const STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['PENDING', 'PUBLISHED', 'TRASHED'],
  PENDING: ['PUBLISHED', 'REJECTED', 'TRASHED'],
  REJECTED: ['DRAFT', 'PENDING', 'TRASHED'],
  PUBLISHED: ['OFFLINE', 'TRASHED'],
  OFFLINE: ['DRAFT', 'PUBLISHED', 'TRASHED'],
  TRASHED: [],
};

/**
 * Validate status transition.
 */
const validateStatusTransition = (currentStatus: string, targetStatus: string): void => {
  const allowed = STATUS_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(targetStatus)) {
    throw createAppError(
      `不允许从 ${currentStatus} 转换到 ${targetStatus}`,
      400,
      1006,
    );
  }
};

/**
 * List articles with pagination, status filter, node filter, and keyword search.
 */
export const listArticles = async (
  siteId: string,
  page: number = 1,
  pageSize: number = 10,
  status?: string,
  nodeId?: string,
  keyword?: string,
): Promise<PaginatedData<any>> => {
  const { skip, take } = parsePagination({ page, pageSize });

  const where: any = { siteId };

  if (status) {
    where.status = status;
  }
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
      orderBy: { createdAt: 'desc' },
      include: {
        node: { select: { id: true, name: true } },
        author: { select: { id: true, realName: true, username: true } },
      },
    }),
    prisma.article.count({ where }),
  ]);

  return formatPaginatedResponse(articles, total, page, pageSize);
};

/**
 * Get article by ID.
 */
export const getArticleById = async (id: string) => {
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      node: { select: { id: true, name: true } },
      author: { select: { id: true, realName: true, username: true } },
    },
  });
  if (!article) {
    throw createAppError('文章不存在', 404, 1005);
  }
  return article;
};

/**
 * Create a new article. Content is sanitized for XSS.
 */
export const createArticle = async (data: {
  siteId: string;
  nodeId?: string | null;
  authorId?: string | null;
  title: string;
  content: string;
  summary?: string | null;
  coverImage?: string | null;
  status?: string;
  sort?: number;
}) => {
  // Validate node belongs to the site
  if (data.nodeId) {
    const node = await prisma.node.findUnique({ where: { id: data.nodeId } });
    if (!node || node.siteId !== data.siteId) {
      throw createAppError('栏目不存在或不属于当前站点', 400, 1006);
    }
  }

  const article = await prisma.article.create({
    data: {
      siteId: data.siteId,
      nodeId: data.nodeId || null,
      authorId: data.authorId || null,
      title: data.title,
      content: sanitize(data.content),
      summary: data.summary || null,
      coverImage: data.coverImage || null,
      status: data.status || 'DRAFT',
      sort: data.sort ?? 0,
    },
  });

  return article;
};

/**
 * Update an article. Content is sanitized for XSS.
 */
export const updateArticle = async (
  id: string,
  data: {
    title?: string;
    content?: string;
    summary?: string | null;
    coverImage?: string | null;
    nodeId?: string | null;
    sort?: number;
  },
) => {
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) {
    throw createAppError('文章不存在', 404, 1005);
  }

  // Validate node if changed
  if (data.nodeId !== undefined && data.nodeId) {
    const node = await prisma.node.findUnique({ where: { id: data.nodeId } });
    if (!node || node.siteId !== article.siteId) {
      throw createAppError('栏目不存在或不属于当前站点', 400, 1006);
    }
  }

  const updateData: any = { ...data };
  if (data.content) {
    updateData.content = sanitize(data.content);
  }

  const updated = await prisma.article.update({
    where: { id },
    data: updateData,
  });

  return updated;
};

/**
 * Soft-delete an article by moving it to the recycle bin.
 */
export const deleteArticle = async (id: string, siteId: string, userId?: string) => {
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) {
    throw createAppError('文章不存在', 404, 1005);
  }

  if (article.siteId !== siteId) {
    throw createAppError('文章不属于当前站点', 400, 1006);
  }

  // Create recycle bin record with a snapshot of the article data
  await prisma.recycleBin.create({
    data: {
      siteId: article.siteId,
      resourceType: 'Article',
      resourceId: article.id,
      data: JSON.stringify(article),
      deletedBy: userId || null,
    },
  });

  // Update article status to TRASHED
  const updated = await prisma.article.update({
    where: { id },
    data: { status: 'TRASHED' },
  });

  return updated;
};

/**
 * Submit an article for review (DRAFT → PENDING).
 */
export const submitArticle = async (id: string) => {
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) {
    throw createAppError('文章不存在', 404, 1005);
  }

  validateStatusTransition(article.status, 'PENDING');

  const updated = await prisma.article.update({
    where: { id },
    data: { status: 'PENDING' },
  });

  return updated;
};

/**
 * Audit an article (PENDING → PUBLISHED or REJECTED).
 */
export const auditArticle = async (
  id: string,
  action: 'approve' | 'reject',
  reviewerId: string,
  reason?: string,
) => {
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) {
    throw createAppError('文章不存在', 404, 1005);
  }

  const targetStatus = action === 'approve' ? 'PUBLISHED' : 'REJECTED';
  validateStatusTransition(article.status, targetStatus);

  const updateData: any = { status: targetStatus };
  if (action === 'approve') {
    updateData.publishedAt = new Date();
  }

  const updated = await prisma.article.update({
    where: { id },
    data: updateData,
  });

  return updated;
};

/**
 * Directly publish an article (DRAFT → PUBLISHED).
 */
export const publishArticle = async (id: string) => {
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) {
    throw createAppError('文章不存在', 404, 1005);
  }

  validateStatusTransition(article.status, 'PUBLISHED');

  const updated = await prisma.article.update({
    where: { id },
    data: { status: 'PUBLISHED', publishedAt: new Date() },
  });

  return updated;
};

/**
 * Take an article offline (PUBLISHED → OFFLINE).
 */
export const offlineArticle = async (id: string) => {
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) {
    throw createAppError('文章不存在', 404, 1005);
  }

  validateStatusTransition(article.status, 'OFFLINE');

  const updated = await prisma.article.update({
    where: { id },
    data: { status: 'OFFLINE' },
  });

  return updated;
};

export default {
  listArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  submitArticle,
  auditArticle,
  publishArticle,
  offlineArticle,
};
