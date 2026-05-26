import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

/** Express-validator validation middleware */
export const validate = (req: Request, _res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err: AppError = new Error('参数校验失败');
    err.statusCode = 400;
    err.code = 1006;
    (err as any).details = errors.array();
    next(err);
    return;
  }
  next();
};

/** Common validation rules */
export const loginValidation = [
  body('username').trim().notEmpty().withMessage('用户名不能为空').isLength({ min: 2, max: 50 }).withMessage('用户名长度2-50字符'),
  body('password').notEmpty().withMessage('密码不能为空').isLength({ min: 6, max: 100 }).withMessage('密码长度6-100字符'),
];

export const changePasswordValidation = [
  body('oldPassword').notEmpty().withMessage('原密码不能为空'),
  body('newPassword').notEmpty().withMessage('新密码不能为空').isLength({ min: 6, max: 100 }).withMessage('新密码长度6-100字符'),
];

export const createSiteValidation = [
  body('name').trim().notEmpty().withMessage('站点标识不能为空').isLength({ min: 2, max: 50 }).withMessage('站点标识长度2-50字符'),
  body('nameCn').trim().notEmpty().withMessage('站点中文名不能为空').isLength({ min: 2, max: 100 }).withMessage('站点中文名长度2-100字符'),
  body('nameEn').optional().trim().isLength({ max: 100 }).withMessage('站点英文名最长100字符'),
  body('domain').optional().trim().isLength({ max: 200 }).withMessage('域名最长200字符'),
  body('primaryColor').optional().trim().matches(/^#[0-9a-fA-F]{6}$/).withMessage('主色格式无效'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('状态值无效'),
];

export const updateSiteValidation = [
  param('id').isUUID().withMessage('无效的站点ID'),
  body('nameCn').optional().trim().isLength({ min: 2, max: 100 }).withMessage('站点中文名长度2-100字符'),
  body('nameEn').optional().trim().isLength({ max: 100 }).withMessage('站点英文名最长100字符'),
  body('primaryColor').optional().trim().matches(/^#[0-9a-fA-F]{6}$/).withMessage('主色格式无效'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('状态值无效'),
];

export const createUserValidation = [
  body('username').trim().notEmpty().withMessage('用户名不能为空').isLength({ min: 2, max: 50 }).withMessage('用户名长度2-50字符'),
  body('password').notEmpty().withMessage('密码不能为空').isLength({ min: 6, max: 100 }).withMessage('密码长度6-100字符'),
  body('email').optional().trim().isEmail().withMessage('邮箱格式无效'),
  body('phone').optional().trim().isMobilePhone('zh-CN').withMessage('手机号格式无效'),
  body('realName').optional().trim().isLength({ max: 50 }).withMessage('真实姓名最长50字符'),
  body('isActive').optional().isBoolean().withMessage('isActive必须为布尔值'),
];

export const updateUserValidation = [
  param('id').isUUID().withMessage('无效的用户ID'),
  body('email').optional().trim().isEmail().withMessage('邮箱格式无效'),
  body('phone').optional().trim().isMobilePhone('zh-CN').withMessage('手机号格式无效'),
  body('realName').optional().trim().isLength({ max: 50 }).withMessage('真实姓名最长50字符'),
  body('isActive').optional().isBoolean().withMessage('isActive必须为布尔值'),
];

export const userIdValidation = [
  param('id').isUUID().withMessage('无效的用户ID'),
];

export const siteIdValidation = [
  param('id').isUUID().withMessage('无效的站点ID'),
];

export const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须为正整数'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量1-100'),
];

export const resetPasswordValidation = [
  param('id').isUUID().withMessage('无效的用户ID'),
];

export const updateUserStatusValidation = [
  param('id').isUUID().withMessage('无效的用户ID'),
  body('isActive').isBoolean().withMessage('isActive必须为布尔值'),
];
