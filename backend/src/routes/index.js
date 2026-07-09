import express from 'express';
import authRoutes from './authRoutes.js';
import postRoutes from './postRoutes.js';
import adoptionRoutes from './adoptionRoutes.js';
import productRoutes from './productRoutes.js';
import userRoutes from './userRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/adoptions', adoptionRoutes);
router.use('/products', productRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);

export default router;
