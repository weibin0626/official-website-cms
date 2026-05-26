import { PrismaClient } from '@prisma/client';
import { createAppError } from '../utils/helpers';

const prisma = new PrismaClient();

interface NavItemNode {
  id: string;
  siteId: string;
  parentId: string | null;
  name: string;
  url: string | null;
  icon: string | null;
  sort: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  children: NavItemNode[];
}

/**
 * Build tree structure from flat nav items
 */
const buildNavTree = (items: any[]): NavItemNode[] => {
  const map = new Map<string, NavItemNode>();
  const roots: NavItemNode[] = [];

  // Create all nodes first
  for (const item of items) {
    map.set(item.id, { ...item, children: [] });
  }

  // Build tree
  for (const item of items) {
    const node = map.get(item.id)!;
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
};

/**
 * List nav items as tree for a site
 */
export const listNavItems = async (siteId: string): Promise<NavItemNode[]> => {
  const items = await prisma.navItem.findMany({
    where: { siteId },
    orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
  });
  return buildNavTree(items);
};

/**
 * Create a new nav item
 */
export const createNavItem = async (data: {
  siteId: string;
  parentId?: string;
  name: string;
  url?: string;
  icon?: string;
  sort?: number;
  isActive?: boolean;
}) => {
  // If parentId provided, verify it exists
  if (data.parentId) {
    const parent = await prisma.navItem.findUnique({ where: { id: data.parentId } });
    if (!parent) {
      throw createAppError('父级导航不存在', 404, 1005);
    }
  }

  // Calculate sort order within siblings
  let sortValue = data.sort;
  if (sortValue === undefined || sortValue === null) {
    const maxSort = await prisma.navItem.aggregate({
      where: {
        siteId: data.siteId,
        parentId: data.parentId || null,
      },
      _max: { sort: true },
    });
    sortValue = (maxSort._max.sort ?? -1) + 1;
  }

  const navItem = await prisma.navItem.create({
    data: {
      siteId: data.siteId,
      parentId: data.parentId || null,
      name: data.name,
      url: data.url || null,
      icon: data.icon || null,
      sort: sortValue,
      isActive: data.isActive ?? true,
    },
  });
  return navItem;
};

/**
 * Update a nav item
 */
export const updateNavItem = async (
  id: string,
  data: {
    name?: string;
    url?: string;
    icon?: string;
    sort?: number;
    isActive?: boolean;
    parentId?: string;
  },
) => {
  const navItem = await prisma.navItem.findUnique({ where: { id } });
  if (!navItem) {
    throw createAppError('导航项不存在', 404, 1005);
  }

  // Prevent circular reference
  if (data.parentId === id) {
    throw createAppError('不能将导航项设为自己的子项', 400, 1006);
  }

  const updated = await prisma.navItem.update({
    where: { id },
    data,
  });
  return updated;
};

/**
 * Delete a nav item and all its children
 */
export const deleteNavItem = async (id: string) => {
  const navItem = await prisma.navItem.findUnique({ where: { id } });
  if (!navItem) {
    throw createAppError('导航项不存在', 404, 1005);
  }

  // Recursively delete children
  const deleteRecursive = async (parentId: string) => {
    const children = await prisma.navItem.findMany({ where: { parentId } });
    for (const child of children) {
      await deleteRecursive(child.id);
    }
    await prisma.navItem.delete({ where: { id: parentId } });
  };

  await deleteRecursive(id);
  return true;
};

/**
 * Sort nav items - accepts array of { id, sort } and updates them
 */
export const sortNavItems = async (items: Array<{ id: string; sort: number }>) => {
  const operations = items.map((item) =>
    prisma.navItem.update({
      where: { id: item.id },
      data: { sort: item.sort },
    }),
  );
  await Promise.all(operations);
  return true;
};

export default {
  listNavItems,
  createNavItem,
  updateNavItem,
  deleteNavItem,
  sortNavItems,
};
