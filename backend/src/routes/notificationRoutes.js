import express from 'express';
import { getNotifications, markAsRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(protect, getNotifications);
router.route('/:id/read').put(protect, markAsRead);

export default router;
