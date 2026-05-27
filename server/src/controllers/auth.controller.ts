import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { successResponse } from '../utils/helpers';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password } = req.body;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const result = await authService.login(username, password, ip);
    res.json(successResponse(result, '登录成功'));
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // @ts-ignore - Custom property added by auth middleware
    const userId = (req as any).userId!;
    await authService.logout(userId);
    res.json(successResponse(null, '登出成功'));
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // @ts-ignore - Custom property added by auth middleware
    const userId = (req as any).userId!;
    const user = await authService.getCurrentUser(userId);
    res.json(successResponse(user));
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // @ts-ignore - Custom property added by auth middleware
    const userId = (req as any).userId!;
    const { oldPassword, newPassword } = req.body;
    await authService.changePassword(userId, oldPassword, newPassword);
    res.json(successResponse(null, '密码修改成功'));
  } catch (error) {
    next(error);
  }
};

export default { login, logout, getCurrentUser, changePassword };
