import { Request, Response, NextFunction } from 'express';
import * as recyclebinService from '../services/recyclebin.service';
import { successResponse, parsePagination } from '../utils/helpers';

export const listRecycleBin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = req.siteId!;
    const { page, pageSize } = parsePagination(req.query as any);
    const result = await recyclebinService.listRecycleBin(siteId, page, pageSize);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const restoreItem = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await recyclebinService.restoreItem(req.params.id);
    res.json(successResponse(result, '恢复成功'));
  } catch (error) {
    next(error);
  }
};

export const permanentlyDelete = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await recyclebinService.permanentlyDelete(req.params.id);
    res.json(successResponse(result, '已永久删除'));
  } catch (error) {
    next(error);
  }
};

export default { listRecycleBin, restoreItem, permanentlyDelete };
