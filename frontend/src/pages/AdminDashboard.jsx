import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Users, FileText, MessageCircle, Trash2, LayoutDashboard, Search, Eye } from 'lucide-react';
import ImageModal from '../components/ImageModal';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('overview'); // overview, users, posts
    const [stats, setStats] = useState(null);
    const [recentUsers, setRecentUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allPosts, setAllPosts] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedImageUrl, setSelectedImageUrl] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        // Double check admin role
        if (!user || user.role !== 'ADMIN') {
            navigate('/');
            return;
        }
        fetchDashboardData();
    }, [user, activeTab]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'overview') {
                const res = await api.get('/admin/stats');
                setStats(res.data.stats);
                setRecentUsers(res.data.recentUsers);
            } else if (activeTab === 'users') {
                const res = await api.get('/admin/users');
                setAllUsers(res.data);
            } else if (activeTab === 'posts') {
                const res = await api.get('/admin/posts');
                setAllPosts(res.data);
            }
            setError('');
        } catch (err) {
            console.error('Failed to fetch admin data', err);
            setError('Không thể tải dữ liệu quản trị. Hãy chắc chắn bạn có quyền truy cập.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (window.confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN người dùng ${username} và toàn bộ bài viết của họ không?`)) {
            try {
                await api.delete(`/admin/users/${userId}`);
                setAllUsers(allUsers.filter(u => u._id !== userId));
                alert('Đã xóa người dùng thành công.');
            } catch (err) {
                alert(err.response?.data?.message || 'Lỗi khi xóa người dùng');
            }
        }
    };

    const handleDeletePost = async (postId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
            try {
                await api.delete(`/admin/posts/${postId}`);
                setAllPosts(allPosts.filter(p => p._id !== postId));
            } catch (err) {
                alert('Lỗi khi xóa bài viết');
            }
        }
    };

    const filteredUsers = allUsers.filter(u => 
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredPosts = allPosts.filter(p => 
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (p.author?.username || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && !stats && !allUsers.length && !allPosts.length) {
        return <div className="text-center py-20 font-bold text-gray-500">Đang tải dữ liệu quản trị...</div>;
    }

    if (error) {
        return <div className="text-center py-20 text-red-500 font-bold">{error}</div>;
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Admin Header */}
            <div className="bg-[#106A61] p-6 text-white flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <p className="text-teal-100 text-sm mt-1">Quản lý hệ thống mạng xã hội PetWeb</p>
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-xl text-sm font-medium">
                    Xin chào, {user.username}
                </div>
            </div>

            {/* Admin Tabs */}
            <div className="flex border-b border-gray-100">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-colors ${activeTab === 'overview' ? 'text-[#106A61] border-b-2 border-[#106A61] bg-teal-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <LayoutDashboard size={18} /> Tổng quan
                </button>
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-colors ${activeTab === 'users' ? 'text-[#106A61] border-b-2 border-[#106A61] bg-teal-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <Users size={18} /> Quản lý Người dùng
                </button>
                <button 
                    onClick={() => setActiveTab('posts')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-colors ${activeTab === 'posts' ? 'text-[#106A61] border-b-2 border-[#106A61] bg-teal-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <FileText size={18} /> Quản lý Bài viết
                </button>
            </div>

            {/* Tab Content */}
            <div className="p-6 overflow-y-auto flex-1 bg-[#FDFBF7]">
                
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && stats && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center">
                                    <Users size={28} />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm font-medium">Tổng Người Dùng</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
                                    <FileText size={28} />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm font-medium">Tổng Bài Viết</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.totalPosts}</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
                                    <MessageCircle size={28} />
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm font-medium">Tổng Bình Luận</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.totalComments}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Người dùng mới đăng ký</h3>
                            <div className="divide-y divide-gray-100">
                                {recentUsers.map(u => (
                                    <div key={u._id} className="py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {u.profile?.avatar ? (
                                                <img src={u.profile.avatar.startsWith('http') ? u.profile.avatar : `${API_URL}${u.profile.avatar}`} alt={u.username} className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                                                    {u.username.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-sm text-gray-900">{u.username}</p>
                                                <p className="text-xs text-gray-500">{u.email}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* USERS TAB */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Danh sách người dùng</h3>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Tìm kiếm..." 
                                    className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#40E0D0]"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 uppercase font-medium">
                                    <tr>
                                        <th className="px-6 py-4 border-b">Người dùng</th>
                                        <th className="px-6 py-4 border-b">Vai trò</th>
                                        <th className="px-6 py-4 border-b">Ngày tham gia</th>
                                        <th className="px-6 py-4 border-b text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(u => (
                                        <tr key={u._id} className="border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                {u.profile?.avatar ? (
                                                    <img src={u.profile.avatar.startsWith('http') ? u.profile.avatar : `${API_URL}${u.profile.avatar}`} className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">{u.username.charAt(0).toUpperCase()}</div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-gray-900">{u.username}</p>
                                                    <p className="text-xs text-gray-500">{u.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                {u._id !== user._id && u.role !== 'ADMIN' && (
                                                    <button onClick={() => handleDeleteUser(u._id, u.username)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* POSTS TAB */}
                {activeTab === 'posts' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Danh sách bài viết</h3>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Tìm nội dung..." 
                                    className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#40E0D0]"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 uppercase font-medium">
                                    <tr>
                                        <th className="px-6 py-4 border-b">Tác giả</th>
                                        <th className="px-6 py-4 border-b w-1/3">Nội dung</th>
                                        <th className="px-6 py-4 border-b">Phân loại</th>
                                        <th className="px-6 py-4 border-b">Ngày đăng</th>
                                        <th className="px-6 py-4 border-b text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPosts.map(p => (
                                        <tr key={p._id} className="border-b hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900">{p.author?.username || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="line-clamp-2 text-gray-800">{p.content}</p>
                                                {p.images && p.images.length > 0 && (
                                                    <span 
                                                        className="inline-flex items-center gap-1 text-xs text-blue-500 mt-1 cursor-pointer hover:underline"
                                                        onClick={() => setSelectedImageUrl(p.images[0].startsWith('http') ? p.images[0] : `${API_URL}${p.images[0]}`)}
                                                    >
                                                        <Eye size={12} /> Có {p.images.length} ảnh
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 capitalize">
                                                <span className="px-2 py-1 bg-teal-50 text-teal-700 rounded text-xs font-medium">
                                                    {p.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{new Date(p.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleDeletePost(p._id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
            <ImageModal imageUrl={selectedImageUrl} onClose={() => setSelectedImageUrl(null)} />
        </div>
    );
};

export default AdminDashboard;
