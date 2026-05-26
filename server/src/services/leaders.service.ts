import { PrismaClient } from '@prisma/client';
import { createAppError } from '../utils/helpers';

const prisma = new PrismaClient();

/**
 * List leaders for a site, ordered by sort
 */
export const listLeaders = async (siteId: string) => {
  const leaders = await prisma.leader.findMany({
    where: { siteId },
    orderBy: { sort: 'asc' },
  });
  return leaders;
};

/**
 * Create a new leader
 */
export const createLeader = async (data: {
  siteId: string;
  name: string;
  position: string;
  photo?: string;
  bio?: string;
  sort?: number;
  isActive?: boolean;
}) => {
  const maxSort = await prisma.leader.aggregate({
    where: { siteId: data.siteId },
    _max: { sort: true },
  });

  const leader = await prisma.leader.create({
    data: {
      siteId: data.siteId,
      name: data.name,
      position: data.position,
      photo: data.photo || null,
      bio: data.bio || null,
      sort: data.sort ?? (maxSort._max.sort ?? -1) + 1,
      isActive: data.isActive ?? true,
    },
  });
  return leader;
};

/**
 * Update a leader
 */
export const updateLeader = async (
  id: string,
  data: {
    name?: string;
    position?: string;
    photo?: string;
    bio?: string;
    sort?: number;
    isActive?: boolean;
  },
) => {
  const leader = await prisma.leader.findUnique({ where: { id } });
  if (!leader) {
    throw createAppError('领导不存在', 404, 1005);
  }

  const updated = await prisma.leader.update({
    where: { id },
    data,
  });
  return updated;
};

/**
 * Delete a leader
 */
export const deleteLeader = async (id: string) => {
  const leader = await prisma.leader.findUnique({ where: { id } });
  if (!leader) {
    throw createAppError('领导不存在', 404, 1005);
  }

  await prisma.leader.delete({ where: { id } });
  return true;
};

export default {
  listLeaders,
  createLeader,
  updateLeader,
  deleteLeader,
};
