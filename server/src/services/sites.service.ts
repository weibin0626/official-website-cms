import { PrismaClient, Prisma } from '@prisma/client';
import { createAppError } from '../utils/helpers';

const prisma = new PrismaClient();

interface ListSitesOptions {
  userId?: string;
  roleCode?: string;
  page?: number;
  pageSize?: number;
  status?: string;
}

interface ListSitesResult {
  list: any[];
  total: number;
}

/**
 * List sites with pagination. Super admin sees all, others see only their associated sites.
 */
export const listSites = async (options: ListSitesOptions): Promise<ListSitesResult> => {
  const { userId, roleCode, page = 1, pageSize = 10, status } = options;
  const isSuperAdmin = (roleCode || '').toLowerCase() === 'super_admin';
  console.log(`[listSites] userId=${userId} roleCode=${roleCode} isSuperAdmin=${isSuperAdmin} page=${page} pageSize=${pageSize}`);

  if (isSuperAdmin || !userId) {
    // Super admin sees ALL sites (all statuses), with optional status filter
    const where: Prisma.SiteWhereInput = {};
    if (status) {
      where.status = status;
    }
    const [list, total] = await Promise.all([
      prisma.site.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.site.count({ where }),
    ]);
    return { list, total };
  }

  // Non-super-admin: only return sites associated with the user
  const siteUsers = await prisma.siteUser.findMany({
    where: { userId },
    include: { site: true },
  });

  const allSites = siteUsers.map((su) => su.site).filter(Boolean);
  // In-memory pagination for associated sites
  const start = (page - 1) * pageSize;
  return {
    list: allSites.slice(start, start + pageSize),
    total: allSites.length,
  };
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
