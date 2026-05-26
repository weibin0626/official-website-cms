import { Router } from 'express';
import * as recyclebinController from '../controllers/recyclebin.controller';
import { authMiddleware } from '../middleware/auth';
import { siteContextMiddleware } from '../middleware/siteContext';
import { auditLog } from '../middleware/auditLog';

const router = Router();

// Recycle bin routes only require authentication
router.use(authMiddleware);
router.use(siteContextMiddleware);

router.get('/', recyclebinController.listRecycleBin);

router.put(
  '/:id/restore',
  auditLog({ action: 'RESTORE', resource: 'recycleBin' }),
  recyclebinController.restoreItem,
);

router.delete(
  '/:id',
  auditLog({ action: 'PERMANENT_DELETE', resource: 'recycleBin' }),
  recyclebinController.permanentlyDelete,
);

export default router;
