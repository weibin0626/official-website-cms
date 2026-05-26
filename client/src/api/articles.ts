import apiClient from './client';
import type { PaginatedData } from './media';

export interface Article {
  id: string;
  siteId: string;
  nodeId: string | null;
  authorId: string | null;
  title: string;
  content: string;
  summary: string | null;
  coverImage: string | null;
  status: string;
  sort: number;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  node?: { id: string; name: string } | null;
  author?: { id: string; realName: string | null; username: string } | null;
}

export interface ListArticlesParams {
  page?: number;
  pageSize?: number;
  status?: string;
  nodeId?: string;
  keyword?: string;
}

export interface CreateArticleParams {
  nodeId?: string | null;
  title: string;
  content?: string;
  summary?: string;
  coverImage?: string;
  status?: string;
  sort?: number;
}

export interface UpdateArticleParams extends Partial<CreateArticleParams> {}

export interface AuditArticleParams {
  action: 'approve' | 'reject';
  reason?: string;
}

/** List articles with pagination and filters */
export const listArticles = async (params: ListArticlesParams = {}): Promise<PaginatedData<Article>> => {
  const response = await apiClient.get('/articles', { params });
  return response.data.data;
};

/** Get a single article by ID */
export const getArticle = async (id: string): Promise<Article> => {
  const response = await apiClient.get(`/articles/${id}`);
  return response.data.data;
};

/** Create a new article */
export const createArticle = async (data: CreateArticleParams): Promise<Article> => {
  const response = await apiClient.post('/articles', data);
  return response.data.data;
};

/** Update an existing article */
export const updateArticle = async (id: string, data: UpdateArticleParams): Promise<Article> => {
  const response = await apiClient.put(`/articles/${id}`, data);
  return response.data.data;
};

/** Delete (soft) an article */
export const deleteArticle = async (id: string): Promise<void> => {
  await apiClient.delete(`/articles/${id}`);
};

/** Submit article for review */
export const submitArticle = async (id: string): Promise<Article> => {
  const response = await apiClient.put(`/articles/${id}/submit`);
  return response.data.data;
};

/** Audit (approve/reject) an article */
export const auditArticle = async (id: string, data: AuditArticleParams): Promise<Article> => {
  const response = await apiClient.put(`/articles/${id}/audit`, data);
  return response.data.data;
};

/** Directly publish an article */
export const publishArticle = async (id: string): Promise<Article> => {
  const response = await apiClient.put(`/articles/${id}/publish`);
  return response.data.data;
};

/** Take an article offline */
export const offlineArticle = async (id: string): Promise<Article> => {
  const response = await apiClient.put(`/articles/${id}/offline`);
  return response.data.data;
};

export default {
  listArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  submitArticle,
  auditArticle,
  publishArticle,
  offlineArticle,
};
