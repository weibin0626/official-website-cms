import { Router } from 'express';
import * as auditlogsController from '../controllers/auditlogs.controller';
import { authMiddleware } from '../middleware/auth';
import { siteContextMiddleware } from '../middleware/siteContext';
import { rbac } from '../middleware/rbac';

const router = Router();

router.use(authMiddleware);
router.use(siteContextMiddleware);

router.get(
  '/',
  rbac('auditlogs:read'),
  auditlogsController.listAuditLogs,
);

export default router;
