import { Router } from 'express';
import * as bannersController from '../controllers/banners.controller';
import { authMiddleware } from '../middleware/auth';
import { siteContextMiddleware } from '../middleware/siteContext';
import { rbac } from '../middleware/rbac';
import { auditLog } from '../middleware/auditLog';

const router = Router();

router.use(authMiddleware);
router.use(siteContextMiddleware);

router.get('/', bannersController.listBanners);

router.post(
  '/',
  rbac('banners:manage'),
  auditLog({ action: 'CREATE', resource: 'banner' }),
  bannersController.createBanner,
);

router.put(
  '/sort',
  rbac('banners:manage'),
  auditLog({ action: 'SORT', resource: 'banner' }),
  bannersController.sortBanners,
);

router.put(
  '/:id',
  rbac('banners:manage'),
  auditLog({ action: 'UPDATE', resource: 'banner' }),
  bannersController.updateBanner,
);

router.delete(
  '/:id',
  rbac('banners:manage'),
  auditLog({ action: 'DELETE', resource: 'banner' }),
  bannersController.deleteBanner,
);

export default router;
