import apiClient from './client';

export interface NavItem {
  id: string;
  siteId: string;
  parentId: string | null;
  name: string;
  url: string | null;
  icon: string | null;
  sort: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children: NavItem[];
}

export interface CreateNavItemParams {
  parentId?: string;
  name: string;
  url?: string;
  icon?: string;
  sort?: number;
  isActive?: boolean;
}

export interface UpdateNavItemParams {
  name?: string;
  url?: string;
  icon?: string;
  sort?: number;
  isActive?: boolean;
  parentId?: string;
}

export const listNavItems = async (): Promise<NavItem[]> => {
  const response = await apiClient.get('/nav-items');
  return response.data.data;
};

export const createNavItem = async (data: CreateNavItemParams): Promise<NavItem> => {
  const response = await apiClient.post('/nav-items', data);
  return response.data.data;
};

export const updateNavItem = async (id: string, data: UpdateNavItemParams): Promise<NavItem> => {
  const response = await apiClient.put(`/nav-items/${id}`, data);
  return response.data.data;
};

export const deleteNavItem = async (id: string): Promise<void> => {
  await apiClient.delete(`/nav-items/${id}`);
};

export const sortNavItems = async (items: Array<{ id: string; sort: number }>): Promise<void> => {
  await apiClient.put('/nav-items/sort', { items });
};

export default { listNavItems, createNavItem, updateNavItem, deleteNavItem, sortNavItems };
