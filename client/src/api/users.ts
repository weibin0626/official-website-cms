import apiClient from './client';

export interface User {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
  realName: string | null;
  avatar: string | null;
  isActive: boolean;
  isGlobal: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  siteUsers?: Array<{
    siteId: string;
    site: { id: string; name: string; nameCn: string };
    role: { id: string; name: string; displayName: string };
    isDefault: boolean;
  }>;
}

export interface UserListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  roleId?: string;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateUserParams {
  username: string;
  password: string;
  email?: string;
  phone?: string;
  realName?: string;
  isActive?: boolean;
  isGlobal?: boolean;
}

export interface UpdateUserParams {
  email?: string;
  phone?: string;
  realName?: string;
  isActive?: boolean;
}

export const listUsers = async (params?: UserListParams): Promise<PaginatedResult<User>> => {
  const response = await apiClient.get('/users', { params });
  return response.data.data;
};

export const getUser = async (id: string): Promise<User> => {
  const response = await apiClient.get(`/users/${id}`);
  return response.data.data;
};

export const createUser = async (data: CreateUserParams): Promise<User> => {
  const response = await apiClient.post('/users', data);
  return response.data.data;
};

export const updateUser = async (id: string, data: UpdateUserParams): Promise<User> => {
  const response = await apiClient.put(`/users/${id}`, data);
  return response.data.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await apiClient.delete(`/users/${id}`);
};

export const updateUserStatus = async (id: string, isActive: boolean): Promise<User> => {
  const response = await apiClient.put(`/users/${id}/status`, { isActive });
  return response.data.data;
};

export const resetPassword = async (id: string): Promise<{ id: string; message: string }> => {
  const response = await apiClient.post(`/users/${id}/reset-password`);
  return response.data.data;
};

export default { listUsers, getUser, createUser, updateUser, deleteUser, updateUserStatus, resetPassword };
