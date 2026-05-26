import { Router } from 'express';
import * as articlesController from '../controllers/articles.controller';
import { authMiddleware } from '../middleware/auth';
import { siteContextMiddleware } from '../middleware/siteContext';
import { rbac } from '../middleware/rbac';
import { auditLog } from '../middleware/auditLog';

const router = Router();

// All article routes require authentication and site context
router.use(authMiddleware);
router.use(siteContextMiddleware);

// List articles — requires articles:read
router.get(
  '/',
  rbac('article:read'),
  articlesController.listArticles,
);

// Get article detail — requires articles:read
router.get(
  '/:id',
  rbac('article:read'),
  articlesController.getArticleById,
);

// Create article — requires articles:create
router.post(
  '/',
  rbac('article:create'),
  auditLog({ action: 'CREATE', resource: 'article' }),
  articlesController.createArticle,
);

// Update article — requires articles:update
router.put(
  '/:id',
  rbac('article:update'),
  auditLog({ action: 'UPDATE', resource: 'article' }),
  articlesController.updateArticle,
);

// Delete article (soft-delete) — requires articles:delete
router.delete(
  '/:id',
  rbac('article:delete'),
  auditLog({ action: 'DELETE', resource: 'article' }),
  articlesController.deleteArticle,
);

// Submit article for review — requires articles:update
router.put(
  '/:id/submit',
  rbac('article:update'),
  auditLog({ action: 'SUBMIT', resource: 'article' }),
  articlesController.submitArticle,
);

// Audit article — requires articles:audit
router.put(
  '/:id/audit',
  rbac('article:review'),
  auditLog({ action: 'AUDIT', resource: 'article' }),
  articlesController.auditArticle,
);

// Publish article — requires articles:publish
router.put(
  '/:id/publish',
  rbac('article:publish'),
  auditLog({ action: 'PUBLISH', resource: 'article' }),
  articlesController.publishArticle,
);

// Offline article — requires articles:publish
router.put(
  '/:id/offline',
  rbac('article:publish'),
  auditLog({ action: 'OFFLINE', resource: 'article' }),
  articlesController.offlineArticle,
);

export default router;
