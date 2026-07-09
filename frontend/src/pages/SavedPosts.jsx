import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Bookmark, Heart, MessageCircle, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const SavedPosts = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchSavedPosts();
        }
    }, [user]);

    const fetchSavedPosts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users/saved-posts');
            setPosts(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to load saved posts', err);
            setLoading(false);
        }
    };

    const handleUnsave = async (postId) => {
        try {
            await api.post(`/users/saved-posts/${postId}`);
            setPosts(posts.filter(p => p._id !== postId));
        } catch (err) {
            alert('Failed to unsave post');
        }
    };

    if (!user) {
        return (
            <div className="text-center py-20 text-gray-500">
                Vui lòng <Link to="/login" className="text-orange-500 hover:underline">Đăng nhập</Link> để xem các bài viết đã lưu.
            </div>
        );
    }

    if (loading) return <div className="text-center py-10">Đang tải bài viết...</div>;

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Bookmark className="text-orange-500 fill-orange-500" /> Bài viết đã lưu
            </h2>

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
                                    <span className="text-xs text-gray-500">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleUnsave(post._id)}
                                className="text-orange-500 hover:text-orange-600 transition-colors bg-orange-50 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
                            >
                                <Bookmark size={16} className="fill-orange-500" />
                                Bỏ lưu
                            </button>
                        </div>
                        
                        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                        
                        {post.images && post.images.length > 0 && (
                            <div className="mt-4">
                                <img src={post.images[0].startsWith('http') ? post.images[0] : `${API_URL}${post.images[0]}`} alt="Post content" className="w-full max-h-96 object-cover rounded-lg border border-gray-100" />
                            </div>
                        )}
                        
                        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-6">
                            <div className="flex items-center gap-1.5 text-gray-500">
                                <Heart size={20} className={post.likes?.includes(user._id) ? "fill-red-500 text-red-500" : ""} />
                                <span className="text-sm font-medium">{post.likes?.length || 0} Thích</span>
                            </div>
                            <Link to="/" className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors">
                                <MessageCircle size={20} />
                                <span className="text-sm font-medium">Bình luận</span>
                            </Link>
                        </div>
                    </div>
                ))}
                
                {posts.length === 0 && !loading && (
                    <div className="text-center py-10 bg-white rounded-lg border border-gray-200">
                        <Bookmark size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">Bạn chưa lưu bài viết nào.</p>
                        <Link to="/" className="text-orange-500 font-medium hover:underline mt-2 inline-block">Về trang chủ</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedPosts;
