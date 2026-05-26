import { Request, Response, NextFunction } from 'express';
import * as bannersService from '../services/banners.service';
import { successResponse } from '../utils/helpers';

export const listBanners = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = req.siteId!;
    const banners = await bannersService.listBanners(siteId);
    res.json(successResponse(banners));
  } catch (error) {
    next(error);
  }
};

export const createBanner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = req.siteId!;
    const banner = await bannersService.createBanner({
      siteId,
      title: req.body.title,
      imageUrl: req.body.imageUrl,
      linkUrl: req.body.linkUrl,
      sort: req.body.sort,
      isActive: req.body.isActive,
    });
    res.status(201).json(successResponse(banner, '轮播图创建成功'));
  } catch (error) {
    next(error);
  }
};

export const updateBanner = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const banner = await bannersService.updateBanner(req.params.id, req.body);
    res.json(successResponse(banner, '轮播图更新成功'));
  } catch (error) {
    next(error);
  }
};

export const deleteBanner = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    await bannersService.deleteBanner(req.params.id);
    res.json(successResponse(null, '轮播图删除成功'));
  } catch (error) {
    next(error);
  }
};

export const sortBanners = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await bannersService.sortBanners(req.body.items);
    res.json(successResponse(null, '排序更新成功'));
  } catch (error) {
    next(error);
  }
};

export default { listBanners, createBanner, updateBanner, deleteBanner, sortBanners };
