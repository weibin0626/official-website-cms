import { PrismaClient } from '@prisma/client';
import { parsePagination, formatPaginatedResponse, PaginatedData } from '../utils/helpers';

const prisma = new PrismaClient();

/**
 * List notifications for a user with pagination
 */
export const listNotifications = async (
  userId: string,
  page: number = 1,
  pageSize: number = 10,
  isRead?: boolean,
): Promise<PaginatedData<any>> => {
  const where: any = { userId };
  if (isRead !== undefined) {
    where.isRead = isRead;
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.notification.count({ where }),
  ]);

  return formatPaginatedResponse(notifications, total, page, pageSize);
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (id: string, userId: string) => {
  const notification = await prisma.notification.findFirst({
    where: { id, userId },
  });
  if (!notification) {
    return null;
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
  return updated;
};

/**
 * Mark all notifications as read for a user
 */
export const markAllAsRead = async (userId: string) => {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return { count: result.count };
};

/**
 * Get unread notification count for a user
 */
export const getUnreadCount = async (userId: string) => {
  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  });
  return { count };
};

/**
 * Create a new notification (internal service method)
 */
export const createNotification = async (data: {
  siteId?: string;
  userId: string;
  title: string;
  content: string;
  type?: string;
}) => {
  const notification = await prisma.notification.create({
    data: {
      siteId: data.siteId || null,
      userId: data.userId,
      title: data.title,
      content: data.content,
      type: data.type || 'SYSTEM',
    },
  });
  return notification;
};

export default {
  listNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  createNotification,
};
