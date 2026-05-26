import { Router } from 'express';
import * as sitesController from '../controllers/sites.controller';
import { authMiddleware } from '../middleware/auth';
import { siteContextMiddleware } from '../middleware/siteContext';
import { rbac } from '../middleware/rbac';
import { createSiteValidation, updateSiteValidation, siteIdValidation, validate } from '../middleware/validator';
import { auditLog } from '../middleware/auditLog';

const router = Router();

// All site routes require authentication
router.use(authMiddleware);

router.get(
  '/',
  sitesController.listSites,
);

router.get(
  '/:id',
  siteIdValidation,
  validate,
  sitesController.getSiteById,
);

router.post(
  '/',
  rbac('site:create'),
  createSiteValidation,
  validate,
  auditLog({ action: 'CREATE', resource: 'site' }),
  sitesController.createSite,
);

router.put(
  '/:id',
  rbac('site:update'),
  updateSiteValidation,
  validate,
  auditLog({ action: 'UPDATE', resource: 'site' }),
  sitesController.updateSite,
);

router.delete(
  '/:id',
  rbac('site:delete'),
  siteIdValidation,
  validate,
  auditLog({ action: 'DELETE', resource: 'site' }),
  sitesController.deleteSite,
);

export default router;
