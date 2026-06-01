import apiClient from './client';

export interface QuickLink {
  id: string;
  siteId: string;
  name: string;
  url: string;
  color: string | null;
  icon: string | null;
  sort: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuickLinkParams {
  name: string;
  url: string;
  color?: string;
  icon?: string;
  sort?: number;
  isActive?: boolean;
}

export interface UpdateQuickLinkParams {
  name?: string;
  url?: string;
  color?: string;
  icon?: string;
  sort?: number;
  isActive?: boolean;
}

export const listQuickLinks = async (): Promise<QuickLink[]> => {
  const response = await apiClient.get('/quick-links');
  return response.data.data;
};

export const createQuickLink = async (data: CreateQuickLinkParams): Promise<QuickLink> => {
  const response = await apiClient.post('/quick-links', data);
  return response.data.data;
};

export const updateQuickLink = async (id: string, data: UpdateQuickLinkParams): Promise<QuickLink> => {
  const response = await apiClient.put(`/quick-links/${id}`, data);
  return response.data.data;
};

export const deleteQuickLink = async (id: string): Promise<void> => {
  await apiClient.delete(`/quick-links/${id}`);
};

export default { listQuickLinks, createQuickLink, updateQuickLink, deleteQuickLink };
