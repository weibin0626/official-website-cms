import { Request, Response, NextFunction } from 'express';
import * as auditlogsService from '../services/auditlogs.service';
import { successResponse, parsePagination } from '../utils/helpers';

export const listAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, pageSize } = parsePagination(req.query as any);
    const userId = req.query.userId as string | undefined;
    const action = req.query.action as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const result = await auditlogsService.listLogs(page, pageSize, userId, action, startDate, endDate);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

export default { listAuditLogs };
