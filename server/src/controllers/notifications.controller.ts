import { Request, Response, NextFunction } from 'express';
import * as notificationsService from '../services/notifications.service';
import { successResponse, parsePagination } from '../utils/helpers';

export const listNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const { page, pageSize } = parsePagination(req.query as any);
    const isRead = req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined;
    const result = await notificationsService.listNotifications(userId, page, pageSize, isRead);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const notification = await notificationsService.markAsRead(req.params.id, userId);
    res.json(successResponse(notification, '已标记为已读'));
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const result = await notificationsService.markAllAsRead(userId);
    res.json(successResponse(result, '全部标记为已读'));
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const result = await notificationsService.getUnreadCount(userId);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export default { listNotifications, markAsRead, markAllAsRead, getUnreadCount };
