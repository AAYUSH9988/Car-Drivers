import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token';
import { ApiError } from '../utils/ApiError';
import User from '../models/User.model';
import type { IUserDocument } from '../models/User.model';
import type { Role } from '../config/constants';

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}

export const protect = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) throw ApiError.unauthorized('No token provided');

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.id).select('-password');
    if (!user) throw ApiError.unauthorized('User no longer exists');

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(ApiError.unauthorized('Invalid or expired token'));
  }
};

export const authorize = (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role as Role)) {
      return next(ApiError.forbidden(`Role '${req.user?.role}' is not permitted`));
    }
    next();
  };
