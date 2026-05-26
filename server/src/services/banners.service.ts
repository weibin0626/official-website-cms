import { PrismaClient } from '@prisma/client';
import { createAppError } from '../utils/helpers';

const prisma = new PrismaClient();

/**
 * List banners for a site, ordered by sort
 */
export const listBanners = async (siteId: string) => {
  const banners = await prisma.banner.findMany({
    where: { siteId },
    orderBy: { sort: 'asc' },
  });
  return banners;
};

/**
 * Create a new banner
 */
export const createBanner = async (data: {
  siteId: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  sort?: number;
  isActive?: boolean;
}) => {
  // Get max sort for the site
  const maxSort = await prisma.banner.aggregate({
    where: { siteId: data.siteId },
    _max: { sort: true },
  });

  const banner = await prisma.banner.create({
    data: {
      siteId: data.siteId,
      title: data.title,
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl || null,
      sort: data.sort ?? (maxSort._max.sort ?? -1) + 1,
      isActive: data.isActive ?? true,
    },
  });
  return banner;
};

/**
 * Update a banner
 */
export const updateBanner = async (
  id: string,
  data: {
    title?: string;
    imageUrl?: string;
    linkUrl?: string;
    sort?: number;
    isActive?: boolean;
  },
) => {
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) {
    throw createAppError('轮播图不存在', 404, 1005);
  }

  const updated = await prisma.banner.update({
    where: { id },
    data,
  });
  return updated;
};

/**
 * Delete a banner
 */
export const deleteBanner = async (id: string) => {
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) {
    throw createAppError('轮播图不存在', 404, 1005);
  }

  await prisma.banner.delete({ where: { id } });
  return true;
};

/**
 * Sort banners - accepts array of { id, sort } and updates them
 */
export const sortBanners = async (items: Array<{ id: string; sort: number }>) => {
  const operations = items.map((item) =>
    prisma.banner.update({
      where: { id: item.id },
      data: { sort: item.sort },
    }),
  );
  await Promise.all(operations);
  return true;
};

export default {
  listBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  sortBanners,
};
