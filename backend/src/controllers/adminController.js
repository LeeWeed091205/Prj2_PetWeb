import { User, Post, Comment } from '../models/index.js';

// Get Dashboard Statistics
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalPosts = await Post.countDocuments();
        const totalComments = await Comment.countDocuments();

        // Get some recent activity (last 5 users)
        const recentUsers = await User.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            stats: {
                totalUsers,
                totalPosts,
                totalComments
            },
            recentUsers
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all users with pagination
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a user (Admin only)
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot delete your own admin account' });
        }

        // Delete all posts and comments by this user
        await Post.deleteMany({ author: user._id });
        await Comment.deleteMany({ author: user._id });
        
        // Finally, delete the user
        await User.deleteOne({ _id: user._id });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all posts for admin view
export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'username profile.avatar email')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
