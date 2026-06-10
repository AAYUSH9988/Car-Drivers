import User from '../../models/User.model';
import type { IUserDocument } from '../../models/User.model';

export const findById = (id: string) =>
  User.findById(id).select('-password');

export const findByIdWithPassword = (id: string) =>
  User.findById(id).select('+password');

export const updateById = (id: string, data: Partial<IUserDocument>) =>
  User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select('-password');

export const deleteById = (id: string) =>
  User.findByIdAndDelete(id);
