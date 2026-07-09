import express from 'express';
import {
    getAdoptions,
    createAdoption,
    deleteAdoption,
    expressInterest,
    updateAdoptionStatus,
} from '../controllers/adoptionController.js';
import { protect } from '../middleware/auth.js';
import upload from '../utils/upload.js';

const router = express.Router();

router.route('/').get(getAdoptions).post(protect, upload.single('image'), createAdoption);
router.route('/:id').delete(protect, deleteAdoption);
router.route('/:id/interest').post(protect, expressInterest);
router.route('/:id/status').put(protect, updateAdoptionStatus);

export default router;
