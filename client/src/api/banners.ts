import apiClient from './client';

export interface Banner {
  id: string;
  siteId: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  sort: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerParams {
  title: string;
  imageUrl: string;
  linkUrl?: string;
  sort?: number;
  isActive?: boolean;
}

export interface UpdateBannerParams {
  title?: string;
  imageUrl?: string;
  linkUrl?: string;
  sort?: number;
  isActive?: boolean;
}

export const listBanners = async (): Promise<Banner[]> => {
  const response = await apiClient.get('/banners');
  return response.data.data;
};

export const createBanner = async (data: CreateBannerParams): Promise<Banner> => {
  const response = await apiClient.post('/banners', data);
  return response.data.data;
};

export const updateBanner = async (id: string, data: UpdateBannerParams): Promise<Banner> => {
  const response = await apiClient.put(`/banners/${id}`, data);
  return response.data.data;
};

export const deleteBanner = async (id: string): Promise<void> => {
  await apiClient.delete(`/banners/${id}`);
};

export const sortBanners = async (items: Array<{ id: string; sort: number }>): Promise<void> => {
  await apiClient.put('/banners/sort', { items });
};

export default { listBanners, createBanner, updateBanner, deleteBanner, sortBanners };
