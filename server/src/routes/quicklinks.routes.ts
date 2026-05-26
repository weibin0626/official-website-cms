import { Router } from 'express';
import * as quicklinksController from '../controllers/quicklinks.controller';
import { authMiddleware } from '../middleware/auth';
import { siteContextMiddleware } from '../middleware/siteContext';
import { rbac } from '../middleware/rbac';
import { auditLog } from '../middleware/auditLog';

const router = Router();

router.use(authMiddleware);
router.use(siteContextMiddleware);

router.get('/', quicklinksController.listQuickLinks);

router.post(
  '/',
  rbac('quicklinks:manage'),
  auditLog({ action: 'CREATE', resource: 'quickLink' }),
  quicklinksController.createQuickLink,
);

router.put(
  '/:id',
  rbac('quicklinks:manage'),
  auditLog({ action: 'UPDATE', resource: 'quickLink' }),
  quicklinksController.updateQuickLink,
);

router.delete(
  '/:id',
  rbac('quicklinks:manage'),
  auditLog({ action: 'DELETE', resource: 'quickLink' }),
  quicklinksController.deleteQuickLink,
);

export default router;
