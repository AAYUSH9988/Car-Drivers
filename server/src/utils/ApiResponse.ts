import type { Response } from 'express';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: { message?: string; pagination?: PaginationMeta; [key: string]: unknown },
): Response => {
  return res.status(statusCode).json({
    success: true,
    data,
    ...meta,
  });
};

export const sendCreated = <T>(res: Response, data: T, message?: string): Response =>
  sendSuccess(res, data, 201, message ? { message } : undefined);

export const sendNoContent = (res: Response): Response =>
  res.status(204).send();
