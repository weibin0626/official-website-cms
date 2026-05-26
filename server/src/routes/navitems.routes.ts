import { Router } from 'express';
import * as navitemsController from '../controllers/navitems.controller';
import { authMiddleware } from '../middleware/auth';
import { siteContextMiddleware } from '../middleware/siteContext';
import { rbac } from '../middleware/rbac';
import { auditLog } from '../middleware/auditLog';

const router = Router();

router.use(authMiddleware);
router.use(siteContextMiddleware);

router.get('/', navitemsController.listNavItems);

router.post(
  '/',
  rbac('navitems:manage'),
  auditLog({ action: 'CREATE', resource: 'navItem' }),
  navitemsController.createNavItem,
);

router.put(
  '/sort',
  rbac('navitems:manage'),
  auditLog({ action: 'SORT', resource: 'navItem' }),
  navitemsController.sortNavItems,
);

router.put(
  '/:id',
  rbac('navitems:manage'),
  auditLog({ action: 'UPDATE', resource: 'navItem' }),
  navitemsController.updateNavItem,
);

router.delete(
  '/:id',
  rbac('navitems:manage'),
  auditLog({ action: 'DELETE', resource: 'navItem' }),
  navitemsController.deleteNavItem,
);

export default router;
