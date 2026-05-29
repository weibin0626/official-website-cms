import { Request, Response, NextFunction } from 'express';
import * as sitesService from '../services/sites.service';
import { successResponse } from '../utils/helpers';

export const listSites = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const status = req.query.status as string | undefined;
    const result = await sitesService.listSites({
      userId: (req as any).userId,
      roleCode: (req as any).roleCode,
      page,
      pageSize,
      status,
    });
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const getSiteById = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const site = await sitesService.getSiteById(req.params.id);
    res.json(successResponse(site));
  } catch (error) {
    next(error);
  }
};

export const createSite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const site = await sitesService.createSite(req.body);
    res.status(201).json(successResponse(site, '站点创建成功'));
  } catch (error) {
    next(error);
  }
};

export const updateSite = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const site = await sitesService.updateSite(req.params.id, req.body);
    res.json(successResponse(site, '站点更新成功'));
  } catch (error) {
    next(error);
  }
};

export const deleteSite = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    await sitesService.deleteSite(req.params.id);
    res.json(successResponse(null, '站点删除成功'));
  } catch (error) {
    next(error);
  }
};

export default { listSites, getSiteById, createSite, updateSite, deleteSite };
