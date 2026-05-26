import apiClient from './client';
import type { PaginatedResult } from './users';

export interface RecycleBinItem {
  id: string;
  siteId: string;
  resourceType: string;
  resourceId: string;
  data: string;
  deletedBy: string | null;
  deletedAt: string;
}

export const listRecycleBin = async (params?: { page?: number; pageSize?: number }): Promise<PaginatedResult<RecycleBinItem>> => {
  const response = await apiClient.get('/recycle-bin', { params });
  return response.data.data;
};

export const restoreItem = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.put(`/recycle-bin/${id}/restore`);
  return response.data.data;
};

export const permanentlyDelete = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/recycle-bin/${id}`);
  return response.data.data;
};

export default { listRecycleBin, restoreItem, permanentlyDelete };
