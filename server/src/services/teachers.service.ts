import { PrismaClient } from '@prisma/client';
import { createAppError } from '../utils/helpers';

const prisma = new PrismaClient();

/**
 * List teachers for a site, ordered by sort
 */
export const listTeachers = async (siteId: string) => {
  const teachers = await prisma.teacher.findMany({
    where: { siteId },
    orderBy: { sort: 'asc' },
  });
  return teachers;
};

/**
 * Create a new teacher
 */
export const createTeacher = async (data: {
  siteId: string;
  name: string;
  title?: string;
  subject?: string;
  years?: number;
  photo?: string;
  bio?: string;
  sort?: number;
  isActive?: boolean;
}) => {
  const maxSort = await prisma.teacher.aggregate({
    where: { siteId: data.siteId },
    _max: { sort: true },
  });

  const teacher = await prisma.teacher.create({
    data: {
      siteId: data.siteId,
      name: data.name,
      title: data.title || null,
      subject: data.subject || null,
      years: data.years || null,
      photo: data.photo || null,
      bio: data.bio || null,
      sort: data.sort ?? (maxSort._max.sort ?? -1) + 1,
      isActive: data.isActive ?? true,
    },
  });
  return teacher;
};

/**
 * Update a teacher
 */
export const updateTeacher = async (
  id: string,
  data: {
    name?: string;
    title?: string;
    subject?: string;
    years?: number;
    photo?: string;
    bio?: string;
    sort?: number;
    isActive?: boolean;
  },
) => {
  const teacher = await prisma.teacher.findUnique({ where: { id } });
  if (!teacher) {
    throw createAppError('教师不存在', 404, 1005);
  }

  const updated = await prisma.teacher.update({
    where: { id },
    data,
  });
  return updated;
};

/**
 * Delete a teacher
 */
export const deleteTeacher = async (id: string) => {
  const teacher = await prisma.teacher.findUnique({ where: { id } });
  if (!teacher) {
    throw createAppError('教师不存在', 404, 1005);
  }

  await prisma.teacher.delete({ where: { id } });
  return true;
};

export default {
  listTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
};
