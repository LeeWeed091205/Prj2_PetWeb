import express from 'express';
import { toggleSavePost, getSavedPosts, getUserProfile, getUserPosts, updateAvatar, updateProfile, toggleFollow, getSuggestedUsers, searchUsers } from '../controllers/userController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import upload from '../utils/upload.js';

const router = express.Router();

router.route('/search').get(searchUsers);
router.route('/suggested').get(optionalAuth, getSuggestedUsers);
router.route('/saved-posts').get(protect, getSavedPosts);
router.route('/saved-posts/:id').post(protect, toggleSavePost);
router.route('/:id/follow').post(protect, toggleFollow);
router.route('/:id/profile').get(getUserProfile);
router.route('/:id/posts').get(getUserPosts);
router.route('/:id/avatar').put(protect, upload.single('avatar'), updateAvatar);
router.route('/:id/profile').put(protect, updateProfile);

export default router;
