import { Router } from 'express';
import { protect, authorize } from '../../middleware/auth.middleware';
import * as paymentsController from './payments.controller';

const router = Router();

router.use(protect);

router.post('/create-order', paymentsController.createOrder);
router.post('/verify',       paymentsController.verifyPayment);
router.post('/refund/:bookingId', authorize('admin'), paymentsController.refundPayment);

export default router;
