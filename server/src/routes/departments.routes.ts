import { Router } from 'express';
import * as departmentsController from '../controllers/departments.controller';
import { authMiddleware } from '../middleware/auth';
import { siteContextMiddleware } from '../middleware/siteContext';
import { rbac } from '../middleware/rbac';
import { auditLog } from '../middleware/auditLog';

const router = Router();

router.use(authMiddleware);
router.use(siteContextMiddleware);

router.get(
  '/',
  rbac(['users:read', 'users:create', 'users:update', 'users:delete']),
  departmentsController.listDepartments,
);

router.post(
  '/',
  rbac(['users:read', 'users:create', 'users:update', 'users:delete']),
  auditLog({ action: 'CREATE', resource: 'department' }),
  departmentsController.createDepartment,
);

router.put(
  '/:id',
  rbac(['users:read', 'users:create', 'users:update', 'users:delete']),
  auditLog({ action: 'UPDATE', resource: 'department' }),
  departmentsController.updateDepartment,
);

router.delete(
  '/:id',
  rbac(['users:read', 'users:create', 'users:update', 'users:delete']),
  auditLog({ action: 'DELETE', resource: 'department' }),
  departmentsController.deleteDepartment,
);

export default router;
