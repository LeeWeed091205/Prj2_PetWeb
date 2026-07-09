import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import api from '../services/api';

const LikesModal = ({ postId, onClose }) => {
    const [likes, setLikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchLikes = async () => {
            try {
                const res = await api.get(`/posts/${postId}/likes`);
                setLikes(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to load likes', err);
                setLoading(false);
            }
        };
        fetchLikes();
    }, [postId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col max-h-[80vh]">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="font-bold text-lg text-gray-900">Người đã thích</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                
                <div className="overflow-y-auto flex-1 p-4">
                    {loading ? (
                        <div className="text-center py-4 text-gray-500 text-sm">Đang tải...</div>
                    ) : likes.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 text-sm">Chưa có lượt thích nào.</div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {likes.map((user) => (
                                <Link 
                                    key={user._id} 
                                    to={`/profile/${user._id}`}
                                    className="flex items-center gap-3 hover:bg-gray-50 p-2 -mx-2 rounded-xl transition-colors"
                                >
                                    {user.profile?.avatar ? (
                                        <img src={user.profile.avatar.startsWith('http') ? user.profile.avatar : `${API_URL}${user.profile.avatar}`} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-sm">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="font-medium text-gray-900">{user.username}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LikesModal;
