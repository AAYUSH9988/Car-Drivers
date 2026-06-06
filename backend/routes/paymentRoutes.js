import express from 'express';
import { createOrder, refundPayment, verifyPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/create-order',           createOrder);
router.post('/verify',                 verifyPayment);
router.post('/refund/:bookingId',      refundPayment);

export default router;
