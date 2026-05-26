import apiClient from './client';

export interface Teacher {
  id: string;
  siteId: string;
  name: string;
  title: string | null;
  subject: string | null;
  years: number | null;
  photo: string | null;
  bio: string | null;
  sort: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeacherParams {
  name: string;
  title?: string;
  subject?: string;
  years?: number;
  photo?: string;
  bio?: string;
  sort?: number;
  isActive?: boolean;
}

export interface UpdateTeacherParams {
  name?: string;
  title?: string;
  subject?: string;
  years?: number;
  photo?: string;
  bio?: string;
  sort?: number;
  isActive?: boolean;
}

export const listTeachers = async (): Promise<Teacher[]> => {
  const response = await apiClient.get('/teachers');
  return response.data.data;
};

export const createTeacher = async (data: CreateTeacherParams): Promise<Teacher> => {
  const response = await apiClient.post('/teachers', data);
  return response.data.data;
};

export const updateTeacher = async (id: string, data: UpdateTeacherParams): Promise<Teacher> => {
  const response = await apiClient.put(`/teachers/${id}`, data);
  return response.data.data;
};

export const deleteTeacher = async (id: string): Promise<void> => {
  await apiClient.delete(`/teachers/${id}`);
};

export default { listTeachers, createTeacher, updateTeacher, deleteTeacher };
