import { Request, Response, NextFunction } from 'express';
import * as leadersService from '../services/leaders.service';
import { successResponse } from '../utils/helpers';

export const listLeaders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = (req as any).siteId!;
    const leaders = await leadersService.listLeaders(siteId);
    res.json(successResponse(leaders));
  } catch (error) {
    next(error);
  }
};

export const createLeader = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = (req as any).siteId!;
    const leader = await leadersService.createLeader({
      siteId,
      name: req.body.name,
      position: req.body.position,
      photo: req.body.photo,
      bio: req.body.bio,
      sort: req.body.sort,
      isActive: req.body.isActive,
    });
    res.status(201).json(successResponse(leader, '领导创建成功'));
  } catch (error) {
    next(error);
  }
};

export const updateLeader = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const leader = await leadersService.updateLeader(req.params.id, req.body);
    res.json(successResponse(leader, '领导更新成功'));
  } catch (error) {
    next(error);
  }
};

export const deleteLeader = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    await leadersService.deleteLeader(req.params.id);
    res.json(successResponse(null, '领导删除成功'));
  } catch (error) {
    next(error);
  }
};

export default { listLeaders, createLeader, updateLeader, deleteLeader };
