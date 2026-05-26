import { v4 as uuidv4 } from 'uuid';

/** Generate UUID v4 */
export const generateUUID = (): string => {
  return uuidv4();
};

/** Parse pagination parameters from query string */
export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export const parsePagination = (query: Record<string, any>): PaginationParams => {
  const page = Math.max(1, parseInt(query.page as string, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize as string, 10) || 10));
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
};

/** Format paginated response */
export interface PaginatedData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const formatPaginatedResponse = <T>(
  list: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedData<T> => {
  return {
    list,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

/** Format success response */
export const successResponse = <T>(data: T, message: string = 'success') => {
  return { code: 0, data, message };
};

/** Format error response */
export const errorResponse = (code: number, message: string) => {
  return { code, data: null, message };
};

/** Create an AppError with statusCode and code */
export const createAppError = (message: string, statusCode: number, code: number): Error & { statusCode: number; code: number } => {
  const err: Error & { statusCode: number; code: number } = new Error(message) as any;
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

/** Parse date range from query */
export const parseDateRange = (query: Record<string, any>): { startDate?: Date; endDate?: Date } => {
  const result: { startDate?: Date; endDate?: Date } = {};
  if (query.startDate) {
    result.startDate = new Date(query.startDate as string);
  }
  if (query.endDate) {
    result.endDate = new Date(query.endDate as string);
  }
  return result;
};
