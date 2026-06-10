import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/ApiResponse';
import * as paymentsService from './payments.service';

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const data = await paymentsService.createOrder(req.body.bookingId as string, req.user!.id as string);
  sendSuccess(res, data);
});

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const data = await paymentsService.verifyPayment(req.body as Parameters<typeof paymentsService.verifyPayment>[0], req.user!.id as string);
  sendSuccess(res, data, 200, { message: 'Payment verified and booking confirmed' });
});

export const refundPayment = asyncHandler(async (req: Request, res: Response) => {
  const data = await paymentsService.refundPayment(req.params['bookingId']!, req.body.reason as string | undefined);
  sendSuccess(res, data, 200, { message: 'Refund initiated successfully' });
});
