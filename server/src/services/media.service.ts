import { PrismaClient } from '@prisma/client';
import { parsePagination, formatPaginatedResponse, PaginatedData, createAppError } from '../utils/helpers';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

/**
 * Determine media type from MIME type.
 */
const getMediaType = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  return 'DOCUMENT';
};

/**
 * List media files with pagination and optional MIME type filter.
 */
export const listMedia = async (
  siteId: string,
  page: number = 1,
  pageSize: number = 20,
  mimetype?: string,
): Promise<PaginatedData<any>> => {
  const { skip, take } = parsePagination({ page, pageSize });

  const where: any = { siteId, isDeleted: false };

  if (mimetype) {
    where.mimeType = { startsWith: mimetype };
  }

  const [media, total] = await Promise.all([
    prisma.media.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: { select: { id: true, realName: true, username: true } },
      },
    }),
    prisma.media.count({ where }),
  ]);

  return formatPaginatedResponse(media, total, page, pageSize);
};

/**
 * Get a single media file by ID.
 */
export const getMediaById = async (id: string) => {
  const media = await prisma.media.findUnique({
    where: { id },
    include: {
      uploader: { select: { id: true, realName: true, username: true } },
    },
  });
  if (!media || media.isDeleted) {
    throw createAppError('文件不存在', 404, 1005);
  }
  return media;
};

/**
 * Upload a new media file. Creates a Media database record.
 */
export const uploadMedia = async (
  siteId: string,
  userId: string,
  file: Express.Multer.File,
) => {
  // The upload middleware already saved the file to disk
  // file.path is the full path on disk
  // file.filename is the generated UUID name
  const relativePath = file.path.replace(/\\/g, '/');
  // Build URL path: /uploads/{siteId}/{filename}
  const urlPath = `/uploads/${siteId}/${file.filename}`;

  const media = await prisma.media.create({
    data: {
      siteId,
      uploaderId: userId,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: urlPath,
      type: getMediaType(file.mimetype),
    },
  });

  return media;
};

/**
 * Delete a media file (both physical file and database record).
 */
export const deleteMedia = async (id: string, siteId: string) => {
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) {
    throw createAppError('文件不存在', 404, 1005);
  }
  if (media.siteId !== siteId) {
    throw createAppError('文件不属于当前站点', 400, 1006);
  }

  // Delete the physical file
  try {
    const filePath = path.join(process.cwd(), media.url.replace(/^\//, ''));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error('Failed to delete physical file:', err);
    // Continue with database deletion even if physical file deletion fails
  }

  // Soft delete in database
  const deleted = await prisma.media.update({
    where: { id },
    data: { isDeleted: true },
  });

  return deleted;
};

export default {
  listMedia,
  getMediaById,
  uploadMedia,
  deleteMedia,
};
