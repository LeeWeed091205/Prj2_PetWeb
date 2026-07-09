import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { 
    getDashboardStats, 
    getAllUsers, 
    deleteUser, 
    getAllPosts 
} from '../controllers/adminController.js';
import { deletePost } from '../controllers/postController.js'; // Reuse existing logic

const router = express.Router();

// Apply auth and admin middleware to all routes in this file
router.use(protect, admin);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

router.get('/posts', getAllPosts);
// We can safely reuse postController.deletePost because we added admin check inside it
router.delete('/posts/:id', deletePost);

export default router;
