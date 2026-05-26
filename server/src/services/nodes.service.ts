import { PrismaClient } from '@prisma/client';
import { createAppError } from '../utils/helpers';

const prisma = new PrismaClient();

/** TreeNode with nested children for client consumption */
export interface TreeNode {
  id: string;
  siteId: string;
  parentId: string | null;
  name: string;
  code: string | null;
  type: string;
  sort: number;
  isVisible: boolean;
  template: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  children: TreeNode[];
}

/**
 * Build a tree structure from a flat list of Node records.
 */
const buildTree = (nodes: any[]): TreeNode[] => {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  // Create all tree nodes with empty children arrays
  for (const node of nodes) {
    map.set(node.id, { ...node, children: [] });
  }

  // Link children to parents
  for (const node of nodes) {
    const treeNode = map.get(node.id)!;
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(treeNode);
    } else {
      roots.push(treeNode);
    }
  }

  // Sort children by sort order
  const sortChildren = (items: TreeNode[]): TreeNode[] => {
    items.sort((a, b) => a.sort - b.sort);
    for (const item of items) {
      item.children = sortChildren(item.children);
    }
    return items;
  };

  return sortChildren(roots);
};

/**
 * List nodes as a tree structure for the given site.
 */
export const listNodes = async (siteId: string): Promise<TreeNode[]> => {
  const nodes = await prisma.node.findMany({
    where: { siteId },
    orderBy: { sort: 'asc' },
  });
  return buildTree(nodes);
};

/**
 * Get a single node by ID.
 */
export const getNodeById = async (id: string) => {
  const node = await prisma.node.findUnique({
    where: { id },
    include: {
      parent: true,
      children: { orderBy: { sort: 'asc' } },
    },
  });
  if (!node) {
    throw createAppError('栏目不存在', 404, 1005);
  }
  return node;
};

/**
 * Create a new node (column/category).
 */
export const createNode = async (data: {
  siteId: string;
  parentId?: string | null;
  name: string;
  code?: string | null;
  type?: string;
  sort?: number;
  isVisible?: boolean;
  template?: string | null;
  description?: string | null;
}) => {
  // Validate parent exists and belongs to the same site
  if (data.parentId) {
    const parent = await prisma.node.findUnique({ where: { id: data.parentId } });
    if (!parent) {
      throw createAppError('父栏目不存在', 404, 1005);
    }
    if (parent.siteId !== data.siteId) {
      throw createAppError('父栏目不属于当前站点', 400, 1006);
    }
  }

  // Check for duplicate code within the same site
  if (data.code) {
    const existing = await prisma.node.findFirst({
      where: { siteId: data.siteId, code: data.code },
    });
    if (existing) {
      throw createAppError('栏目编码已存在', 409, 1007);
    }
  }

  const node = await prisma.node.create({
    data: {
      siteId: data.siteId,
      parentId: data.parentId || null,
      name: data.name,
      code: data.code || null,
      type: data.type || 'COLUMN',
      sort: data.sort ?? 0,
      isVisible: data.isVisible ?? true,
      template: data.template || null,
      description: data.description || null,
    },
  });

  return node;
};

/**
 * Update an existing node.
 */
export const updateNode = async (
  id: string,
  data: {
    name?: string;
    code?: string | null;
    type?: string;
    sort?: number;
    isVisible?: boolean;
    template?: string | null;
    description?: string | null;
    parentId?: string | null;
  },
) => {
  const node = await prisma.node.findUnique({ where: { id } });
  if (!node) {
    throw createAppError('栏目不存在', 404, 1005);
  }

  // Prevent setting parent to self
  if (data.parentId === id) {
    throw createAppError('不能将自身设为父栏目', 400, 1006);
  }

  // Validate parent exists and belongs to the same site
  if (data.parentId) {
    const parent = await prisma.node.findUnique({ where: { id: data.parentId } });
    if (!parent) {
      throw createAppError('父栏目不存在', 404, 1005);
    }
    if (parent.siteId !== node.siteId) {
      throw createAppError('父栏目不属于当前站点', 400, 1006);
    }

    // Prevent circular reference: check if the new parent is a descendant of this node
    const checkCircular = async (currentId: string): Promise<boolean> => {
      const children = await prisma.node.findMany({
        where: { parentId: currentId },
        select: { id: true },
      });
      for (const child of children) {
        if (child.id === data.parentId) return true;
        if (await checkCircular(child.id)) return true;
      }
      return false;
    };
    const isCircular = await checkCircular(id);
    if (isCircular) {
      throw createAppError('不能将子栏目设为父栏目（循环引用）', 400, 1006);
    }
  }

  // Check for duplicate code
  if (data.code !== undefined && data.code !== null) {
    const existing = await prisma.node.findFirst({
      where: { siteId: node.siteId, code: data.code, id: { not: id } },
    });
    if (existing) {
      throw createAppError('栏目编码已存在', 409, 1007);
    }
  }

  const updated = await prisma.node.update({
    where: { id },
    data,
  });

  return updated;
};

/**
 * Delete a node. Fails if the node has children or associated articles.
 */
export const deleteNode = async (id: string) => {
  const node = await prisma.node.findUnique({
    where: { id },
    include: {
      children: true,
      articles: { take: 1 },
    },
  });

  if (!node) {
    throw createAppError('栏目不存在', 404, 1005);
  }

  if (node.children.length > 0) {
    throw createAppError('该栏目下有子栏目，无法删除', 400, 1006);
  }

  if (node.articles.length > 0) {
    throw createAppError('该栏目下有文章，无法删除', 400, 1006);
  }

  await prisma.node.delete({ where: { id } });
  return { id };
};

/**
 * Batch update sort order for nodes.
 */
export const sortNodes = async (items: { id: string; sort: number; parentId?: string | null }[]) => {
  const updates = items.map((item) =>
    prisma.node.update({
      where: { id: item.id },
      data: {
        sort: item.sort,
        ...(item.parentId !== undefined ? { parentId: item.parentId } : {}),
      },
    }),
  );

  await prisma.$transaction(updates);
  return items;
};

export default {
  listNodes,
  getNodeById,
  createNode,
  updateNode,
  deleteNode,
  sortNodes,
};
