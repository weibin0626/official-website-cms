import { Router } from 'express';
import * as mediaController from '../controllers/media.controller';
import { authMiddleware } from '../middleware/auth';
import { siteContextMiddleware } from '../middleware/siteContext';
import { rbac } from '../middleware/rbac';
import { uploadSingle, handleMulterError } from '../middleware/upload';
import { auditLog } from '../middleware/auditLog';

const router = Router();

// All media routes require authentication and site context
router.use(authMiddleware);
router.use(siteContextMiddleware);

// List media — requires media:read
router.get(
  '/',
  rbac('media:read'),
  mediaController.listMedia,
);

// Upload media — requires media:create
router.post(
  '/upload',
  rbac('media:upload'),
  uploadSingle,
  handleMulterError,
  auditLog({ action: 'UPLOAD', resource: 'media' }),
  mediaController.uploadMedia,
);

// Download media — requires media:read
router.get(
  '/:id/download',
  rbac('media:read'),
  mediaController.downloadMedia,
);

// Delete media — requires media:delete
router.delete(
  '/:id',
  rbac('media:delete'),
  auditLog({ action: 'DELETE', resource: 'media' }),
  mediaController.deleteMedia,
);

export default router;
