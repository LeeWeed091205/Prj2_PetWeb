import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Image as ImageIcon, Send, Trash2, MessageCircle, Heart, Bookmark, X, Search, MapPin, MoreHorizontal, Video, Shield } from 'lucide-react';
import LikesModal from '../components/LikesModal';
import ImageModal from '../components/ImageModal';

const Home = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('general');
    const [location, setLocation] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [searchLocation, setSearchLocation] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Right sidebar state
    const [trendingTags, setTrendingTags] = useState([]);
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    
    // Image/Video Upload State
    const [mediaFiles, setMediaFiles] = useState([]);
    const [mediaPreviews, setMediaPreviews] = useState([]);
    const fileInputRef = useRef(null);

    // Modals
    const [showLikesFor, setShowLikesFor] = useState(null);
    const [selectedImageUrl, setSelectedImageUrl] = useState(null);

    // Save and Comment states
    const [savedPostsIds, setSavedPostsIds] = useState([]);
    const [expandedComments, setExpandedComments] = useState({});
    const [comments, setComments] = useState({});
    const [commentContent, setCommentContent] = useState({});

    useEffect(() => {
        fetchPosts();
        fetchTrendingTags();
        fetchSuggestedUsers();
        if (user) {
            fetchSavedPosts();
        }
    }, [filterCategory, user]);

    const fetchTrendingTags = async () => {
        try {
            const res = await api.get('/posts/trending-tags');
            setTrendingTags(res.data);
        } catch (err) {
            console.error('Failed to fetch trending tags', err);
        }
    };

    const fetchSuggestedUsers = async () => {
        try {
            // Need custom API wrapper call if user is present? api handles token automatically
            const res = await api.get('/users/suggested');
            setSuggestedUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch suggested users', err);
        }
    };

    const handleFollow = async (userId) => {
        if (!user) return alert('Vui lòng đăng nhập để theo dõi');
        try {
            await api.post(`/users/${userId}/follow`);
            // Remove user from suggestions after following
            setSuggestedUsers(suggestedUsers.filter(u => u._id !== userId));
        } catch (err) {
            alert('Failed to follow user');
        }
    };

    const fetchPosts = async (search = searchLocation) => {
        try {
            setLoading(true);
            const response = await api.get(`/posts?category=${filterCategory}${search ? `&location=${search}` : ''}`);
            setPosts(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load posts');
            setLoading(false);
        }
    };

    const fetchSavedPosts = async () => {
        try {
            const res = await api.get('/users/saved-posts');
            setSavedPostsIds(res.data.map(p => p._id));
        } catch (err) {
            console.error('Failed to load saved posts', err);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            // Check if exceeding limit of 5
            if (mediaFiles.length + files.length > 5) {
                alert("Bạn chỉ có thể chọn tối đa 5 file (ảnh/video)");
                return;
            }
            const newFiles = [...mediaFiles, ...files];
            setMediaFiles(newFiles);
            
            const newPreviews = files.map(file => ({
                url: URL.createObjectURL(file),
                type: file.type.startsWith('video/') ? 'video' : 'image'
            }));
            setMediaPreviews([...mediaPreviews, ...newPreviews]);
        }
    };

    const removeMedia = (index) => {
        const newFiles = [...mediaFiles];
        const newPreviews = [...mediaPreviews];
        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);
        setMediaFiles(newFiles);
        setMediaPreviews(newPreviews);
    };

    const clearImage = () => {
        setMediaFiles([]);
        setMediaPreviews([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!content.trim() && mediaFiles.length === 0) return;

        try {
            const formData = new FormData();
            formData.append('content', content);
            formData.append('category', category);
            if (category === 'clinic') {
                formData.append('location', location);
            }
            if (mediaFiles.length > 0) {
                mediaFiles.forEach(file => {
                    formData.append('media', file);
                });
            }

            const response = await api.post('/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (filterCategory === 'all' || filterCategory === category) {
                setPosts([response.data, ...posts]);
            }
            setContent('');
            setCategory('general');
            setLocation('');
            clearImage();
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

    const handleLike = async (postId) => {
        if (!user) return alert('Please login to like');
        try {
            const response = await api.post(`/posts/${postId}/like`);
            setPosts(posts.map(p => p._id === postId ? { ...p, likes: response.data.likes } : p));
        } catch (err) {
            alert('Failed to like post');
        }
    };

    const handleSave = async (postId) => {
        if (!user) return alert('Please login to save');
        try {
            const res = await api.post(`/users/saved-posts/${postId}`);
            setSavedPostsIds(res.data.savedPosts);
        } catch (err) {
            alert('Failed to save post');
        }
    };

    const toggleComments = async (postId) => {
        const isExpanded = expandedComments[postId];
        setExpandedComments({ ...expandedComments, [postId]: !isExpanded });
        
        if (!isExpanded && !comments[postId]) {
            try {
                const res = await api.get(`/posts/${postId}/comments`);
                setComments({ ...comments, [postId]: res.data });
            } catch (err) {
                console.error('Failed to load comments');
            }
        }
    };

    const handleAddComment = async (postId) => {
        const txt = commentContent[postId];
        if (!txt || !txt.trim()) return;
        if (!user) return alert('Please login to comment');

        try {
            const res = await api.post(`/posts/${postId}/comments`, { content: txt });
            setComments({ ...comments, [postId]: [...(comments[postId] || []), res.data] });
            setCommentContent({ ...commentContent, [postId]: '' });
        } catch (err) {
            alert('Failed to add comment');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchPosts(searchLocation);
    };

    const handleClearSearch = () => {
        setSearchLocation('');
        fetchPosts('');
    };

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'; // base url for images

    return (
        <div className="flex gap-8 max-w-full">
            {/* Main Feed Column */}
            <div className="flex-1 max-w-[680px]">
                {/* Filter Tabs & Location Search */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex space-x-2 overflow-x-auto w-full sm:w-auto hide-scrollbar bg-white p-1.5 rounded-full shadow-sm border border-gray-100">
                        {['all', 'general', 'experience', 'clinic'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => { setFilterCategory(cat); fetchPosts(searchLocation); }}
                                className={`px-4 py-1.5 font-medium text-sm capitalize whitespace-nowrap rounded-full transition-all ${
                                    filterCategory === cat
                                        ? 'bg-[#40E0D0] text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                {cat === 'all' ? 'Tất cả' : cat === 'experience' ? 'Kinh nghiệm' : cat === 'clinic' ? 'Phòng khám' : 'Thảo luận'}
                            </button>
                        ))}
                    </div>
                    
                    <form onSubmit={handleSearch} className="relative w-full sm:w-64 flex-shrink-0">
                        <input
                            type="text"
                            placeholder="Khu vực (vd: Hà Nội)"
                            value={searchLocation}
                            onChange={(e) => setSearchLocation(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-full py-2 pl-4 pr-10 focus:border-[#40E0D0] focus:ring-1 focus:ring-[#40E0D0] focus:outline-none text-sm shadow-sm"
                        />
                        {searchLocation ? (
                            <button type="button" onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500">
                                <X size={14} />
                            </button>
                        ) : (
                            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#964B00]">
                                <Search size={14} />
                            </button>
                        )}
                    </form>
                </div>

                {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}
                
                {/* Create Post Section */}
                {user && user.role !== 'ADMIN' ? (
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-orange-50/50 mb-6 relative overflow-hidden">
                        <div className="flex gap-4">
                            {user.profile?.avatar ? (
                                <img src={user.profile.avatar.startsWith('http') ? user.profile.avatar : `${API_URL}${user.profile.avatar}`} alt={user.username} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-[#FFE5B4] flex items-center justify-center text-[#964B00] font-bold text-sm flex-shrink-0">
                                    {user.username?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <form onSubmit={handleCreatePost} className="flex-1">
                                <textarea
                                    className="w-full bg-[#FCFBF8] border-none rounded-2xl p-4 focus:outline-none focus:ring-1 focus:ring-[#964B00]/20 resize-none min-h-[80px] text-gray-700 placeholder-gray-400 text-sm"
                                    placeholder={`Hôm nay ${user.username} thế nào? Chia sẻ khoảnh khắc vui vẻ nhé!`}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                                
                                {mediaPreviews.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {mediaPreviews.map((preview, idx) => (
                                            <div key={idx} className="relative inline-block">
                                                {preview.type === 'video' ? (
                                                    <video src={preview.url} className="h-24 w-24 rounded-xl object-cover border border-gray-100" />
                                                ) : (
                                                    <img src={preview.url} alt={`Preview ${idx}`} className="h-24 w-24 rounded-xl object-cover border border-gray-100" />
                                                )}
                                                <button type="button" onClick={() => removeMedia(idx)} className="absolute -top-1 -right-1 bg-gray-800 text-white rounded-full p-1 hover:bg-red-500 shadow-md">
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="bg-[#FCFBF8] border-none rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#964B00]/20 text-gray-600 w-full sm:w-auto"
                                    >
                                        <option value="general">Thảo luận chung</option>
                                        <option value="experience">Chia sẻ kinh nghiệm</option>
                                        <option value="clinic">Giới thiệu phòng khám</option>
                                    </select>
                                    
                                    {category === 'clinic' && (
                                        <input
                                            type="text"
                                            placeholder="Khu vực (Quận, Thành phố...)"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="bg-[#FCFBF8] border-none rounded-xl text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#964B00]/20 text-gray-600 flex-grow"
                                            required
                                        />
                                    )}
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <div className="flex items-center gap-4 pl-2">
                                        <div>
                                            <input 
                                                type="file" 
                                                accept="image/*,video/*"
                                                multiple
                                                ref={fileInputRef}
                                                onChange={handleImageChange}
                                                className="hidden"
                                                id="media-upload"
                                            />
                                            <label htmlFor="media-upload" className="flex items-center gap-2 text-gray-500 hover:text-[#40E0D0] cursor-pointer transition-colors p-2 -ml-2 rounded-xl hover:bg-teal-50">
                                                <ImageIcon size={20} />
                                                <span className="text-sm font-medium">Ảnh/Video</span>
                                            </label>
                                        </div>
                                        <button type="button" className="text-gray-400 hover:text-[#40E0D0] transition-colors" title="Check-in">
                                            <MapPin size={20} />
                                        </button>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!content.trim() && mediaFiles.length === 0}
                                        className="bg-[#964B00] text-white px-6 py-2 rounded-full font-medium hover:bg-[#7a3c00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-orange-900/10 text-sm"
                                    >
                                        Đăng tin
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : !user ? (
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6 text-center">
                        <p className="text-gray-600 mb-4">Vui lòng đăng nhập để chia sẻ và tương tác!</p>
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#106A61]/20 mb-6 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-teal-100 text-[#106A61] rounded-full flex items-center justify-center mb-4">
                            <Shield size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Giao diện Quản trị viên</h2>
                        <p className="text-gray-600 mt-2 mb-6 max-w-md">Bạn đang đăng nhập bằng tài khoản Quản trị. Quản trị viên không thể đăng bài mới trên bảng tin.</p>
                        <Link to="/admin" className="bg-[#106A61] text-white px-8 py-3 rounded-full font-bold hover:bg-[#0c4c45] transition-colors shadow-lg shadow-teal-900/20">
                            Vào Admin Dashboard
                        </Link>
                    </div>
                )}

                {/* Posts Feed */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500">Loading posts...</div>
                    ) : posts.length > 0 ? (
                        posts.map(post => {
                            const isLiked = post.likes?.includes(user?._id);
                            const isSaved = savedPostsIds.includes(post._id);

                            return (
                                <div key={post._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {post.author?.profile?.avatar ? (
                                                <img src={post.author.profile.avatar.startsWith('http') ? post.author.profile.avatar : `${API_URL}${post.author.profile.avatar}`} alt={post.author.username} className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-[#FFE5B4] flex items-center justify-center text-[#964B00] font-bold">
                                                    {post.author?.username?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="font-bold text-gray-900 hover:text-[#964B00] transition-colors text-sm">
                                                    <Link to={`/profile/${post.author?._id}`}>
                                                        {post.author?.username}
                                                    </Link>
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(post.createdAt).toLocaleDateString()}
                                                    </span>
                                                    {post.category !== 'general' && (
                                                        <>
                                                            <span className="text-xs text-gray-300">•</span>
                                                            <span className="text-xs text-gray-500">
                                                                {post.category === 'experience' ? 'Kinh nghiệm' : 'Phòng khám'}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="relative group">
                                            <button className="text-gray-400 hover:text-gray-600 p-1">
                                                <MoreHorizontal size={20} />
                                            </button>
                                            <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 hidden group-hover:block z-10">
                                                {(user?._id === post.author?._id || user?.role === 'ADMIN') && (
                                                    <button
                                                        onClick={() => handleDeletePost(post._id)}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                                    >
                                                        Xóa bài
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                    
                                    {post.category === 'clinic' && post.location && (
                                        <div className="flex items-center gap-2 mt-3 text-xs text-gray-600 bg-[#FFF5EE] px-3 py-1.5 rounded-lg inline-flex">
                                            <MapPin size={14} className="text-[#964B00] flex-shrink-0" /> 
                                            <span className="font-medium text-[#964B00]">Khu vực:</span> {post.location}
                                        </div>
                                    )}

                                    {(post.images?.length > 0 || post.videos?.length > 0) && (
                                        <div className={`mt-4 -mx-1 grid gap-2 ${(post.images?.length || 0) + (post.videos?.length || 0) > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                            {post.videos?.map((video, idx) => (
                                                <video key={`v-${idx}`} src={video.startsWith('http') ? video : `${API_URL}${video}`} controls className="w-full max-h-[500px] object-cover rounded-2xl bg-black" />
                                            ))}
                                            {post.images?.map((img, idx) => (
                                                <img 
                                                    key={`i-${idx}`} 
                                                    src={img.startsWith('http') ? img : `${API_URL}${img}`} 
                                                    alt={`Post content ${idx}`} 
                                                    className="w-full h-full max-h-[500px] object-cover rounded-2xl cursor-pointer hover:opacity-90 transition-opacity" 
                                                    onClick={() => setSelectedImageUrl(img.startsWith('http') ? img : `${API_URL}${img}`)}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Interaction buttons */}
                                    <div className="mt-5 flex items-center justify-between text-gray-400">
                                        <div className="flex gap-6">
                                            <div className="flex items-center gap-1.5">
                                                <button onClick={() => handleLike(post._id)} className={`transition-colors hover:scale-105 ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}>
                                                    <Heart size={20} className={isLiked ? "fill-red-500" : ""} />
                                                </button>
                                                <button onClick={() => setShowLikesFor(post._id)} className="text-sm font-medium hover:underline hover:text-gray-900">
                                                    {post.likes?.length || 0}
                                                </button>
                                            </div>
                                            <button onClick={() => toggleComments(post._id)} className="flex items-center gap-1.5 hover:text-[#40E0D0] transition-colors hover:scale-105">
                                                <MessageCircle size={20} />
                                                <span className="text-sm font-medium">{comments[post._id] ? comments[post._id].length : (post.commentCount || 0)}</span>
                                            </button>
                                            <button className="flex items-center gap-1.5 hover:text-[#40E0D0] transition-colors hover:scale-105">
                                                <Send size={20} />
                                            </button>
                                        </div>
                                        <button onClick={() => handleSave(post._id)} className="hover:text-[#964B00] transition-colors hover:scale-105">
                                            <Bookmark size={20} className={isSaved ? "fill-[#964B00] text-[#964B00]" : ""} />
                                        </button>
                                    </div>

                                    {/* Comments Section */}
                                    {expandedComments[post._id] && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            {/* List comments */}
                                            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                                {(comments[post._id] || []).map(c => (
                                                    <div key={c._id} className="flex gap-2">
                                                        {c.author?.profile?.avatar ? (
                                                            <img src={c.author.profile.avatar.startsWith('http') ? c.author.profile.avatar : `${API_URL}${c.author.profile.avatar}`} alt={c.author.username} className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5" />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-600 font-bold text-xs mt-0.5">
                                                                {c.author?.username?.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className="bg-[#FCFBF8] px-3 py-2 rounded-2xl rounded-tl-sm border border-gray-100 flex-1">
                                                            <span className="font-bold text-xs text-gray-900 block mb-0.5 hover:text-[#964B00]">
                                                                <Link to={`/profile/${c.author?._id}`}>{c.author?.username}</Link>
                                                            </span>
                                                            <span className="text-gray-800 text-sm">{c.content}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {comments[post._id]?.length === 0 && (
                                                    <div className="text-sm text-gray-400 text-center py-2">Chưa có bình luận nào.</div>
                                                )}
                                            </div>
                                            
                                            {/* Add comment */}
                                            {user && (
                                                <div className="flex gap-3 items-center">
                                                    {user.profile?.avatar ? (
                                                        <img src={user.profile.avatar.startsWith('http') ? user.profile.avatar : `${API_URL}${user.profile.avatar}`} alt={user.username} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-[#FFE5B4] flex-shrink-0 flex items-center justify-center text-[#964B00] font-bold text-xs">
                                                            {user.username?.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className="flex-1 relative">
                                                        <input 
                                                            type="text" 
                                                            className="w-full bg-[#FCFBF8] border border-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#40E0D0] pr-10"
                                                            placeholder="Viết bình luận..."
                                                            value={commentContent[post._id] || ''}
                                                            onChange={(e) => setCommentContent({...commentContent, [post._id]: e.target.value})}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                                                        />
                                                        <button 
                                                            onClick={() => handleAddComment(post._id)}
                                                            disabled={!commentContent[post._id]?.trim()}
                                                            className="absolute right-1 top-1 bottom-1 bg-[#40E0D0] text-white rounded-full w-8 flex items-center justify-center hover:bg-[#35c4b6] disabled:opacity-50 transition-colors"
                                                        >
                                                            <Send size={14} className="ml-0.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-10 bg-white rounded-3xl border border-gray-100 text-gray-500">
                            Chưa có bài viết nào ở khu vực này.
                        </div>
                    )}
                </div>
            </div>

            {/* Right Sidebar Widgets */}
            <div className="hidden xl:block w-[320px] flex-shrink-0 space-y-6">
                
                {/* Trending Paws */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Trending Paws</h3>
                    <div className="space-y-4">
                        {trendingTags.length > 0 ? (
                            trendingTags.map((tagObj, idx) => (
                                <div key={idx} className="cursor-pointer group">
                                    <p className="text-xs text-gray-400 mb-0.5">Thịnh hành</p>
                                    <h4 className="font-bold text-sm text-gray-900 group-hover:text-[#964B00] transition-colors">{tagObj.tag}</h4>
                                    <p className="text-xs text-gray-500">{tagObj.count} posts</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-xs text-gray-500 text-center">Chưa có hashtag nào thịnh hành</div>
                        )}
                    </div>
                </div>

                {/* New Furry Friends */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">New Furry Friends</h3>
                    <div className="space-y-4">
                        {suggestedUsers.length > 0 ? (
                            suggestedUsers.map((friend) => (
                                <div key={friend._id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {friend.profile?.avatar ? (
                                            <img src={friend.profile.avatar.startsWith('http') ? friend.profile.avatar : `${API_URL}${friend.profile.avatar}`} alt={friend.username} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-[#E0F8F0] flex items-center justify-center text-[#40E0D0] font-bold text-sm">
                                                {friend.username.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="overflow-hidden">
                                            <h4 className="font-bold text-sm text-gray-900 truncate max-w-[100px]">
                                                <Link to={`/profile/${friend._id}`} className="hover:text-[#964B00] transition-colors">{friend.username}</Link>
                                            </h4>
                                            <p className="text-[10px] text-gray-500 truncate max-w-[100px]">
                                                {friend.profile?.location ? friend.profile.location : 'Suggested'}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleFollow(friend._id)} className="bg-[#106A61] text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-[#0c4c45] transition-colors shadow-sm whitespace-nowrap">
                                        Follow
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-xs text-gray-500 text-center">Không có gợi ý nào</div>
                        )}
                    </div>
                    <button className="text-xs text-[#964B00] mt-5 w-full text-center hover:underline font-medium">
                        Tìm thêm bạn mới
                    </button>
                </div>

                <div className="text-center text-[10px] text-gray-400 flex flex-wrap justify-center gap-2 px-4">
                    <span className="hover:underline cursor-pointer">Privacy</span> •
                    <span className="hover:underline cursor-pointer">Terms</span> •
                    <span className="hover:underline cursor-pointer">Cookies</span>
                    <div className="w-full mt-1">© 2026 PetNet Social</div>
                </div>
            </div>
            
            {showLikesFor && (
                <LikesModal postId={showLikesFor} onClose={() => setShowLikesFor(null)} />
            )}

            <ImageModal imageUrl={selectedImageUrl} onClose={() => setSelectedImageUrl(null)} />
        </div>
    );
};

export default Home;
