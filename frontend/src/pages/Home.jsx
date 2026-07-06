import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Image as ImageIcon, Send, Trash2, MessageCircle } from 'lucide-react';

const Home = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('general');
    const [filterCategory, setFilterCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPosts();
    }, [filterCategory]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/posts?category=${filterCategory}`);
            setPosts(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load posts');
            setLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            const response = await api.post('/posts', { content, category });
            if (filterCategory === 'all' || filterCategory === category) {
                setPosts([response.data, ...posts]);
            }
            setContent('');
            setCategory('general');
        } catch (err) {
            setError('Failed to create post');
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        
        try {
            await api.delete(`/posts/${postId}`);
            setPosts(posts.filter(post => post._id !== postId));
        } catch (err) {
            setError('Failed to delete post');
        }
    };

    if (loading) return <div className="text-center py-10">Loading posts...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            {/* Filter Tabs */}
            <div className="flex space-x-4 mb-6 border-b border-gray-200">
                {['all', 'general', 'experience', 'clinic'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`pb-2 px-1 font-medium text-sm capitalize ${
                            filterCategory === cat
                                ? 'border-b-2 border-orange-500 text-orange-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {cat === 'all' ? 'Tất cả' : cat === 'experience' ? 'Kinh nghiệm' : cat === 'clinic' ? 'Phòng khám' : 'Thảo luận chung'}
                    </button>
                ))}
            </div>

            {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}
            
            {/* Create Post Section */}
            {user ? (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                    <form onSubmit={handleCreatePost}>
                        <textarea
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-orange-500 resize-none min-h-[100px]"
                            placeholder="Bạn đang nghĩ gì? Hãy chia sẻ câu chuyện thú cưng của bạn!"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        <div className="mt-2">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="border border-gray-300 rounded-md text-sm p-1 focus:outline-none focus:border-orange-500"
                            >
                                <option value="general">Thảo luận chung</option>
                                <option value="experience">Chia sẻ kinh nghiệm</option>
                                <option value="clinic">Giới thiệu phòng khám</option>
                            </select>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                            <button type="button" className="text-gray-500 hover:text-orange-500 flex items-center gap-1 transition-colors">
                                <ImageIcon size={20} />
                                <span className="text-sm font-medium">Add Image</span>
                            </button>
                            <button
                                type="submit"
                                disabled={!content.trim()}
                                className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                            >
                                <Send size={18} />
                                Post
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6 text-center">
                    <p className="text-gray-600 mb-4">Please log in to share your pet stories!</p>
                </div>
            )}

            {/* Posts Feed */}
            <div className="space-y-6">
                {posts.map(post => (
                    <div key={post._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold">
                                    {post.author?.username?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{post.author?.username}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                                            {post.category === 'experience' ? 'Kinh nghiệm' : post.category === 'clinic' ? 'Phòng khám' : 'Thảo luận'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {(user?._id === post.author?._id || user?.role === 'ADMIN') && (
                                <button
                                    onClick={() => handleDeletePost(post._id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                        
                        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                        
                        {post.images && post.images.length > 0 && (
                            <div className="mt-4">
                                {/* Image rendering placeholder */}
                                <div className="bg-gray-100 h-48 rounded-lg flex items-center justify-center text-gray-400">
                                    [Image: {post.images[0]}]
                                </div>
                            </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4">
                            <button className="flex items-center gap-1 text-gray-500 hover:text-orange-500 transition-colors">
                                <MessageCircle size={18} />
                                <span className="text-sm font-medium">Comments</span>
                            </button>
                        </div>
                    </div>
                ))}
                
                {posts.length === 0 && !loading && (
                    <div className="text-center py-10 text-gray-500">
                        No posts yet. Be the first to post!
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
