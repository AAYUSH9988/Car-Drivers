import { Router } from 'express';
import { protect } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { upload } from '../../utils/fileUpload';
import * as driversController from './drivers.controller';
import { registerDriverSchema, updateDriverSchema, driversQuerySchema } from './drivers.validator';

const router = Router();

// Public
router.get('/', validate(driversQuerySchema, 'query'), driversController.getAllDrivers);
router.get('/:id/availability', driversController.getDriverAvailability);
router.get('/:id/reviews',      driversController.getDriverReviews);
router.get('/:id',              driversController.getDriverById);

// Protected
router.use(protect);

router.get('/me/profile',   driversController.getMyDriverProfile);
router.get('/me/earnings',  driversController.getMyEarnings);
router.post(
  '/register',
  upload.fields([
    { name: 'license',      maxCount: 1 },
    { name: 'vehiclePhoto', maxCount: 1 },
    { name: 'profilePhoto', maxCount: 1 },
  ]),
  validate(registerDriverSchema),
  driversController.registerDriver,
);
router.patch('/:id', validate(updateDriverSchema), driversController.updateDriver);

export default router;
