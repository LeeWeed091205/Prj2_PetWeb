import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Heart, MessageCircle, MapPin, Bookmark, Trash2, Calendar, Send, Camera, X, Edit3 } from 'lucide-react';
import LikesModal from '../components/LikesModal';
import ImageModal from '../components/ImageModal';
import EditProfileModal from '../components/EditProfileModal';

const Profile = () => {
    const { id } = useParams();
    const { user, setUser } = useAuth();
    
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Interactions state
    const [savedPostsIds, setSavedPostsIds] = useState([]);
    const [expandedComments, setExpandedComments] = useState({});
    const [comments, setComments] = useState({});
    const [commentContent, setCommentContent] = useState({});
    
    const [showLikesFor, setShowLikesFor] = useState(null);
    const [selectedImageUrl, setSelectedImageUrl] = useState(null);
    const [showEditProfile, setShowEditProfile] = useState(false);
    
    const fileInputRef = React.useRef(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    
    // Follow functionality state
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);

    useEffect(() => {
        fetchProfileAndPosts();
        if (user) {
            fetchSavedPosts();
        }
    }, [id, user]);

    const fetchProfileAndPosts = async () => {
        try {
            setLoading(true);
            const [profileRes, postsRes] = await Promise.all([
                api.get(`/users/${id}/profile`),
                api.get(`/users/${id}/posts`)
            ]);
            setProfile(profileRes.data);
            setPosts(postsRes.data);
            setLoading(false);
        } catch (err) {
            setError('Không thể tải thông tin hồ sơ.');
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

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploadingAvatar(true);
            const formData = new FormData();
            formData.append('avatar', file);

            const res = await api.put(`/users/${id}/avatar`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Update local profile state
            setProfile(prev => ({ 
                ...prev, 
                profile: { ...prev.profile, avatar: res.data.avatar } 
            }));
            
            // Update global user state if it's the current user
            if (user && user._id === id) {
                setUser(res.data.user);
            }
            setUploadingAvatar(false);
        } catch (err) {
            console.error('Failed to update avatar', err);
            alert('Không thể cập nhật ảnh đại diện');
            setUploadingAvatar(false);
        }
    };

    const handleFollowToggle = async () => {
        if (!user) return alert('Vui lòng đăng nhập để theo dõi');
        try {
            const res = await api.post(`/users/${id}/follow`);
            // Refresh profile to get updated lists
            fetchProfileAndPosts();
        } catch (err) {
            console.error('Failed to toggle follow', err);
            alert('Lỗi khi thực hiện thao tác theo dõi');
        }
    };

    const handleLike = async (postId) => {
        if (!user) return alert('Vui lòng đăng nhập để thích bài viết');
        try {
            const response = await api.post(`/posts/${postId}/like`);
            setPosts(posts.map(p => p._id === postId ? { ...p, likes: response.data.likes } : p));
        } catch (err) {
            alert('Failed to like post');
        }
    };

    const handleSave = async (postId) => {
        if (!user) return alert('Vui lòng đăng nhập để lưu');
        try {
            const res = await api.post(`/users/saved-posts/${postId}`);
            setSavedPostsIds(res.data.savedPosts);
        } catch (err) {
            alert('Failed to save post');
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Bạn có chắc muốn xóa bài viết này?')) return;
        try {
            await api.delete(`/posts/${postId}`);
            setPosts(posts.filter(post => post._id !== postId));
        } catch (err) {
            alert('Lỗi khi xóa bài viết');
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
        if (!user) return alert('Vui lòng đăng nhập để bình luận');

        try {
            const res = await api.post(`/posts/${postId}/comments`, { content: txt });
            setComments({ ...comments, [postId]: [...(comments[postId] || []), res.data] });
            setCommentContent({ ...commentContent, [postId]: '' });
        } catch (err) {
            alert('Failed to add comment');
        }
    };

    if (loading) return <div className="text-center py-10">Đang tải hồ sơ...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
    if (!profile) return <div className="text-center py-10">Không tìm thấy người dùng.</div>;

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    return (
        <div className="max-w-2xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6 text-center">
                <div className="relative inline-block mx-auto mb-4 group">
                    {profile.profile?.avatar ? (
                        <img 
                            src={profile.profile.avatar.startsWith('http') ? profile.profile.avatar : `${API_URL}${profile.profile.avatar}`} 
                            alt={profile.username} 
                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mx-auto"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-4xl font-bold border-4 border-white shadow-md mx-auto">
                            {profile.username?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    
                    {user && user._id === profile._id && (
                        <>
                            <div 
                                onClick={() => !uploadingAvatar && fileInputRef.current.click()}
                                className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                                <Camera size={24} />
                            </div>
                            <input 
                                type="file" 
                                accept="image/*"
                                className="hidden" 
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                            />
                        </>
                    )}
                    {uploadingAvatar && (
                        <div className="absolute inset-0 bg-white bg-opacity-70 rounded-full flex items-center justify-center">
                            <span className="text-xs text-orange-500 font-bold">Đang tải...</span>
                        </div>
                    )}
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.username}</h2>
                <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mb-4">
                    <Calendar size={16} />
                    <span>Tham gia từ {new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
                
                {/* Follow Button */}
                {user && user._id !== profile._id && (
                    <button 
                        onClick={handleFollowToggle}
                        className={`px-6 py-2 rounded-full font-bold text-sm transition-colors mb-4 shadow-sm ${
                            profile.followers?.some(f => f._id === user._id)
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                                : 'bg-[#106A61] text-white hover:bg-[#0c4c45]'
                        }`}
                    >
                        {profile.followers?.some(f => f._id === user._id) ? 'Đang theo dõi' : 'Theo dõi'}
                    </button>
                )}

                {/* Edit Profile Button */}
                {user && user._id === profile._id && (
                    <button 
                        onClick={() => setShowEditProfile(true)}
                        className="px-6 py-2 rounded-full font-bold text-sm transition-colors mb-4 shadow-sm bg-gray-100 text-gray-700 hover:bg-gray-200 inline-flex items-center gap-2"
                    >
                        <Edit3 size={16} /> Sửa hồ sơ
                    </button>
                )}

                {/* Bio and Location */}
                {(profile.profile?.bio || profile.profile?.location) && (
                    <div className="mt-2 mb-4 bg-gray-50 rounded-2xl p-4 text-left max-w-md mx-auto">
                        {profile.profile?.bio && (
                            <p className="text-gray-700 text-sm mb-2 text-center italic">"{profile.profile.bio}"</p>
                        )}
                        {profile.profile?.location && (
                            <p className="text-gray-500 text-sm flex items-center justify-center gap-1">
                                <MapPin size={14} /> {profile.profile.location}
                            </p>
                        )}
                    </div>
                )}

                <div className="mt-4 flex justify-center gap-8 border-t border-gray-100 pt-6">
                    <div>
                        <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
                        <div className="text-sm text-gray-500">Bài viết</div>
                    </div>
                    <div className="cursor-pointer group" onClick={() => setShowFollowers(true)}>
                        <div className="text-2xl font-bold text-gray-900 group-hover:text-[#964B00] transition-colors">{profile.followers?.length || 0}</div>
                        <div className="text-sm text-gray-500">Người theo dõi</div>
                    </div>
                    <div className="cursor-pointer group" onClick={() => setShowFollowing(true)}>
                        <div className="text-2xl font-bold text-gray-900 group-hover:text-[#964B00] transition-colors">{profile.following?.length || 0}</div>
                        <div className="text-sm text-gray-500">Đang theo dõi</div>
                    </div>
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Bài viết của {profile.username}</h3>

            {/* Posts List */}
            <div className="space-y-6">
                {posts.map(post => {
                    const isLiked = post.likes?.includes(user?._id);
                    const isSaved = savedPostsIds.includes(post._id);

                    return (
                        <div key={post._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3 mb-3">
                                    {profile.profile?.avatar ? (
                                        <img src={profile.profile.avatar.startsWith('http') ? profile.profile.avatar : `${API_URL}${profile.profile.avatar}`} alt={profile.username} className="w-10 h-10 rounded-full object-cover border border-orange-100" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold">
                                            {profile.username?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="font-bold text-gray-900">{profile.username}</h4>
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
                                <div className="flex gap-2">
                                    {user && (
                                        <button onClick={() => handleSave(post._id)} className="text-gray-400 hover:text-orange-500 transition-colors" title="Lưu bài viết">
                                            <Bookmark size={20} className={isSaved ? "fill-orange-500 text-orange-500" : ""} />
                                        </button>
                                    )}
                                    {(user?._id === post.author?._id || user?.role === 'ADMIN') && (
                                        <button
                                            onClick={() => handleDeletePost(post._id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                            
                            {post.category === 'clinic' && post.location && (
                                <div className="flex items-center gap-2 mt-3 text-sm text-gray-600 bg-orange-50 p-2 rounded-md">
                                    <MapPin size={16} className="text-orange-500 flex-shrink-0" /> 
                                    <span className="font-medium">Khu vực:</span> {post.location}
                                </div>
                            )}

                            {(post.images?.length > 0 || post.videos?.length > 0) && (
                                <div className={`mt-4 grid gap-2 ${(post.images?.length || 0) + (post.videos?.length || 0) > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                    {post.videos?.map((video, idx) => (
                                        <video key={`v-${idx}`} src={video.startsWith('http') ? video : `${API_URL}${video}`} controls className="w-full max-h-96 object-cover rounded-lg bg-black border border-gray-100" />
                                    ))}
                                    {post.images?.map((img, idx) => (
                                        <img 
                                            key={`i-${idx}`} 
                                            src={img.startsWith('http') ? img : `${API_URL}${img}`} 
                                            alt={`Post content ${idx}`} 
                                            className="w-full h-full max-h-96 object-cover rounded-lg border border-gray-100 cursor-pointer hover:opacity-90 transition-opacity" 
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
                            </div>
                            </div>

                            {/* Comments Section */}
                            {expandedComments[post._id] && (
                                <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50 rounded-lg p-4">
                                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                        {(comments[post._id] || []).map(c => (
                                            <div key={c._id} className="flex gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-600 font-bold text-xs">
                                                    {c.author?.username?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="bg-white px-3 py-2 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
                                                    <span className="font-bold text-sm text-gray-900 mr-2">
                                                        <Link to={`/profile/${c.author?._id}`} className="hover:underline">{c.author?.username}</Link>
                                                    </span>
                                                    <span className="text-gray-800 text-sm">{c.content}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {comments[post._id]?.length === 0 && (
                                            <div className="text-sm text-gray-500">Chưa có bình luận nào.</div>
                                        )}
                                    </div>

                                    {/* Add comment */}
                                    {user && (
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                className="flex-grow border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-orange-500"
                                                placeholder="Viết bình luận..."
                                                value={commentContent[post._id] || ''}
                                                onChange={(e) => setCommentContent({...commentContent, [post._id]: e.target.value})}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                                            />
                                            <button 
                                                onClick={() => handleAddComment(post._id)}
                                                disabled={!commentContent[post._id]?.trim()}
                                                className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-orange-600 disabled:opacity-50"
                                            >
                                                <Send size={16} className="ml-1" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
                
                {posts.length === 0 && !loading && (
                    <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-500">
                        {user && user._id === profile._id 
                            ? "Hiện bạn chưa có bài viết nào." 
                            : "Người dùng này chưa có bài viết nào."}
                    </div>
                )}
            </div>

            {/* Followers Modal */}
            {showFollowers && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowFollowers(false)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h3 className="font-bold text-lg">Người theo dõi</h3>
                            <button onClick={() => setShowFollowers(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-1 space-y-4">
                            {profile.followers?.length > 0 ? (
                                profile.followers.map(f => (
                                    <div key={f._id} className="flex items-center gap-3">
                                        {f.profile?.avatar ? (
                                            <img src={f.profile.avatar.startsWith('http') ? f.profile.avatar : `${API_URL}${f.profile.avatar}`} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold">
                                                {f.username.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <Link to={`/profile/${f._id}`} onClick={() => setShowFollowers(false)} className="font-bold hover:text-[#964B00]">{f.username}</Link>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-4">Chưa có người theo dõi nào.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Following Modal */}
            {showFollowing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowFollowing(false)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h3 className="font-bold text-lg">Đang theo dõi</h3>
                            <button onClick={() => setShowFollowing(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-1 space-y-4">
                            {profile.following?.length > 0 ? (
                                profile.following.map(f => (
                                    <div key={f._id} className="flex items-center gap-3">
                                        {f.profile?.avatar ? (
                                            <img src={f.profile.avatar.startsWith('http') ? f.profile.avatar : `${API_URL}${f.profile.avatar}`} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold">
                                                {f.username.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <Link to={`/profile/${f._id}`} onClick={() => setShowFollowing(false)} className="font-bold hover:text-[#964B00]">{f.username}</Link>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-4">Chưa theo dõi ai.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {showLikesFor && (
                <LikesModal postId={showLikesFor} onClose={() => setShowLikesFor(null)} />
            )}

            <ImageModal imageUrl={selectedImageUrl} onClose={() => setSelectedImageUrl(null)} />

            {showEditProfile && (
                <EditProfileModal 
                    userProfile={profile} 
                    onClose={() => setShowEditProfile(false)} 
                    onUpdateSuccess={(updatedUser) => setProfile({ ...profile, ...updatedUser })}
                />
            )}
        </div>
    );
};

export default Profile;
