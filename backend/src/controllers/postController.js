import { Post, Comment, Notification } from '../models/index.js';

// Get all posts
export const getPosts = async (req, res) => {
    try {
        const { category, location } = req.query;
        let query = {};
        
        if (category && category !== 'all') {
            query.category = category;
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        const posts = await Post.find(query)
            .populate('author', 'username profile.avatar')
            .sort({ createdAt: -1 })
            .lean();
            
        const postsWithCommentCount = await Promise.all(posts.map(async (post) => {
            const commentCount = await Comment.countDocuments({ postId: post._id });
            return { ...post, commentCount };
        }));
        
        res.json(postsWithCommentCount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single post
export const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'username profile.avatar')
            .lean();
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        post.commentCount = await Comment.countDocuments({ postId: post._id });
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get post likes
export const getPostLikes = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('likes', 'username profile.avatar');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post.likes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new post
export const createPost = async (req, res) => {
    try {
        const { content, category, location } = req.body;
        
        let images = [];
        let videos = [];
        
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const filePath = `/uploads/${file.filename}`;
                if (file.mimetype.startsWith('video/')) {
                    videos.push(filePath);
                } else {
                    images.push(filePath);
                }
            }
        }

        const post = new Post({
            author: req.user._id,
            content,
            category: category || 'general',
            location,
            images,
            videos,
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

        // Create notification if the commenter is not the author
        if (post.author.toString() !== req.user._id.toString()) {
            await Notification.create({
                recipient: post.author,
                sender: req.user._id,
                type: 'COMMENT',
                post: post._id,
            });
        }

        res.status(201).json(createdComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Toggle like
export const toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const index = post.likes.indexOf(req.user._id);
        if (index === -1) {
            post.likes.push(req.user._id);

            // Create notification
            if (post.author.toString() !== req.user._id.toString()) {
                await Notification.create({
                    recipient: post.author,
                    sender: req.user._id,
                    type: 'LIKE',
                    post: post._id,
                });
            }
        } else {
            post.likes.splice(index, 1);
        }

        await post.save();
        res.json({ likes: post.likes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get trending hashtags
export const getTrendingTags = async (req, res) => {
    try {
        const posts = await Post.find().select('content');
        const tagCounts = {};

        // Regex to match hashtags (supporting unicode characters for Vietnamese)
        const hashtagRegex = /#[\w\u00C0-\u024F\u1E00-\u1EFF]+/g;

        posts.forEach(post => {
            if (post.content) {
                const tags = post.content.match(hashtagRegex);
                if (tags) {
                    tags.forEach(tag => {
                        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                    });
                }
            }
        });

        // Convert to array and sort
        const trendingTags = Object.keys(tagCounts)
            .map(tag => ({ tag, count: tagCounts[tag] }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 4);

        res.json(trendingTags);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
