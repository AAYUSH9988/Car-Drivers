import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/ApiResponse';
import * as adminService from './admin.service';

// Dashboard
export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await adminService.getDashboardStats();
  sendSuccess(res, stats);
});

// Users
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page   = Number(req.query['page'])  || 1;
  const limit  = Number(req.query['limit']) || 20;
  const search = req.query['search'] as string | undefined;
  const { users, total } = await adminService.getAllUsers(page, limit, search);
  sendSuccess(res, users, 200, { pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.getUser(req.params['id']!);
  sendSuccess(res, user);
});

export const getUserStats = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.getUserStats(req.params['id']!);
  sendSuccess(res, result);
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.createUser(req.body);
  sendCreated(res, user, 'User created successfully');
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.updateUser(req.params['id']!, req.body);
  sendSuccess(res, user, 200, { message: 'User updated successfully' });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await adminService.deleteUser(req.params['id']!);
  sendNoContent(res);
});

export const bulkUpdateUsers = asyncHandler(async (req: Request, res: Response) => {
  const { ids, updates } = req.body as { ids: string[]; updates: Record<string, unknown> };
  const result = await adminService.bulkUpdateUsers(ids, updates);
  sendSuccess(res, result, 200, { message: `${result.modified} users updated` });
});

// Drivers
export const getAllDrivers = asyncHandler(async (req: Request, res: Response) => {
  const page   = Number(req.query['page'])  || 1;
  const limit  = Number(req.query['limit']) || 20;
  const status = req.query['status'] as string | undefined;
  const search = req.query['search'] as string | undefined;
  const { drivers, total } = await adminService.getAllDrivers(page, limit, status, search);
  sendSuccess(res, drivers, 200, { pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
});

export const getDriverDetails = asyncHandler(async (req: Request, res: Response) => {
  const driver = await adminService.getDriverDetails(req.params['id']!);
  sendSuccess(res, driver);
});

export const createDriver = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.createDriver(req.body);
  sendCreated(res, result, 'Driver created successfully');
});

export const updateDriver = asyncHandler(async (req: Request, res: Response) => {
  const driver = await adminService.updateDriver(req.params['id']!, req.body);
  sendSuccess(res, driver, 200, { message: 'Driver updated' });
});

export const deleteDriver = asyncHandler(async (req: Request, res: Response) => {
  await adminService.deleteDriver(req.params['id']!);
  sendNoContent(res);
});

export const getDriverStats = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminService.getDriverStats(req.params['id']!);
  sendSuccess(res, result);
});

export const updateDriverStatus = asyncHandler(async (req: Request, res: Response) => {
  const driver = await adminService.updateDriverStatus(req.params['id']!, req.body.status as string);
  sendSuccess(res, driver, 200, { message: 'Driver status updated' });
});

export const bulkUpdateDrivers = asyncHandler(async (req: Request, res: Response) => {
  const { ids, updates } = req.body as { ids: string[]; updates: Record<string, unknown> };
  const result = await adminService.bulkUpdateDrivers(ids, updates);
  sendSuccess(res, result, 200, { message: `${result.modified} drivers updated` });
});

// Bookings
export const getAllBookings = asyncHandler(async (req: Request, res: Response) => {
  const page   = Number(req.query['page'])  || 1;
  const limit  = Number(req.query['limit']) || 20;
  const status = req.query['status'] as string | undefined;
  const { bookings, total } = await adminService.getAllBookings(page, limit, status);
  sendSuccess(res, bookings, 200, { pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
});

export const getBookingById = asyncHandler(async (req: Request, res: Response) => {
  const booking = await adminService.getBookingById(req.params['id']!);
  sendSuccess(res, booking);
});

export const updateBookingStatus = asyncHandler(async (req: Request, res: Response) => {
  const booking = await adminService.updateBookingStatus(req.params['id']!, req.body.status as string);
  sendSuccess(res, booking, 200, { message: 'Booking status updated' });
});

export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const type   = (req.query['type']   as string) || 'revenue';
  const period = Number(req.query['period']) || 30;
  const data   = await adminService.getAnalytics(type, period);
  sendSuccess(res, data);
});

// Settings
export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await adminService.getSettings();
  sendSuccess(res, settings);
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await adminService.updateSettings(req.user!.id as string, req.body);
  sendSuccess(res, settings, 200, { message: 'Settings updated' });
});

// Export
export const exportData = asyncHandler(async (req: Request, res: Response) => {
  const { type } = req.body as { type: string };
  const data = await adminService.exportData(type);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${type}-export-${Date.now()}.json"`);
  res.status(200).send(JSON.stringify(data, null, 2));
});

// Notifications
export const sendBulkNotification = asyncHandler(async (req: Request, res: Response) => {
  const { target, title, message } = req.body as { target: 'all' | 'users' | 'drivers'; title: string; message: string };
  const result = await adminService.sendBulkNotification(target, title, message);
  sendSuccess(res, result, 200, { message: `Sent ${result.sent}/${result.total} notifications` });
});
