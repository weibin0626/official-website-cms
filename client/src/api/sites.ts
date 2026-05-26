import apiClient from './client';

export interface Site {
  id: string;
  name: string;
  nameCn: string;
  nameEn: string | null;
  domain: string | null;
  logo: string | null;
  primaryColor: string;
  secondaryColor: string | null;
  phone: string | null;
  address: string | null;
  icp: string | null;
  police: string | null;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSiteParams {
  name: string;
  nameCn: string;
  nameEn?: string;
  domain?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  phone?: string;
  address?: string;
  icp?: string;
  police?: string;
  description?: string;
  status?: string;
}

export interface UpdateSiteParams extends Partial<CreateSiteParams> {}

export const listSites = async (): Promise<Site[]> => {
  const response = await apiClient.get('/sites');
  return response.data.data;
};

export const getSite = async (id: string): Promise<Site> => {
  const response = await apiClient.get(`/sites/${id}`);
  return response.data.data;
};

export const createSite = async (data: CreateSiteParams): Promise<Site> => {
  const response = await apiClient.post('/sites', data);
  return response.data.data;
};

export const updateSite = async (id: string, data: UpdateSiteParams): Promise<Site> => {
  const response = await apiClient.put(`/sites/${id}`, data);
  return response.data.data;
};

export const deleteSite = async (id: string): Promise<void> => {
  await apiClient.delete(`/sites/${id}`);
};

export default { listSites, getSite, createSite, updateSite, deleteSite };
