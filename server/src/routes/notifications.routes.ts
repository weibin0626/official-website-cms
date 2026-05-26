import { Router } from 'express';
import * as notificationsController from '../controllers/notifications.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Notification routes only require authentication
router.use(authMiddleware);

router.get('/', notificationsController.listNotifications);
router.get('/unread-count', notificationsController.getUnreadCount);
router.put('/read-all', notificationsController.markAllAsRead);
router.put('/:id/read', notificationsController.markAsRead);

export default router;
