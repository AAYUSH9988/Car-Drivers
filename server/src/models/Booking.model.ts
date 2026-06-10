import mongoose, { Document, Model, Types } from 'mongoose';
import type { BookingStatus, PaymentStatus, PaymentMethod } from '../config/constants';

export interface IReview {
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface IBooking {
  bookingReference: string;
  user:   Types.ObjectId;
  driver: Types.ObjectId;
  startTime:      Date;
  endTime:        Date;
  pickupLocation: string;
  dropLocation:   string;
  status:         BookingStatus;
  totalAmount:    number;
  platformFee:    number;
  driverEarning:  number;
  paymentMethod:  PaymentMethod;
  paymentStatus:  PaymentStatus;
  razorpayOrderId?:   string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  review?: IReview;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBookingDocument extends IBooking, Document {}

const reviewSchema = new mongoose.Schema<IReview>(
  {
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const bookingSchema = new mongoose.Schema<IBookingDocument>(
  {
    bookingReference: { type: String, unique: true },
    user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    startTime:      { type: Date,   required: true },
    endTime:        { type: Date,   required: true },
    pickupLocation: { type: String, required: true },
    dropLocation:   { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    totalAmount:   { type: Number, required: true, min: 0 },
    platformFee:   { type: Number, default: 0 },
    driverEarning: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ['COD', 'Razorpay', 'Wallet'],
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'refunded', 'failed'],
      default: 'pending',
    },
    razorpayOrderId:   { type: String, select: false },
    razorpayPaymentId: { type: String, select: false },
    razorpaySignature: { type: String, select: false },
    review: reviewSchema,
    notes: { type: String, maxlength: 500 },
  },
  { timestamps: true },
);

bookingSchema.pre('save', function (next) {
  if (!this.bookingReference) {
    const ts   = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.bookingReference = `BK-${ts}-${rand}`;
  }
  next();
});

bookingSchema.index({ user: 1 });
bookingSchema.index({ driver: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ user: 1,   status: 1 });
bookingSchema.index({ driver: 1, status: 1 });
bookingSchema.index({ driver: 1, startTime: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });

const Booking: Model<IBookingDocument> = mongoose.model<IBookingDocument>('Booking', bookingSchema);
export default Booking;
