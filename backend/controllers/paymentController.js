import crypto from 'crypto';
import Razorpay from 'razorpay';
import Booking from '../models/Booking.js';

const isDev = process.env.NODE_ENV === 'development';

// Lazy singleton — defer construction until first call so dotenv.config() has run
let _razorpay = null;
const getRazorpay = () => {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return _razorpay;
};

// POST /api/payments/create-order
// Creates a Razorpay order for a pending booking
export const createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'bookingId is required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.paymentStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'Booking is already paid' });
    }

    const order = await getRazorpay().orders.create({
      amount:   Math.round(booking.totalAmount * 100), // Razorpay uses paise
      currency: 'INR',
      receipt:  booking.bookingReference,
      notes: {
        bookingId: booking._id.toString(),
        userId:    req.user._id.toString(),
      },
    });

    // Persist Razorpay order ID on booking
    await Booking.findByIdAndUpdate(bookingId, {
      razorpayOrderId: order.id,
      paymentMethod:   'Razorpay',
    });

    return res.status(200).json({
      success: true,
      data: {
        orderId:   order.id,
        amount:    order.amount,
        currency:  order.currency,
        keyId:     process.env.RAZORPAY_KEY_ID,
        booking: {
          _id:              booking._id,
          bookingReference: booking.bookingReference,
          totalAmount:      booking.totalAmount,
        }
      }
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    return res.status(500).json({ success: false, message: isDev ? error.message : 'Payment order creation failed' });
  }
};

// POST /api/payments/verify
// Verifies the Razorpay payment signature and marks booking as paid
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
    }

    // Verify signature — HMAC SHA256 of orderId + "|" + paymentId
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed — invalid signature' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Booking.findByIdAndUpdate(bookingId, {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentStatus:     'completed',
      status:            'confirmed',
    });

    return res.status(200).json({
      success: true,
      message: 'Payment verified and booking confirmed',
      data: { paymentId: razorpay_payment_id, bookingId }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({ success: false, message: isDev ? error.message : 'Payment verification failed' });
  }
};

// POST /api/payments/refund/:bookingId
// Admin or system-triggered refund
export const refundPayment = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can initiate refunds' });
    }

    const booking = await Booking.findById(req.params.bookingId).select('+razorpayPaymentId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.paymentMethod !== 'Razorpay' || !booking.razorpayPaymentId) {
      return res.status(400).json({ success: false, message: 'No Razorpay payment found for this booking' });
    }

    if (booking.paymentStatus === 'refunded') {
      return res.status(400).json({ success: false, message: 'Payment already refunded' });
    }

    const refund = await getRazorpay().payments.refund(booking.razorpayPaymentId, {
      amount: Math.round(booking.totalAmount * 100),
      notes: { reason: req.body.reason || 'Booking cancelled' }
    });

    await Booking.findByIdAndUpdate(booking._id, { paymentStatus: 'refunded' });

    return res.status(200).json({
      success: true,
      message: 'Refund initiated successfully',
      data: { refundId: refund.id, amount: booking.totalAmount }
    });
  } catch (error) {
    console.error('Refund error:', error);
    return res.status(500).json({ success: false, message: isDev ? error.message : 'Refund failed' });
  }
};
