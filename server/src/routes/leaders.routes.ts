import { Router } from 'express';
import * as leadersController from '../controllers/leaders.controller';
import { authMiddleware } from '../middleware/auth';
import { siteContextMiddleware } from '../middleware/siteContext';
import { rbac } from '../middleware/rbac';
import { auditLog } from '../middleware/auditLog';

const router = Router();

router.use(authMiddleware);
router.use(siteContextMiddleware);

router.get('/', leadersController.listLeaders);

router.post(
  '/',
  rbac('leaders:manage'),
  auditLog({ action: 'CREATE', resource: 'leader' }),
  leadersController.createLeader,
);

router.put(
  '/:id',
  rbac('leaders:manage'),
  auditLog({ action: 'UPDATE', resource: 'leader' }),
  leadersController.updateLeader,
);

router.delete(
  '/:id',
  rbac('leaders:manage'),
  auditLog({ action: 'DELETE', resource: 'leader' }),
  leadersController.deleteLeader,
);

export default router;
