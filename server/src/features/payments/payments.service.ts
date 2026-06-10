import crypto from 'crypto';
import Razorpay from 'razorpay';
import Booking from '../../models/Booking.model';
import { ApiError } from '../../utils/ApiError';
import { env } from '../../config/env';

let _razorpay: InstanceType<typeof Razorpay> | null = null;
const getRazorpay = () => {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id:     env.RAZORPAY_KEY_ID     ?? '',
      key_secret: env.RAZORPAY_KEY_SECRET ?? '',
    });
  }
  return _razorpay;
};

export const createOrder = async (bookingId: string, userId: string) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw ApiError.notFound('Booking');
  if (booking.user.toString() !== userId) throw ApiError.forbidden();
  if (booking.paymentStatus === 'completed') throw ApiError.badRequest('Booking is already paid');

  const order = await getRazorpay().orders.create({
    amount:   Math.round(booking.totalAmount * 100),
    currency: 'INR',
    receipt:  booking.bookingReference,
    notes:    { bookingId: booking._id!.toString(), userId },
  });

  await Booking.findByIdAndUpdate(bookingId, {
    razorpayOrderId: order.id,
    paymentMethod:   'Razorpay',
  });

  return {
    orderId:  order.id,
    amount:   order.amount,
    currency: order.currency,
    keyId:    env.RAZORPAY_KEY_ID,
    booking: {
      _id:              booking._id,
      bookingReference: booking.bookingReference,
      totalAmount:      booking.totalAmount,
    },
  };
};

export const verifyPayment = async (
  payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; bookingId: string },
  userId: string,
) => {
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET ?? '')
    .update(`${payload.razorpay_order_id}|${payload.razorpay_payment_id}`)
    .digest('hex');

  if (expected !== payload.razorpay_signature) {
    throw ApiError.badRequest('Payment verification failed — invalid signature');
  }

  const booking = await Booking.findById(payload.bookingId);
  if (!booking) throw ApiError.notFound('Booking');
  if (booking.user.toString() !== userId) throw ApiError.forbidden();

  await Booking.findByIdAndUpdate(payload.bookingId, {
    razorpayPaymentId: payload.razorpay_payment_id,
    razorpaySignature: payload.razorpay_signature,
    paymentStatus:     'completed',
    status:            'confirmed',
  });

  return { paymentId: payload.razorpay_payment_id, bookingId: payload.bookingId };
};

export const refundPayment = async (bookingId: string, reason?: string) => {
  const booking = await Booking.findById(bookingId).select('+razorpayPaymentId');
  if (!booking) throw ApiError.notFound('Booking');
  if (booking.paymentMethod !== 'Razorpay' || !booking.razorpayPaymentId) {
    throw ApiError.badRequest('No Razorpay payment found for this booking');
  }
  if (booking.paymentStatus === 'refunded') throw ApiError.badRequest('Payment already refunded');

  const refund = await getRazorpay().payments.refund(booking.razorpayPaymentId, {
    amount: Math.round(booking.totalAmount * 100),
    notes:  { reason: reason ?? 'Booking cancelled' },
  });

  await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'refunded' });

  return { refundId: refund.id, amount: booking.totalAmount };
};
