export interface Site {
  id: string;
  name: string;
  nameCn: string;
  nameEn?: string;
  domain?: string;
  logo?: string;
  primaryColor: string;
  secondaryColor?: string;
  phone?: string;
  address?: string;
  icp?: string;
  police?: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  realName?: string;
  avatar?: string;
  isActive: boolean;
  isGlobal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: string;
  siteId: string;
  nodeId?: string;
  title: string;
  content: string;
  summary?: string;
  coverImage?: string;
  status: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
