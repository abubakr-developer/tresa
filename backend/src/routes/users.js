import { Router } from 'express';
import { searchUsers, updateProfile, getNotifications, markNotificationsRead } from '../controllers/userController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.use(auth);

router.get('/search', searchUsers);
router.put('/profile', updateProfile);
router.get('/notifications', getNotifications);
router.put('/notifications/read', markNotificationsRead);

export default router;
