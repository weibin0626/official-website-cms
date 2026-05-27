import { Request, Response, NextFunction } from 'express';
import * as departmentsService from '../services/departments.service';
import { successResponse } from '../utils/helpers';

export const listDepartments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = (req as any).siteId!;
    const departments = await departmentsService.listDepartments(siteId);
    res.json(successResponse(departments));
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = (req as any).siteId!;
    const department = await departmentsService.createDepartment({
      siteId,
      parentId: req.body.parentId,
      name: req.body.name,
      code: req.body.code,
      sort: req.body.sort,
      description: req.body.description,
    });
    res.status(201).json(successResponse(department, '部门创建成功'));
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const department = await departmentsService.updateDepartment(req.params.id, req.body);
    res.json(successResponse(department, '部门更新成功'));
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    await departmentsService.deleteDepartment(req.params.id);
    res.json(successResponse(null, '部门删除成功'));
  } catch (error) {
    next(error);
  }
};

export default { listDepartments, createDepartment, updateDepartment, deleteDepartment };
