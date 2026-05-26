import { Request, Response, NextFunction } from 'express';
import * as navitemsService from '../services/navitems.service';
import { successResponse } from '../utils/helpers';

export const listNavItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = req.siteId!;
    const navItems = await navitemsService.listNavItems(siteId);
    res.json(successResponse(navItems));
  } catch (error) {
    next(error);
  }
};

export const createNavItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = req.siteId!;
    const navItem = await navitemsService.createNavItem({
      siteId,
      parentId: req.body.parentId,
      name: req.body.name,
      url: req.body.url,
      icon: req.body.icon,
      sort: req.body.sort,
      isActive: req.body.isActive,
    });
    res.status(201).json(successResponse(navItem, '导航项创建成功'));
  } catch (error) {
    next(error);
  }
};

export const updateNavItem = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const navItem = await navitemsService.updateNavItem(req.params.id, req.body);
    res.json(successResponse(navItem, '导航项更新成功'));
  } catch (error) {
    next(error);
  }
};

export const deleteNavItem = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    await navitemsService.deleteNavItem(req.params.id);
    res.json(successResponse(null, '导航项删除成功'));
  } catch (error) {
    next(error);
  }
};

export const sortNavItems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await navitemsService.sortNavItems(req.body.items);
    res.json(successResponse(null, '排序更新成功'));
  } catch (error) {
    next(error);
  }
};

export default { listNavItems, createNavItem, updateNavItem, deleteNavItem, sortNavItems };
