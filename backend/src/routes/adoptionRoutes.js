import express from 'express';
import {
    getAdoptions,
    createAdoption,
    deleteAdoption,
    expressInterest,
} from '../controllers/adoptionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getAdoptions).post(protect, createAdoption);
router.route('/:id').delete(protect, deleteAdoption);
router.route('/:id/interest').post(protect, expressInterest);

export default router;
