import Driver from '../../models/Driver.model';
import type { DriversQuery } from './drivers.validator';

export const findAll = async (query: DriversQuery) => {
  const { page, limit, vehicleType, minRate, maxRate, language, isAvailable, search } = query;
  const filter: Record<string, unknown> = { status: 'active' };

  if (vehicleType)                filter['vehicleTypes']  = vehicleType;
  if (language)                   filter['languages']     = language;
  if (isAvailable !== undefined)  filter['isAvailable']   = isAvailable === 'true';
  if (minRate !== undefined || maxRate !== undefined) {
    filter['hourlyRate'] = {
      ...(minRate !== undefined && { $gte: minRate }),
      ...(maxRate !== undefined && { $lte: maxRate }),
    };
  }
  if (search) {
    filter['$or'] = [{ 'vehicleTypes': { $regex: search, $options: 'i' } }];
  }

  const skip  = (page - 1) * limit;
  const total = await Driver.countDocuments(filter);
  const drivers = await Driver.find(filter)
    .populate('user', 'name email profilePhoto')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .lean();

  return { drivers, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const findById = (id: string) =>
  Driver.findById(id).populate('user', 'name email phone profilePhoto');

export const findByUserId = (userId: string) =>
  Driver.findOne({ user: userId }).populate('user', 'name email phone');

export const create = (data: Record<string, unknown>) =>
  Driver.create(data);

export const updateById = (id: string, data: Record<string, unknown>) =>
  Driver.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate('user', 'name email phone profilePhoto');

export const deleteById = (id: string) =>
  Driver.findByIdAndDelete(id);

export const deleteByUserId = (userId: string) =>
  Driver.findOneAndDelete({ user: userId });
