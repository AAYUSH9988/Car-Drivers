import { Router } from 'express';
import { protect } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { authLimiter } from '../../middleware/rateLimit.middleware';
import { upload } from '../../utils/fileUpload';
import * as usersController from './users.controller';
import { updatePasswordSchema } from './users.validator';

const router = Router();

router.use(protect);

router.get('/profile', usersController.getProfile);
router.put('/password', authLimiter, validate(updatePasswordSchema), usersController.updatePassword);
router.put('/profile/photo', upload.single('photo'), usersController.uploadProfilePhoto);

export default router;
