import { Request, Response, NextFunction } from 'express';
import * as teachersService from '../services/teachers.service';
import { successResponse } from '../utils/helpers';

export const listTeachers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = (req as any).siteId!;
    const teachers = await teachersService.listTeachers(siteId);
    res.json(successResponse(teachers));
  } catch (error) {
    next(error);
  }
};

export const createTeacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const siteId = (req as any).siteId!;
    const teacher = await teachersService.createTeacher({
      siteId,
      name: req.body.name,
      title: req.body.title,
      subject: req.body.subject,
      years: req.body.years,
      photo: req.body.photo,
      bio: req.body.bio,
      sort: req.body.sort,
      isActive: req.body.isActive,
    });
    res.status(201).json(successResponse(teacher, '教师创建成功'));
  } catch (error) {
    next(error);
  }
};

export const updateTeacher = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const teacher = await teachersService.updateTeacher(req.params.id, req.body);
    res.json(successResponse(teacher, '教师更新成功'));
  } catch (error) {
    next(error);
  }
};

export const deleteTeacher = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    await teachersService.deleteTeacher(req.params.id);
    res.json(successResponse(null, '教师删除成功'));
  } catch (error) {
    next(error);
  }
};

export default { listTeachers, createTeacher, updateTeacher, deleteTeacher };
