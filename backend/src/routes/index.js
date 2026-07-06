import express from 'express';
import authRoutes from './authRoutes.js';
import postRoutes from './postRoutes.js';
import adoptionRoutes from './adoptionRoutes.js';
import productRoutes from './productRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/adoptions', adoptionRoutes);
router.use('/products', productRoutes);

export default router;
