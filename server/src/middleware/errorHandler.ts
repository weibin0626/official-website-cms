import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: number;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 9999;
  const message = err.message || '服务器内部错误';

  console.error(`[Error] ${message}`, err);

  res.status(statusCode).json({
    code,
    data: null,
    message,
  });
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    code: 4040,
    data: null,
    message: '接口不存在',
  });
};
