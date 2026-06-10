import bcrypt from 'bcryptjs';
import User from '../../models/User.model';
import Driver from '../../models/Driver.model';
import Booking from '../../models/Booking.model';
import Settings from '../../models/Settings.model';
import { ApiError } from '../../utils/ApiError';
import { sendAdminNotificationEmail } from '../../utils/email';
import { BCRYPT_ROUNDS, MAX_BULK_RECORDS } from '../../config/constants';

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const getDashboardStats = async () => {
  const [totalUsers, totalDrivers, totalBookings, revenueResult] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Driver.countDocuments(),
    Booking.countDocuments(),
    Booking.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
  ]);

  const revenue = (revenueResult[0] as { total?: number } | undefined)?.total ?? 0;

  const recentBookings = await Booking.find()
    .populate('user', 'name email')
    .populate({ path: 'driver', populate: { path: 'user', select: 'name' } })
    .sort('-createdAt')
    .limit(5);

  return { totalUsers, totalDrivers, totalBookings, revenue, recentBookings };
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const getAllUsers = async (page: number, limit: number, search?: string) => {
  const filter: Record<string, unknown> = {};
  if (search) {
    filter['$or'] = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  const skip  = (page - 1) * limit;
  const total = await User.countDocuments(filter);
  const users = await User.find(filter).sort('-createdAt').skip(skip).limit(limit);
  return { users, total };
};

export const getUser = async (id: string) => {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User');
  return user;
};

export const createUser = async (data: {
  name: string; email: string; password: string; phone: string; role?: string;
}) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw ApiError.conflict('Email already registered');
  const hashedPassword = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
  return User.create({ ...data, password: hashedPassword, isEmailVerified: true });
};

export const updateUser = async (id: string, data: {
  name?: string; phone?: string; profilePhoto?: string; isEmailVerified?: boolean; role?: string;
}) => {
  const user = await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!user) throw ApiError.notFound('User');
  return user;
};

export const deleteUser = async (id: string): Promise<void> => {
  await Promise.all([
    User.findByIdAndDelete(id),
    Driver.findOneAndDelete({ user: id }),
  ]);
};

export const bulkUpdateUsers = async (ids: string[], updates: Record<string, unknown>) => {
  if (ids.length > MAX_BULK_RECORDS) throw ApiError.badRequest(`Cannot bulk update more than ${MAX_BULK_RECORDS} records`);
  const result = await User.updateMany({ _id: { $in: ids } }, { $set: updates });
  return { modified: result.modifiedCount };
};

// ─── Drivers ──────────────────────────────────────────────────────────────────

export const getAllDrivers = async (page: number, limit: number, status?: string) => {
  const filter = status ? { status } : {};
  const skip   = (page - 1) * limit;
  const total  = await Driver.countDocuments(filter);
  const drivers = await Driver.find(filter)
    .populate('user', 'name email phone')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);
  return { drivers, total };
};

export const getDriverDetails = async (id: string) => {
  const driver = await Driver.findById(id).populate('user', 'name email phone');
  if (!driver) throw ApiError.notFound('Driver');
  return driver;
};

export const updateDriverStatus = async (id: string, status: string) => {
  const driver = await Driver.findByIdAndUpdate(
    id,
    { status, ...(status === 'active' && { isAvailable: true }) },
    { new: true },
  ).populate('user', 'name email phone');
  if (!driver) throw ApiError.notFound('Driver');
  return driver;
};

export const bulkUpdateDrivers = async (ids: string[], updates: Record<string, unknown>) => {
  if (ids.length > MAX_BULK_RECORDS) throw ApiError.badRequest(`Cannot bulk update more than ${MAX_BULK_RECORDS} records`);
  const result = await Driver.updateMany({ _id: { $in: ids } }, { $set: updates });
  return { modified: result.modifiedCount };
};

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const getAllBookings = async (page: number, limit: number, status?: string) => {
  const filter = status ? { status } : {};
  const skip   = (page - 1) * limit;
  const total  = await Booking.countDocuments(filter);
  const bookings = await Booking.find(filter)
    .populate('user', 'name email')
    .populate({ path: 'driver', populate: { path: 'user', select: 'name email' } })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);
  return { bookings, total };
};

export const updateBookingStatus = async (id: string, status: string) => {
  const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
  if (!booking) throw ApiError.notFound('Booking');
  return booking;
};

// ─── Settings ─────────────────────────────────────────────────────────────────

export const getSettings = () =>
  Settings.findOne({ key: 'global' });

export const updateSettings = async (adminId: string, data: Record<string, unknown>) => {
  return Settings.findOneAndUpdate(
    { key: 'global' },
    { $set: { ...data, updatedBy: adminId } },
    { new: true, upsert: true, runValidators: true },
  );
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const sendBulkNotification = async (target: 'all' | 'users' | 'drivers', title: string, message: string) => {
  const roleMap: Record<string, string> = { users: 'user', drivers: 'driver' };
  const filter = target === 'all' ? {} : { role: roleMap[target] };
  const recipients = await User.find(filter).select('name email').limit(MAX_BULK_RECORDS).lean();

  const results = await Promise.allSettled(
    recipients.map((u) => sendAdminNotificationEmail({ to: u.email, name: u.name, title, message })),
  );

  const sent   = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;
  return { sent, failed, total: recipients.length };
};
