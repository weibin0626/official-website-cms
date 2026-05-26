import { Request, Response, NextFunction } from 'express';
import * as articlesService from '../services/articles.service';
import { successResponse } from '../utils/helpers';

/**
 * GET /api/articles — List articles with pagination and filters
 */
export const listArticles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = req.siteId!;
    const page = parseInt(req.query.page as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
    const status = req.query.status as string | undefined;
    const nodeId = req.query.nodeId as string | undefined;
    const keyword = req.query.keyword as string | undefined;

    const result = await articlesService.listArticles(siteId, page, pageSize, status, nodeId, keyword);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/articles/:id — Get article detail
 */
export const getArticleById = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const article = await articlesService.getArticleById(id);
    res.json(successResponse(article));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/articles — Create a new article
 */
export const createArticle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = req.siteId!;
    const userId = req.userId!;
    const data = {
      siteId,
      nodeId: req.body.nodeId || null,
      authorId: userId,
      title: req.body.title,
      content: req.body.content || '',
      summary: req.body.summary || null,
      coverImage: req.body.coverImage || null,
      status: req.body.status || 'DRAFT',
      sort: req.body.sort ?? 0,
    };
    const article = await articlesService.createArticle(data);
    res.status(201).json(successResponse(article, '创建成功'));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/articles/:id — Update an article
 */
export const updateArticle = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const data = {
      title: req.body.title,
      content: req.body.content,
      summary: req.body.summary,
      coverImage: req.body.coverImage,
      nodeId: req.body.nodeId,
      sort: req.body.sort,
    };
    // Remove undefined fields
    Object.keys(data).forEach((key) => {
      if ((data as any)[key] === undefined) {
        delete (data as any)[key];
      }
    });
    const article = await articlesService.updateArticle(id, data);
    res.json(successResponse(article, '更新成功'));
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/articles/:id — Soft-delete an article (move to recycle bin)
 */
export const deleteArticle = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const siteId = req.siteId!;
    const userId = req.userId;
    await articlesService.deleteArticle(id, siteId, userId);
    res.json(successResponse(null, '删除成功'));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/articles/:id/submit — Submit article for review
 */
export const submitArticle = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const article = await articlesService.submitArticle(id);
    res.json(successResponse(article, '提交审核成功'));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/articles/:id/audit — Audit an article (approve or reject)
 */
export const auditArticle = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;
    const reviewerId = req.userId!;

    if (!action || !['approve', 'reject'].includes(action)) {
      res.status(400).json({ code: 1006, data: null, message: '审核操作无效，必须为 approve 或 reject' });
      return;
    }

    const article = await articlesService.auditArticle(id, action, reviewerId, reason);
    res.json(successResponse(article, action === 'approve' ? '审核通过' : '已退稿'));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/articles/:id/publish — Directly publish an article
 */
export const publishArticle = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const article = await articlesService.publishArticle(id);
    res.json(successResponse(article, '发布成功'));
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/articles/:id/offline — Take an article offline
 */
export const offlineArticle = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const article = await articlesService.offlineArticle(id);
    res.json(successResponse(article, '下线成功'));
  } catch (error) {
    next(error);
  }
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
