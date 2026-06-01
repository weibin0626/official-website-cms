import apiClient from './client';

/** Nav tree node from portal API */
export interface NavTreeNode {
  id: string;
  siteId: string;
  parentId: string | null;
  name: string;
  url: string | null;
  icon: string | null;
  sort: number;
  isActive: boolean;
  children: NavTreeNode[];
}

/** Site info in portal response */
export interface PortalSite {
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
}

/** Article item in portal list */
export interface PortalArticle {
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
  node: { id: string; name: string } | null;
  author: { id: string; realName: string | null } | null;
}

/** Article detail with navigation and related */
export interface PortalArticleDetail extends PortalArticle {
  navigation: {
    prev: { id: string; title: string } | null;
    next: { id: string; title: string } | null;
  };
  related: PortalArticle[];
}

/** Home data response */
export interface HomeData {
  site: PortalSite | null;
  banners: Array<{
    id: string;
    title: string;
    imageUrl: string;
    linkUrl: string | null;
    sort: number;
    isActive: boolean;
  }>;
  quickLinks: Array<{
    id: string;
    name: string;
    url: string;
    icon: string | null;
    sort: number;
  }>;
  featuredArticles: PortalArticle[];
  announcements: PortalArticle[];
  leaders: Array<{
    id: string;
    name: string;
    position: string;
    photo: string | null;
    bio: string | null;
    sort: number;
  }>;
  teachers: Array<{
    id: string;
    name: string;
    title: string | null;
    subject: string | null;
    years: number | null;
    photo: string | null;
    bio: string | null;
    sort: number;
  }>;
  friendLinks: Array<{
    id: string;
    name: string;
    url: string;
    logo: string | null;
    sort: number;
  }>;
  navTree: NavTreeNode[];
}

/** Paginated article list response */
export interface PaginatedArticles {
  list: PortalArticle[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * GET /api/portal/home — Fetch home page data
 * No siteId param: backend resolves site via X-Site-Host header (Scheme B)
 */
export const getHomeData = async (): Promise<HomeData> => {
  const response = await apiClient.get('/portal/home');
  return response.data.data;
};

/**
 * GET /api/portal/articles — Fetch article list
 * No siteId param: backend resolves site via X-Site-Host header
 */
export const getArticleList = async (params: {
  page?: number;
  pageSize?: number;
  nodeId?: string;
  keyword?: string;
}): Promise<PaginatedArticles> => {
  const response = await apiClient.get('/portal/articles', { params });
  return response.data.data;
};

/**
 * GET /api/portal/articles/:id — Fetch article detail
 */
export const getArticleDetail = async (id: string): Promise<PortalArticleDetail> => {
  const response = await apiClient.get(`/portal/articles/${id}`);
  return response.data.data;
};

/**
 * GET /api/portal/nodes/:id — Fetch node detail
 */
export const getNodeDetail = async (id: string): Promise<any> => {
  const response = await apiClient.get(`/portal/nodes/${id}`);
  return response.data.data;
};

/**
 * GET /api/portal/leaders — Fetch leaders
 * No siteId param: backend resolves site via X-Site-Host header
 */
export const getLeaders = async (): Promise<any[]> => {
  const response = await apiClient.get('/portal/leaders');
  return response.data.data;
};

/**
 * GET /api/portal/teachers — Fetch teachers
 * No siteId param: backend resolves site via X-Site-Host header
 */
export const getTeachers = async (): Promise<any[]> => {
  const response = await apiClient.get('/portal/teachers');
  return response.data.data;
};

/**
 * GET /api/portal/banners — Fetch banners
 * No siteId param: backend resolves site via X-Site-Host header
 */
export const getBanners = async (): Promise<any[]> => {
  const response = await apiClient.get('/portal/banners');
  return response.data.data;
};

/**
 * GET /api/portal/quicklinks — Fetch quick links
 * No siteId param: backend resolves site via X-Site-Host header
 */
export const getQuickLinks = async (): Promise<any[]> => {
  const response = await apiClient.get('/portal/quicklinks');
  return response.data.data;
};

/**
 * GET /api/portal/friendlinks — Fetch friend links
 * No siteId param: backend resolves site via X-Site-Host header
 */
export const getFriendLinks = async (): Promise<any[]> => {
  const response = await apiClient.get('/portal/friendlinks');
  return response.data.data;
};

/**
 * GET /api/portal/nav — Fetch navigation tree
 * No siteId param: backend resolves site via X-Site-Host header
 */
export const getNavTree = async (): Promise<NavTreeNode[]> => {
  const response = await apiClient.get('/portal/nav');
  return response.data.data;
};

export default {
  getHomeData,
  getArticleList,
  getArticleDetail,
  getNodeDetail,
  getLeaders,
  getTeachers,
  getBanners,
  getQuickLinks,
  getFriendLinks,
  getNavTree,
};
