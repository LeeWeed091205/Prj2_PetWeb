import express from 'express';
import {
    getProducts,
    createProduct,
    deleteProduct,
} from '../controllers/productController.js';
import { protect } from '../middleware/auth.js';
import upload from '../utils/upload.js';

const router = express.Router();

router.route('/').get(getProducts).post(protect, upload.single('image'), createProduct);
router.route('/:id').delete(protect, deleteProduct);

export default router;
