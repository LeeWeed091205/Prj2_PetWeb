import { Post, Comment } from '../models/index.js';

// Get all posts
export const getPosts = async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};
        if (category && category !== 'all') {
            query.category = category;
        }

        const posts = await Post.find(query)
            .populate('author', 'username profile.avatar')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new post
export const createPost = async (req, res) => {
    try {
        const { content, category, images } = req.body;

        const post = new Post({
            author: req.user._id,
            content,
            category: category || 'general',
            images: images || [],
        });

        const createdPost = await post.save();
        await createdPost.populate('author', 'username profile.avatar');

        res.status(201).json(createdPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a post
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user is the author or admin
        if (
            post.author.toString() !== req.user._id.toString() &&
            req.user.role !== 'ADMIN'
        ) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await Post.deleteOne({ _id: post._id });
        // Delete all comments associated with this post
        await Comment.deleteMany({ postId: post._id });

        res.json({ message: 'Post removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get comments for a post
export const getComments = async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.id })
            .populate('author', 'username profile.avatar')
            .sort({ createdAt: 1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add comment to a post
export const addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = new Comment({
            author: req.user._id,
            postId: post._id,
            content,
        });

        const createdComment = await comment.save();
        await createdComment.populate('author', 'username profile.avatar');

        res.status(201).json(createdComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
