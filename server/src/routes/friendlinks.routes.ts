import { Router } from 'express';
import * as friendlinksController from '../controllers/friendlinks.controller';
import { authMiddleware } from '../middleware/auth';
import { siteContextMiddleware } from '../middleware/siteContext';
import { rbac } from '../middleware/rbac';
import { auditLog } from '../middleware/auditLog';

const router = Router();

router.use(authMiddleware);
router.use(siteContextMiddleware);

router.get('/', friendlinksController.listFriendLinks);

router.post(
  '/',
  rbac('friendlinks:manage'),
  auditLog({ action: 'CREATE', resource: 'friendLink' }),
  friendlinksController.createFriendLink,
);

router.put(
  '/:id',
  rbac('friendlinks:manage'),
  auditLog({ action: 'UPDATE', resource: 'friendLink' }),
  friendlinksController.updateFriendLink,
);

router.delete(
  '/:id',
  rbac('friendlinks:manage'),
  auditLog({ action: 'DELETE', resource: 'friendLink' }),
  friendlinksController.deleteFriendLink,
);

export default router;
