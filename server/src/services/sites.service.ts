import { PrismaClient } from '@prisma/client';
import { createAppError } from '../utils/helpers';

const prisma = new PrismaClient();

/**
 * List sites. Super admin sees all, others see only their associated sites.
 */
export const listSites = async (userId?: string, roleCode?: string) => {
  if (roleCode === 'super_admin' || !userId) {
    return prisma.site.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
  }

  const siteUsers = await prisma.siteUser.findMany({
    where: { userId },
    include: {
      site: true,
    },
  });

  return siteUsers.map((su) => su.site).filter((s) => s && s.status !== 'DELETED');
};

/**
 * Get site by ID
 */
export const getSiteById = async (id: string) => {
  const site = await prisma.site.findUnique({ where: { id } });
  if (!site || site.status === 'DELETED') {
    throw createAppError('站点不存在', 404, 1005);
  }
  return site;
};

/**
 * Create a new site
 */
export const createSite = async (data: {
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
}) => {
  // Check unique name
  const existing = await prisma.site.findUnique({ where: { name: data.name } });
  if (existing) {
    throw createAppError('站点标识已存在', 409, 1007);
  }

  const site = await prisma.site.create({ data });
  return site;
};

/**
 * Update a site
 */
export const updateSite = async (id: string, data: {
  nameCn?: string;
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
}) => {
  const site = await prisma.site.findUnique({ where: { id } });
  if (!site || site.status === 'DELETED') {
    throw createAppError('站点不存在', 404, 1005);
  }

  const updated = await prisma.site.update({
    where: { id },
    data,
  });

  return updated;
};

/**
 * Soft delete a site (set status to INACTIVE)
 */
export const deleteSite = async (id: string) => {
  const site = await prisma.site.findUnique({ where: { id } });
  if (!site || site.status === 'DELETED') {
    throw createAppError('站点不存在', 404, 1005);
  }

  const updated = await prisma.site.update({
    where: { id },
    data: { status: 'INACTIVE' },
  });

  return updated;
};

export default {
  listSites,
  getSiteById,
  createSite,
  updateSite,
  deleteSite,
};
