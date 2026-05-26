import { PrismaClient } from '@prisma/client';
import { createAppError } from '../utils/helpers';

const prisma = new PrismaClient();

/**
 * List quick links for a site, ordered by sort
 */
export const listQuickLinks = async (siteId: string) => {
  const links = await prisma.quickLink.findMany({
    where: { siteId },
    orderBy: { sort: 'asc' },
  });
  return links;
};

/**
 * Create a new quick link
 */
export const createQuickLink = async (data: {
  siteId: string;
  name: string;
  url: string;
  icon?: string;
  sort?: number;
  isActive?: boolean;
}) => {
  const maxSort = await prisma.quickLink.aggregate({
    where: { siteId: data.siteId },
    _max: { sort: true },
  });

  const link = await prisma.quickLink.create({
    data: {
      siteId: data.siteId,
      name: data.name,
      url: data.url,
      icon: data.icon || null,
      sort: data.sort ?? (maxSort._max.sort ?? -1) + 1,
      isActive: data.isActive ?? true,
    },
  });
  return link;
};

/**
 * Update a quick link
 */
export const updateQuickLink = async (
  id: string,
  data: {
    name?: string;
    url?: string;
    icon?: string;
    sort?: number;
    isActive?: boolean;
  },
) => {
  const link = await prisma.quickLink.findUnique({ where: { id } });
  if (!link) {
    throw createAppError('快捷入口不存在', 404, 1005);
  }

  const updated = await prisma.quickLink.update({
    where: { id },
    data,
  });
  return updated;
};

/**
 * Delete a quick link
 */
export const deleteQuickLink = async (id: string) => {
  const link = await prisma.quickLink.findUnique({ where: { id } });
  if (!link) {
    throw createAppError('快捷入口不存在', 404, 1005);
  }

  await prisma.quickLink.delete({ where: { id } });
  return true;
};

export default {
  listQuickLinks,
  createQuickLink,
  updateQuickLink,
  deleteQuickLink,
};
