import { Router } from 'express';
import * as usersController from '../controllers/users.controller';
import { authMiddleware } from '../middleware/auth';
import { rbac } from '../middleware/rbac';
import {
  createUserValidation,
  updateUserValidation,
  userIdValidation,
  updateUserStatusValidation,
  resetPasswordValidation,
  paginationValidation,
  validate,
} from '../middleware/validator';
import { auditLog } from '../middleware/auditLog';

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

router.get(
  '/',
  rbac('user:read'),
  paginationValidation,
  validate,
  usersController.listUsers,
);

router.get(
  '/:id',
  rbac('user:read'),
  userIdValidation,
  validate,
  usersController.getUserById,
);

router.post(
  '/',
  rbac('user:create'),
  createUserValidation,
  validate,
  auditLog({ action: 'CREATE', resource: 'user' }),
  usersController.createUser,
);

router.put(
  '/:id',
  rbac('user:update'),
  updateUserValidation,
  validate,
  auditLog({ action: 'UPDATE', resource: 'user' }),
  usersController.updateUser,
);

router.delete(
  '/:id',
  rbac('user:delete'),
  userIdValidation,
  validate,
  auditLog({ action: 'DELETE', resource: 'user' }),
  usersController.deleteUser,
);

router.put(
  '/:id/status',
  rbac('user:update'),
  updateUserStatusValidation,
  validate,
  auditLog({ action: 'UPDATE_STATUS', resource: 'user' }),
  usersController.updateUserStatus,
);

router.post(
  '/:id/reset-password',
  rbac('user:update'),
  resetPasswordValidation,
  validate,
  auditLog({ action: 'RESET_PASSWORD', resource: 'user' }),
  usersController.resetPassword,
);

export default router;
