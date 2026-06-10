import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  id: string;
}

export const generateAccessToken = (id: string): string =>
  jwt.sign({ id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRE } as jwt.SignOptions);

export const generateRefreshToken = (id: string): string =>
  jwt.sign({ id }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRE } as jwt.SignOptions);

export const verifyAccessToken = (token: string): TokenPayload =>
  jwt.verify(token, env.JWT_SECRET) as TokenPayload;

export const verifyRefreshToken = (token: string): TokenPayload =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
