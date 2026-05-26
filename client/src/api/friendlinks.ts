import apiClient from './client';

export interface FriendLink {
  id: string;
  siteId: string;
  name: string;
  url: string;
  logo: string | null;
  sort: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFriendLinkParams {
  name: string;
  url: string;
  logo?: string;
  sort?: number;
  isActive?: boolean;
}

export interface UpdateFriendLinkParams {
  name?: string;
  url?: string;
  logo?: string;
  sort?: number;
  isActive?: boolean;
}

export const listFriendLinks = async (): Promise<FriendLink[]> => {
  const response = await apiClient.get('/friend-links');
  return response.data.data;
};

export const createFriendLink = async (data: CreateFriendLinkParams): Promise<FriendLink> => {
  const response = await apiClient.post('/friend-links', data);
  return response.data.data;
};

export const updateFriendLink = async (id: string, data: UpdateFriendLinkParams): Promise<FriendLink> => {
  const response = await apiClient.put(`/friend-links/${id}`, data);
  return response.data.data;
};

export const deleteFriendLink = async (id: string): Promise<void> => {
  await apiClient.delete(`/friend-links/${id}`);
};

export default { listFriendLinks, createFriendLink, updateFriendLink, deleteFriendLink };
