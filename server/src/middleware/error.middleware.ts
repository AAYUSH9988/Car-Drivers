import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorMiddleware = (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof ApiError && err.isOperational) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  // Mongoose CastError (invalid ObjectId)
  if (isMongooseError(err, 'CastError')) {
    res.status(404).json({ success: false, message: 'Resource not found' });
    return;
  }

  // Mongoose duplicate key
  if (isMongoError(err, 11000)) {
    res.status(409).json({ success: false, message: 'A record with that value already exists' });
    return;
  }

  // Mongoose validation error
  if (isMongooseError(err, 'ValidationError')) {
    const messages = Object.values((err as Record<string, unknown>)['errors'] as Record<string, { message: string }>)
      .map((e) => e.message);
    res.status(400).json({ success: false, message: messages.join(', ') });
    return;
  }

  // JWT errors (already caught by auth middleware, but safety net)
  if (err instanceof Error && err.name === 'JsonWebTokenError') {
    res.status(401).json({ success: false, message: 'Invalid token' });
    return;
  }

  // Unexpected errors — never leak internals in production
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    message: env.NODE_ENV === 'development' && err instanceof Error
      ? err.message
      : 'Internal server error',
  });
};

const isMongooseError = (err: unknown, name: string): boolean =>
  typeof err === 'object' && err !== null && (err as { name?: string }).name === name;

const isMongoError = (err: unknown, code: number): boolean =>
  typeof err === 'object' && err !== null && (err as { code?: number }).code === code;
