import apiClient from './client';

export interface PaginatedData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface MediaItem {
  id: string;
  siteId: string;
  uploaderId: string | null;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  type: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  uploader?: { id: string; realName: string | null; username: string } | null;
}

export interface ListMediaParams {
  page?: number;
  pageSize?: number;
  mimetype?: string;
}

/** List media files with pagination and optional MIME type filter */
export const listMedia = async (params: ListMediaParams = {}): Promise<PaginatedData<MediaItem>> => {
  const response = await apiClient.get('/media', { params });
  return response.data.data;
};

/** Upload a file */
export const uploadMedia = async (formData: FormData): Promise<MediaItem> => {
  const response = await apiClient.post('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

/** Delete a media file */
export const deleteMedia = async (id: string): Promise<void> => {
  await apiClient.delete(`/media/${id}`);
};

export default {
  listMedia,
  uploadMedia,
  deleteMedia,
};
