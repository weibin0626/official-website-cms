import { PrismaClient } from '@prisma/client';
import { createAppError } from '../utils/helpers';

const prisma = new PrismaClient();

/**
 * List friend links for a site, ordered by sort
 */
export const listFriendLinks = async (siteId: string) => {
  const links = await prisma.friendLink.findMany({
    where: { siteId },
    orderBy: { sort: 'asc' },
  });
  return links;
};

/**
 * Create a new friend link
 */
export const createFriendLink = async (data: {
  siteId: string;
  name: string;
  url: string;
  logo?: string;
  sort?: number;
  isActive?: boolean;
}) => {
  const maxSort = await prisma.friendLink.aggregate({
    where: { siteId: data.siteId },
    _max: { sort: true },
  });

  const link = await prisma.friendLink.create({
    data: {
      siteId: data.siteId,
      name: data.name,
      url: data.url,
      logo: data.logo || null,
      sort: data.sort ?? (maxSort._max.sort ?? -1) + 1,
      isActive: data.isActive ?? true,
    },
  });
  return link;
};

/**
 * Update a friend link
 */
export const updateFriendLink = async (
  id: string,
  data: {
    name?: string;
    url?: string;
    logo?: string;
    sort?: number;
    isActive?: boolean;
  },
) => {
  const link = await prisma.friendLink.findUnique({ where: { id } });
  if (!link) {
    throw createAppError('友情链接不存在', 404, 1005);
  }

  const updated = await prisma.friendLink.update({
    where: { id },
    data,
  });
  return updated;
};

/**
 * Delete a friend link
 */
export const deleteFriendLink = async (id: string) => {
  const link = await prisma.friendLink.findUnique({ where: { id } });
  if (!link) {
    throw createAppError('友情链接不存在', 404, 1005);
  }

  await prisma.friendLink.delete({ where: { id } });
  return true;
};

export default {
  listFriendLinks,
  createFriendLink,
  updateFriendLink,
  deleteFriendLink,
};
