import { Request, Response, NextFunction } from 'express';
import * as friendlinksService from '../services/friendlinks.service';
import { successResponse } from '../utils/helpers';

export const listFriendLinks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = req.siteId!;
    const links = await friendlinksService.listFriendLinks(siteId);
    res.json(successResponse(links));
  } catch (error) {
    next(error);
  }
};

export const createFriendLink = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = req.siteId!;
    const link = await friendlinksService.createFriendLink({
      siteId,
      name: req.body.name,
      url: req.body.url,
      logo: req.body.logo,
      sort: req.body.sort,
      isActive: req.body.isActive,
    });
    res.status(201).json(successResponse(link, '友情链接创建成功'));
  } catch (error) {
    next(error);
  }
};

export const updateFriendLink = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const link = await friendlinksService.updateFriendLink(req.params.id, req.body);
    res.json(successResponse(link, '友情链接更新成功'));
  } catch (error) {
    next(error);
  }
};

export const deleteFriendLink = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    await friendlinksService.deleteFriendLink(req.params.id);
    res.json(successResponse(null, '友情链接删除成功'));
  } catch (error) {
    next(error);
  }
};

export default { listFriendLinks, createFriendLink, updateFriendLink, deleteFriendLink };
