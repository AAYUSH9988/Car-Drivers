import { ApiError } from '../../utils/ApiError';
import { uploadToImageKit } from '../../utils/fileUpload';
import * as driversRepo from './drivers.repository';
import Booking from '../../models/Booking.model';
import type { RegisterDriverInput, UpdateDriverInput, DriversQuery } from './drivers.validator';

export const getAllDrivers = (query: DriversQuery) => driversRepo.findAll(query);

export const getDriverById = async (id: string) => {
  const driver = await driversRepo.findById(id);
  if (!driver) throw ApiError.notFound('Driver');
  return driver;
};

export const getDriverAvailability = async (driverId: string) => {
  const driver = await driversRepo.findById(driverId);
  if (!driver) throw ApiError.notFound('Driver');

  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const bookedSlots = await Booking.find({
    driver: driverId,
    status: { $in: ['pending', 'confirmed'] },
    startTime: { $gte: now, $lte: thirtyDaysLater },
  }).select('startTime endTime status').lean();

  return { driverId, isAvailable: driver.isAvailable, bookedSlots };
};

export const getMyDriverProfile = async (userId: string) => {
  const driver = await driversRepo.findByUserId(userId);
  if (!driver) throw ApiError.notFound('Driver profile');
  return driver;
};

export const registerDriver = async (
  userId: string,
  input: RegisterDriverInput,
  files: { license?: Express.Multer.File[]; vehiclePhoto?: Express.Multer.File[]; profilePhoto?: Express.Multer.File[] },
) => {
  const existing = await driversRepo.findByUserId(userId);
  if (existing) throw ApiError.conflict('Driver profile already exists for this account');

  const documents: Record<string, string> = {};

  if (files.license?.[0]) {
    const { url } = await uploadToImageKit(files.license[0].buffer, files.license[0].originalname, 'gopilot/licenses');
    documents['license'] = url;
  } else {
    throw ApiError.badRequest('License document is required');
  }

  if (files.vehiclePhoto?.[0]) {
    const { url } = await uploadToImageKit(files.vehiclePhoto[0].buffer, files.vehiclePhoto[0].originalname, 'gopilot/vehicles');
    documents['vehiclePhoto'] = url;
  }

  if (files.profilePhoto?.[0]) {
    const { url } = await uploadToImageKit(files.profilePhoto[0].buffer, files.profilePhoto[0].originalname, 'gopilot/profiles');
    documents['profilePhoto'] = url;
  }

  const driver = await driversRepo.create({
    user: userId,
    ...input,
    documents,
    status: 'pending',
  });

  return driver;
};

export const updateDriver = async (driverId: string, userId: string, input: UpdateDriverInput) => {
  const driver = await driversRepo.findById(driverId);
  if (!driver) throw ApiError.notFound('Driver');

  const driverUserId = (driver.user as { _id: { toString(): string } })._id?.toString() ?? driver.user.toString();
  if (driverUserId !== userId) throw ApiError.forbidden();

  return driversRepo.updateById(driverId, input);
};
