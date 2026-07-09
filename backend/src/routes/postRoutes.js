import express from 'express';
import {
    getPosts,
    getPostById,
    createPost,
    deletePost,
    getComments,
    addComment,
    toggleLike,
    getPostLikes,
    getTrendingTags
} from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';
import upload from '../utils/upload.js';

const router = express.Router();

router.route('/trending-tags').get(getTrendingTags);
router.route('/').get(getPosts).post(protect, upload.array('media', 5), createPost);
router.route('/:id').get(getPostById).delete(protect, deletePost);
router.route('/:id/comments').get(getComments).post(protect, addComment);
router.route('/:id/likes').get(getPostLikes);
router.route('/:id/like').post(protect, toggleLike);

export default router;
