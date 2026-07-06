import express from 'express';
import {
    getPosts,
    createPost,
    deletePost,
    getComments,
    addComment,
} from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getPosts).post(protect, createPost);
router.route('/:id').delete(protect, deletePost);
router.route('/:id/comments').get(getComments).post(protect, addComment);

export default router;
