import apiClient from './client';
import type { PaginatedResult } from './users';

export interface AuditLog {
  id: string;
  siteId: string | null;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  detail: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: {
    id: string;
    username: string;
    realName: string | null;
  };
}

export interface AuditLogListParams {
  page?: number;
  pageSize?: number;
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

export const listAuditLogs = async (params?: AuditLogListParams): Promise<PaginatedResult<AuditLog>> => {
  const response = await apiClient.get('/audit-logs', { params });
  return response.data.data;
};

export default { listAuditLogs };
