import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Heart, MessageCircle, MapPin, Bookmark, Trash2, Send, ArrowLeft } from 'lucide-react';
import LikesModal from '../components/LikesModal';
import ImageModal from '../components/ImageModal';

const PostDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [comments, setComments] = useState([]);
    const [commentContent, setCommentContent] = useState('');
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState(null);
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchPost();
        fetchComments();
    }, [id]);

    const fetchPost = async () => {
        try {
            const res = await api.get(`/posts/${id}`);
            setPost(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch post', err);
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const res = await api.get(`/posts/${id}/comments`);
            setComments(res.data);
        } catch (err) {
            console.error('Failed to load comments');
        }
    };

    const handleLike = async () => {
        if (!user) return alert('Please login to like');
        try {
            const res = await api.post(`/posts/${id}/like`);
            setPost({ ...post, likes: res.data.likes });
        } catch (err) {
            console.error('Failed to like post');
        }
    };

    const handleSave = async () => {
        if (!user) return alert('Please login to save');
        try {
            await api.post(`/saved-posts/${id}`);
            alert('Lưu/Bỏ lưu bài viết thành công');
        } catch (err) {
            console.error('Failed to save post');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await api.delete(`/posts/${id}`);
                navigate('/');
            } catch (err) {
                alert('Failed to delete post');
            }
        }
    };

    const handleAddComment = async () => {
        if (!commentContent.trim()) return;
        if (!user) return alert('Please login to comment');

        try {
            const res = await api.post(`/posts/${id}/comments`, { content: commentContent });
            setComments([...comments, res.data]);
            setCommentContent('');
        } catch (err) {
            alert('Failed to add comment');
        }
    };

    if (loading) return <div className="text-center py-10">Đang tải...</div>;
    if (!post) return <div className="text-center py-10">Bài viết không tồn tại.</div>;

    const isLiked = user && post.likes?.includes(user._id);

    return (
        <div className="max-w-2xl mx-auto">
            <button onClick={() => navigate(-1)} className="mb-4 flex items-center text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft size={20} className="mr-2" /> Quay lại
            </button>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to={`/profile/${post.author?._id}`}>
                            {post.author?.profile?.avatar ? (
                                <img src={post.author.profile.avatar.startsWith('http') ? post.author.profile.avatar : `${API_URL}${post.author.profile.avatar}`} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-lg">
                                    {post.author?.username?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </Link>
                        <div>
                            <Link to={`/profile/${post.author?._id}`} className="font-bold text-gray-900 hover:text-[#964B00] transition-colors">{post.author?.username}</Link>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                {post.category && (
                                    <>
                                        <span>•</span>
                                        <span className="bg-gray-100 px-2 py-0.5 rounded-full text-gray-600 capitalize">{post.category === 'general' ? 'Thảo luận' : post.category === 'experience' ? 'Kinh nghiệm' : post.category === 'clinic' ? 'Phòng khám' : post.category}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleSave} className="text-gray-400 hover:text-[#964B00] p-2 hover:bg-orange-50 rounded-full transition-all">
                            <Bookmark size={20} />
                        </button>
                        {user && post.author && user._id === post.author._id && (
                            <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-all">
                                <Trash2 size={20} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-4 sm:p-6">
                    <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap mb-4">{post.content}</p>
                    {(post.images?.length > 0 || post.videos?.length > 0) && (
                        <div className={`mt-4 -mx-1 grid gap-2 ${(post.images?.length || 0) + (post.videos?.length || 0) > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {post.videos?.map((video, idx) => (
                                <video key={`v-${idx}`} src={video.startsWith('http') ? video : `${API_URL}${video}`} controls className="w-full max-h-[500px] object-cover rounded-xl bg-black" />
                            ))}
                            {post.images?.map((img, idx) => (
                                <img 
                                    key={`i-${idx}`} 
                                    src={img.startsWith('http') ? img : `${API_URL}${img}`} 
                                    className="w-full h-full max-h-[500px] object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity" 
                                    onClick={() => setSelectedImageUrl(img.startsWith('http') ? img : `${API_URL}${img}`)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {post.location && (
                    <div className="px-4 sm:px-6 py-3 bg-[#FFF8F3] border-t border-orange-50/50 flex items-center text-orange-800 text-sm">
                        <MapPin size={16} className="mr-2" />
                        <span className="font-medium">Khu vực: </span>
                        <span className="ml-1">{post.location}</span>
                    </div>
                )}

                <div className="px-4 sm:px-6 py-4 border-t border-gray-50 flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <button onClick={handleLike} className={`flex items-center gap-2 group transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
                            <div className={`p-2 rounded-full transition-colors ${isLiked ? 'bg-red-50' : 'group-hover:bg-red-50'}`}>
                                <Heart size={22} className={isLiked ? "fill-current" : ""} />
                            </div>
                        </button>
                        <button onClick={() => setShowLikesModal(true)} className="font-medium text-gray-500 hover:text-gray-900 hover:underline">
                            {post.likes?.length || 0}
                        </button>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                        <div className="p-2 rounded-full">
                            <MessageCircle size={22} />
                        </div>
                        <span className="font-medium">{comments.length}</span>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="bg-gray-50 p-4 sm:p-6 border-t border-gray-100">
                    {user && (
                        <div className="flex gap-3 mb-6">
                            {user.profile?.avatar ? (
                                <img src={user.profile.avatar.startsWith('http') ? user.profile.avatar : `${API_URL}${user.profile.avatar}`} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold flex-shrink-0">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1 flex gap-2">
                                <input
                                    type="text"
                                    value={commentContent}
                                    onChange={(e) => setCommentContent(e.target.value)}
                                    placeholder="Viết bình luận..."
                                    className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#40E0D0] focus:ring-1 focus:ring-[#40E0D0]"
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                                />
                                <button
                                    onClick={handleAddComment}
                                    disabled={!commentContent.trim()}
                                    className="bg-[#40E0D0] text-gray-900 p-2.5 rounded-full hover:bg-[#3bc8ba] disabled:opacity-50 transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        {comments.length > 0 ? comments.map(comment => (
                            <div key={comment._id} className="flex gap-3">
                                <Link to={`/profile/${comment.user?._id}`}>
                                    {comment.user?.profile?.avatar ? (
                                        <img src={comment.user.profile.avatar.startsWith('http') ? comment.user.profile.avatar : `${API_URL}${comment.user.profile.avatar}`} className="w-8 h-8 rounded-full object-cover shadow-sm" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-xs">
                                            {comment.user?.username?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </Link>
                                <div className="flex-1">
                                    <div className="bg-white px-4 py-2.5 rounded-2xl rounded-tl-sm inline-block shadow-sm border border-gray-100">
                                        <Link to={`/profile/${comment.user?._id}`} className="font-bold text-sm text-gray-900 hover:text-[#964B00] mr-2">{comment.user?.username}</Link>
                                        <span className="text-gray-700 text-sm">{comment.content}</span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 ml-2">
                                        {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-gray-500 text-sm py-4">Chưa có bình luận nào. Hãy là người đầu tiên!</div>
                        )}
                    </div>
                </div>
            </div>
            {showLikesModal && (
                <LikesModal postId={post._id} onClose={() => setShowLikesModal(false)} />
            )}

            <ImageModal imageUrl={selectedImageUrl} onClose={() => setSelectedImageUrl(null)} />
        </div>
    );
};

export default PostDetail;
