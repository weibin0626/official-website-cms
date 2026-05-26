import apiClient from './client';

export interface Department {
  id: string;
  siteId: string;
  parentId: string | null;
  name: string;
  code: string | null;
  sort: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  children: Department[];
}

export interface CreateDepartmentParams {
  parentId?: string;
  name: string;
  code?: string;
  sort?: number;
  description?: string;
}

export interface UpdateDepartmentParams {
  name?: string;
  code?: string;
  sort?: number;
  description?: string;
  parentId?: string;
}

export const listDepartments = async (): Promise<Department[]> => {
  const response = await apiClient.get('/departments');
  return response.data.data;
};

export const createDepartment = async (data: CreateDepartmentParams): Promise<Department> => {
  const response = await apiClient.post('/departments', data);
  return response.data.data;
};

export const updateDepartment = async (id: string, data: UpdateDepartmentParams): Promise<Department> => {
  const response = await apiClient.put(`/departments/${id}`, data);
  return response.data.data;
};

export const deleteDepartment = async (id: string): Promise<void> => {
  await apiClient.delete(`/departments/${id}`);
};

export default { listDepartments, createDepartment, updateDepartment, deleteDepartment };
