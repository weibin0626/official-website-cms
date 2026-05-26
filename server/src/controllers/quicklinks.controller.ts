import { Request, Response, NextFunction } from 'express';
import * as quicklinksService from '../services/quicklinks.service';
import { successResponse } from '../utils/helpers';

export const listQuickLinks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = req.siteId!;
    const links = await quicklinksService.listQuickLinks(siteId);
    res.json(successResponse(links));
  } catch (error) {
    next(error);
  }
};

export const createQuickLink = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = req.siteId!;
    const link = await quicklinksService.createQuickLink({
      siteId,
      name: req.body.name,
      url: req.body.url,
      icon: req.body.icon,
      sort: req.body.sort,
      isActive: req.body.isActive,
    });
    res.status(201).json(successResponse(link, '快捷入口创建成功'));
  } catch (error) {
    next(error);
  }
};

export const updateQuickLink = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const link = await quicklinksService.updateQuickLink(req.params.id, req.body);
    res.json(successResponse(link, '快捷入口更新成功'));
  } catch (error) {
    next(error);
  }
};

export const deleteQuickLink = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    await quicklinksService.deleteQuickLink(req.params.id);
    res.json(successResponse(null, '快捷入口删除成功'));
  } catch (error) {
    next(error);
  }
};

export default { listQuickLinks, createQuickLink, updateQuickLink, deleteQuickLink };
