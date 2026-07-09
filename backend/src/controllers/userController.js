import { User, Post, Notification, Comment } from '../models/index.js';

// Toggle save post
export const toggleSavePost = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const index = user.savedPosts.indexOf(post._id);
        if (index === -1) {
            user.savedPosts.push(post._id);

            // Notify post author
            import('../models/index.js').then(async ({ Notification }) => {
                if (post.author.toString() !== req.user._id.toString()) {
                    await Notification.create({
                        recipient: post.author,
                        sender: req.user._id,
                        type: 'SAVE',
                        post: post._id,
                    });
                }
            });
        } else {
            user.savedPosts.splice(index, 1);
        }

        await user.save();
        res.json({ savedPosts: user.savedPosts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get saved posts
export const getSavedPosts = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'savedPosts',
            populate: {
                path: 'author',
                select: 'username profile.avatar'
            }
        }).lean();

        const savedPostsWithCommentCount = await Promise.all(user.savedPosts.map(async (post) => {
            const commentCount = await Comment.countDocuments({ postId: post._id });
            return { ...post, commentCount };
        }));

        res.json(savedPostsWithCommentCount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user profile
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('followers', 'username profile.avatar')
            .populate('following', 'username profile.avatar');
            
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user posts
export const getUserPosts = async (req, res) => {
    try {
        const posts = await Post.find({ author: req.params.id })
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

// Update user avatar
export const updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        if (req.user._id.toString() !== req.params.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.profile = user.profile || {};
        user.profile.avatar = `/uploads/${req.file.filename}`;
        await user.save();

        res.json({ avatar: user.profile.avatar, user: user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user profile info (username, bio, location)
export const updateProfile = async (req, res) => {
    try {
        if (req.user._id.toString() !== req.params.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { username, bio, location } = req.body;

        if (username) user.username = username;
        
        user.profile = user.profile || {};
        if (bio !== undefined) user.profile.bio = bio;
        if (location !== undefined) user.profile.location = location;

        await user.save();

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            profile: user.profile
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Toggle follow user
export const toggleFollow = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user._id;

        if (targetUserId === currentUserId.toString()) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const targetUser = await User.findById(targetUserId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser) return res.status(404).json({ message: "User not found" });

        const isFollowing = currentUser.following.includes(targetUserId);

        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId.toString());
        } else {
            // Follow
            currentUser.following.push(targetUserId);
            targetUser.followers.push(currentUserId);

            // Create notification
            await Notification.create({
                recipient: targetUser._id,
                sender: currentUser._id,
                type: 'FOLLOW',
            });
        }

        await currentUser.save();
        await targetUser.save();

        res.json({ 
            isFollowing: !isFollowing,
            followersCount: targetUser.followers.length,
            followingCount: currentUser.following.length,
            user: currentUser
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get suggested users (New Furry Friends)
export const getSuggestedUsers = async (req, res) => {
    try {
        const currentUserId = req.user ? req.user._id : null;
        
        let query = {};
        if (currentUserId) {
            const currentUser = await User.findById(currentUserId);
            // Find users that are not the current user and not already followed
            query = {
                _id: { 
                    $ne: currentUserId,
                    $nin: currentUser.following
                }
            };
        }

        // Fetch random 5 users
        const users = await User.aggregate([
            { $match: query },
            { $sample: { size: 5 } },
            { $project: { username: 1, 'profile.avatar': 1, 'profile.bio': 1, 'profile.location': 1 } }
        ]);

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);
        
        const users = await User.find({
            username: { $regex: q, $options: 'i' }
        }).select('username profile.avatar').limit(10);
        
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
