import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';
import { loginValidation, changePasswordValidation, validate } from '../middleware/validator';

const router = Router();

// Public routes
router.post('/login', loginValidation, validate, authController.login);

// Protected routes
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.getCurrentUser);
router.put('/password', authMiddleware, changePasswordValidation, validate, authController.changePassword);

export default router;
