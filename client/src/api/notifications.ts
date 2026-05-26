import apiClient from './client';
import type { PaginatedResult } from './users';

export interface Notification {
  id: string;
  siteId: string | null;
  userId: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListParams {
  page?: number;
  pageSize?: number;
  isRead?: boolean;
}

export const listNotifications = async (params?: NotificationListParams): Promise<PaginatedResult<Notification>> => {
  const response = await apiClient.get('/notifications', { params });
  return response.data.data;
};

export const markAsRead = async (id: string): Promise<Notification> => {
  const response = await apiClient.put(`/notifications/${id}/read`);
  return response.data.data;
};

export const markAllAsRead = async (): Promise<{ count: number }> => {
  const response = await apiClient.put('/notifications/read-all');
  return response.data.data;
};

export const getUnreadCount = async (): Promise<{ count: number }> => {
  const response = await apiClient.get('/notifications/unread-count');
  return response.data.data;
};

export default { listNotifications, markAsRead, markAllAsRead, getUnreadCount };
