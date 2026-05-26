import { PrismaClient } from '@prisma/client';
import { parsePagination, formatPaginatedResponse, PaginatedData, createAppError } from '../utils/helpers';

const prisma = new PrismaClient();

/**
 * List recycle bin items for a site with pagination
 */
export const listRecycleBin = async (
  siteId: string,
  page: number = 1,
  pageSize: number = 10,
): Promise<PaginatedData<any>> => {
  const where = { siteId };

  const [items, total] = await Promise.all([
    prisma.recycleBin.findMany({
      where,
      orderBy: { deletedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.recycleBin.count({ where }),
  ]);

  return formatPaginatedResponse(items, total, page, pageSize);
};

/**
 * Restore an item from recycle bin
 */
export const restoreItem = async (id: string) => {
  const item = await prisma.recycleBin.findUnique({ where: { id } });
  if (!item) {
    throw createAppError('回收站记录不存在', 404, 1005);
  }

  const resourceData = JSON.parse(item.data);

  // Restore based on resource type
  switch (item.resourceType) {
    case 'banner':
      await prisma.banner.create({ data: { id: item.resourceId, ...resourceData } });
      break;
    case 'friendLink':
      await prisma.friendLink.create({ data: { id: item.resourceId, ...resourceData } });
      break;
    case 'leader':
      await prisma.leader.create({ data: { id: item.resourceId, ...resourceData } });
      break;
    case 'teacher':
      await prisma.teacher.create({ data: { id: item.resourceId, ...resourceData } });
      break;
    case 'article':
      await prisma.article.create({ data: { id: item.resourceId, ...resourceData } });
      break;
    case 'navItem':
      await prisma.navItem.create({ data: { id: item.resourceId, ...resourceData } });
      break;
    case 'quickLink':
      await prisma.quickLink.create({ data: { id: item.resourceId, ...resourceData } });
      break;
    default:
      throw createAppError(`不支持的资源类型: ${item.resourceType}`, 400, 1006);
  }

  // Remove from recycle bin after successful restore
  await prisma.recycleBin.delete({ where: { id } });
  return { message: '恢复成功' };
};

/**
 * Permanently delete an item from recycle bin
 */
export const permanentlyDelete = async (id: string) => {
  const item = await prisma.recycleBin.findUnique({ where: { id } });
  if (!item) {
    throw createAppError('回收站记录不存在', 404, 1005);
  }

  await prisma.recycleBin.delete({ where: { id } });
  return { message: '已永久删除' };
};

export default {
  listRecycleBin,
  restoreItem,
  permanentlyDelete,
};
