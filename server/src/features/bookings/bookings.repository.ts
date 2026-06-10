import Booking from '../../models/Booking.model';

const POPULATE_OPTS = [
  { path: 'user',   select: 'name email phone' },
  { path: 'driver', populate: { path: 'user', select: 'name email phone' } },
];

export const create = (data: Record<string, unknown>) =>
  Booking.create(data);

export const findById = (id: string) =>
  Booking.findById(id).populate(POPULATE_OPTS);

export const findByUser = (userId: string) =>
  Booking.find({ user: userId }).populate(POPULATE_OPTS).sort('-createdAt');

export const findAll = async (page: number, limit: number) => {
  const skip  = (page - 1) * limit;
  const total = await Booking.countDocuments();
  const bookings = await Booking.find()
    .populate(POPULATE_OPTS)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);
  return { bookings, total };
};

export const updateById = (id: string, data: Record<string, unknown>) =>
  Booking.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate(POPULATE_OPTS);

export const deleteById = (id: string) =>
  Booking.findByIdAndDelete(id);

export const countActiveByDriver = (driverId: string, excludeId?: string) =>
  Booking.countDocuments({
    driver: driverId,
    status: { $in: ['pending', 'confirmed', 'in-progress'] },
    ...(excludeId && { _id: { $ne: excludeId } }),
  });

export const checkConflict = (driverId: string, startTime: Date, endTime: Date, excludeId?: string) =>
  Booking.findOne({
    driver: driverId,
    status: { $in: ['pending', 'confirmed'] },
    startTime: { $lt: endTime },
    endTime:   { $gt: startTime },
    ...(excludeId && { _id: { $ne: excludeId } }),
  });
