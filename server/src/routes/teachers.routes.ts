import { Router } from 'express';
import * as teachersController from '../controllers/teachers.controller';
import { authMiddleware } from '../middleware/auth';
import { siteContextMiddleware } from '../middleware/siteContext';
import { rbac } from '../middleware/rbac';
import { auditLog } from '../middleware/auditLog';

const router = Router();

router.use(authMiddleware);
router.use(siteContextMiddleware);

router.get('/', teachersController.listTeachers);

router.post(
  '/',
  rbac('teachers:manage'),
  auditLog({ action: 'CREATE', resource: 'teacher' }),
  teachersController.createTeacher,
);

router.put(
  '/:id',
  rbac('teachers:manage'),
  auditLog({ action: 'UPDATE', resource: 'teacher' }),
  teachersController.updateTeacher,
);

router.delete(
  '/:id',
  rbac('teachers:manage'),
  auditLog({ action: 'DELETE', resource: 'teacher' }),
  teachersController.deleteTeacher,
);

export default router;
