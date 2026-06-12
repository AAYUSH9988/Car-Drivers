import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendCreated } from '../../utils/ApiResponse';
import * as driversService from './drivers.service';

export const getAllDrivers = asyncHandler(async (req: Request, res: Response) => {
  const { drivers, total, page, limit, totalPages } = await driversService.getAllDrivers(req.query as never);
  sendSuccess(res, drivers, 200, { pagination: { total, page, limit, totalPages } });
});

export const getDriverById = asyncHandler(async (req: Request, res: Response) => {
  const driver = await driversService.getDriverById(req.params['id']!);
  sendSuccess(res, driver);
});

export const getDriverAvailability = asyncHandler(async (req: Request, res: Response) => {
  const data = await driversService.getDriverAvailability(req.params['id']!);
  sendSuccess(res, data);
});

export const getDriverReviews = asyncHandler(async (req: Request, res: Response) => {
  const page  = Number(req.query['page'])  || 1;
  const limit = Number(req.query['limit']) || 10;
  const data  = await driversService.getDriverReviews(req.params['id']!, page, limit);
  sendSuccess(res, data.reviews, 200, {
    pagination: { total: data.total, page: data.page, limit: data.limit, totalPages: Math.ceil(data.total / data.limit) },
  });
});

export const getMyEarnings = asyncHandler(async (req: Request, res: Response) => {
  const data = await driversService.getMyEarnings(req.user!.id as string);
  sendSuccess(res, data);
});

export const getMyDriverProfile = asyncHandler(async (req: Request, res: Response) => {
  const driver = await driversService.getMyDriverProfile(req.user!.id as string);
  sendSuccess(res, driver);
});

export const registerDriver = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Record<string, Express.Multer.File[]>;
  const driver = await driversService.registerDriver(req.user!.id as string, req.body, files);
  sendCreated(res, driver, 'Driver registration submitted for review');
});

export const updateDriver = asyncHandler(async (req: Request, res: Response) => {
  const driver = await driversService.updateDriver(req.params['id']!, req.user!.id as string, req.body);
  sendSuccess(res, driver, 200, { message: 'Driver profile updated' });
});
