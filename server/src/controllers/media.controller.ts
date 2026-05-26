import { Request, Response, NextFunction } from 'express';
import * as mediaService from '../services/media.service';
import { successResponse } from '../utils/helpers';

/**
 * GET /api/media — List media files with pagination and filters
 */
export const listMedia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = req.siteId!;
    const page = parseInt(req.query.page as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 20;
    const mimetype = req.query.mimetype as string | undefined;

    const result = await mediaService.listMedia(siteId, page, pageSize, mimetype);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/media/upload — Upload a file
 */
export const uploadMedia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = req.siteId!;
    const userId = req.userId!;
    const file = req.file;

    if (!file) {
      res.status(400).json({ code: 1006, data: null, message: '请选择要上传的文件' });
      return;
    }

    const media = await mediaService.uploadMedia(siteId, userId, file);
    res.status(201).json(successResponse(media, '上传成功'));
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/media/:id — Delete a media file
 */
export const deleteMedia = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const siteId = req.siteId!;
    await mediaService.deleteMedia(id, siteId);
    res.json(successResponse(null, '删除成功'));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/media/:id/download — Download a media file
 */
export const downloadMedia = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const media = await mediaService.getMediaById(id);

    // Redirect to the static file URL
    res.redirect(media.url);
  } catch (error) {
    next(error);
  }
};

export default {
  listMedia,
  uploadMedia,
  deleteMedia,
  downloadMedia,
};
