import apiClient from './client';

export interface Leader {
  id: string;
  siteId: string;
  name: string;
  position: string;
  photo: string | null;
  bio: string | null;
  sort: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaderParams {
  name: string;
  position: string;
  photo?: string;
  bio?: string;
  sort?: number;
  isActive?: boolean;
}

export interface UpdateLeaderParams {
  name?: string;
  position?: string;
  photo?: string;
  bio?: string;
  sort?: number;
  isActive?: boolean;
}

export const listLeaders = async (): Promise<Leader[]> => {
  const response = await apiClient.get('/leaders');
  return response.data.data;
};

export const createLeader = async (data: CreateLeaderParams): Promise<Leader> => {
  const response = await apiClient.post('/leaders', data);
  return response.data.data;
};

export const updateLeader = async (id: string, data: UpdateLeaderParams): Promise<Leader> => {
  const response = await apiClient.put(`/leaders/${id}`, data);
  return response.data.data;
};

export const deleteLeader = async (id: string): Promise<void> => {
  await apiClient.delete(`/leaders/${id}`);
};

export default { listLeaders, createLeader, updateLeader, deleteLeader };
