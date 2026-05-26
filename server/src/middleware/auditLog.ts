import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuditLogConfig {
  action: string;
  resource: string;
  getResourceId?: (req: Request) => string | undefined;
  getDetail?: (req: Request) => string | undefined;
}

/**
 * Audit log middleware factory.
 * Automatically records operations to audit_logs table.
 */
export const auditLog = (config: AuditLogConfig) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Capture the original send method
    const originalSend = res.send;

    res.send = function (data: any): Response {
      // Only log successful operations
      const statusCode = res.statusCode;
      if (statusCode >= 200 && statusCode < 300 && req.userId) {
        const resourceId = config.getResourceId ? config.getResourceId(req) : (req.params as any).id as string | undefined;
        const detail = config.getDetail ? config.getDetail(req) : undefined;

        // Fire and forget - don't block the response
        prisma.auditLog.create({
          data: {
            siteId: req.siteId || null,
            userId: req.userId || null,
            action: config.action,
            resource: config.resource,
            resourceId: resourceId || null,
            detail: detail || null,
            ipAddress: req.ip || req.socket.remoteAddress || null,
            userAgent: req.headers['user-agent'] || null,
          },
        }).catch((err) => {
          console.error('Failed to create audit log:', err);
        });
      }

      return originalSend.call(this, data);
    };

    next();
  };
};

export default auditLog;
