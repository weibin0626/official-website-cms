import { PrismaClient } from '@prisma/client';
import { createAppError } from '../utils/helpers';

const prisma = new PrismaClient();

interface DepartmentNode {
  id: string;
  siteId: string;
  parentId: string | null;
  name: string;
  code: string | null;
  sort: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  children: DepartmentNode[];
}

/**
 * Build tree structure from flat departments
 */
const buildDeptTree = (items: any[]): DepartmentNode[] => {
  const map = new Map<string, DepartmentNode>();
  const roots: DepartmentNode[] = [];

  for (const item of items) {
    map.set(item.id, { ...item, children: [] });
  }

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
 * List departments as tree for a site
 */
export const listDepartments = async (siteId: string): Promise<DepartmentNode[]> => {
  const departments = await prisma.department.findMany({
    where: { siteId },
    orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
  });
  return buildDeptTree(departments);
};

/**
 * Create a new department
 */
export const createDepartment = async (data: {
  siteId: string;
  parentId?: string;
  name: string;
  code?: string;
  sort?: number;
  description?: string;
}) => {
  if (data.parentId) {
    const parent = await prisma.department.findUnique({ where: { id: data.parentId } });
    if (!parent) {
      throw createAppError('父级部门不存在', 404, 1005);
    }
  }

  let sortValue = data.sort;
  if (sortValue === undefined || sortValue === null) {
    const maxSort = await prisma.department.aggregate({
      where: {
        siteId: data.siteId,
        parentId: data.parentId || null,
      },
      _max: { sort: true },
    });
    sortValue = (maxSort._max.sort ?? -1) + 1;
  }

  const department = await prisma.department.create({
    data: {
      siteId: data.siteId,
      parentId: data.parentId || null,
      name: data.name,
      code: data.code || null,
      sort: sortValue,
      description: data.description || null,
    },
  });
  return department;
};

/**
 * Update a department
 */
export const updateDepartment = async (
  id: string,
  data: {
    name?: string;
    code?: string;
    sort?: number;
    description?: string;
    parentId?: string;
  },
) => {
  const department = await prisma.department.findUnique({ where: { id } });
  if (!department) {
    throw createAppError('部门不存在', 404, 1005);
  }

  if (data.parentId === id) {
    throw createAppError('不能将部门设为自己的子部门', 400, 1006);
  }

  const updated = await prisma.department.update({
    where: { id },
    data,
  });
  return updated;
};

/**
 * Delete a department and all its children
 */
export const deleteDepartment = async (id: string) => {
  const department = await prisma.department.findUnique({ where: { id } });
  if (!department) {
    throw createAppError('部门不存在', 404, 1005);
  }

  const deleteRecursive = async (parentId: string) => {
    const children = await prisma.department.findMany({ where: { parentId } });
    for (const child of children) {
      await deleteRecursive(child.id);
    }
    await prisma.department.delete({ where: { id: parentId } });
  };

  await deleteRecursive(id);
  return true;
};

export default {
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
