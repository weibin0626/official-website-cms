import { PrismaClient } from '@prisma/client';
import { parsePagination, formatPaginatedResponse, PaginatedData, parseDateRange } from '../utils/helpers';

const prisma = new PrismaClient();

/**
 * List audit logs with filters
 */
export const listLogs = async (
  page: number = 1,
  pageSize: number = 10,
  userId?: string,
  action?: string,
  startDate?: string,
  endDate?: string,
): Promise<PaginatedData<any>> => {
  const where: any = {};

  if (userId) {
    where.userId = userId;
  }

  if (action) {
    where.action = { contains: action };
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate);
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, username: true, realName: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return formatPaginatedResponse(logs, total, page, pageSize);
};

/**
 * Create audit log entry
 */
export const createLog = async (data: {
  siteId?: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  detail?: string;
  ipAddress?: string;
  userAgent?: string;
}) => {
  const log = await prisma.auditLog.create({ data });
  return log;
};

export default {
  listLogs,
  createLog,
};
