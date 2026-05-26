import apiClient from './client';

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: {
    id: string;
    username: string;
    realName: string | null;
    avatar: string | null;
    email: string | null;
    isGlobal: boolean;
  };
}

export interface CurrentUser {
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
  sites: SiteInfo[];
  currentSiteId: string | null;
  currentRoleCode: string | null;
  permissions: string[];
}

export interface SiteInfo {
  id: string;
  name: string;
  nameCn: string;
  nameEn: string | null;
  primaryColor: string;
  logo: string | null;
  status: string;
  roleId: string;
  roleName: string;
  roleCode: string;
  isDefault: boolean;
}

export const login = async (params: LoginParams): Promise<LoginResult> => {
  const response = await apiClient.post('/auth/login', params);
  return response.data.data;
};

export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

export const getCurrentUser = async (): Promise<CurrentUser> => {
  const response = await apiClient.get('/auth/me');
  return response.data.data;
};

export const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
  await apiClient.put('/auth/password', { oldPassword, newPassword });
};

export default { login, logout, getCurrentUser, changePassword };
