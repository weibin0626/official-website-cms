import { Request, Response, NextFunction } from 'express';
import * as usersService from '../services/users.service';
import { successResponse, parsePagination } from '../utils/helpers';

export const listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, pageSize } = parsePagination(req.query as any);
    const search = req.query.search as string | undefined;
    const roleId = req.query.roleId as string | undefined;
    const result = await usersService.listUsers(page, pageSize, search, roleId);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await usersService.getUserById(req.params.id);
    res.json(successResponse(user));
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await usersService.createUser(req.body);
    res.status(201).json(successResponse(user, '用户创建成功'));
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await usersService.updateUser(req.params.id, req.body);
    res.json(successResponse(user, '用户更新成功'));
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    await usersService.deleteUser(req.params.id);
    res.json(successResponse(null, '用户删除成功'));
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { isActive } = req.body;
    const user = await usersService.updateUserStatus(req.params.id, isActive);
    res.json(successResponse(user, isActive ? '用户已启用' : '用户已禁用'));
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await usersService.resetPassword(req.params.id);
    res.json(successResponse(result, '密码重置成功'));
  } catch (error) {
    next(error);
  }
};

export default { listUsers, getUserById, createUser, updateUser, deleteUser, updateUserStatus, resetPassword };
