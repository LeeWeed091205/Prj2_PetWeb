import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Search, Bell, Mail, Bone, ShoppingBag, Bookmark, User, Shield } from 'lucide-react';
import api from '../services/api';

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);
    
    // Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim()) {
                try {
                    const res = await api.get(`/users/search?q=${searchQuery}`);
                    setSearchResults(res.data);
                    setShowSearchDropdown(true);
                } catch (err) {
                    console.error('Search failed', err);
                }
            } else {
                setSearchResults([]);
                setShowSearchDropdown(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to fetch notifications');
        }
    };

    const handleNotificationClick = async (notif) => {
        if (!notif.isRead) {
            try {
                await api.put(`/notifications/${notif._id}/read`);
                setNotifications(notifications.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
            } catch (err) {
                console.error(err);
            }
        }
        setShowNotifications(false);
        if (notif.type === 'FOLLOW') {
            navigate(`/profile/${notif.sender._id}`);
        } else if (['LIKE', 'COMMENT', 'SAVE'].includes(notif.type) && notif.post) {
            navigate(`/post/${notif.post}`);
        } else {
            navigate('/');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Navigation links mapping
    const navLinks = [
        { name: 'Home', path: '/', icon: <Home size={20} /> },
        { name: 'Adoptions', path: '/adoptions', icon: <Bone size={20} /> },
        { name: 'Products', path: '/products', icon: <ShoppingBag size={20} /> },
        { name: 'Saved', path: '/saved-posts', icon: <Bookmark size={20} /> },
        { name: 'Profile', path: user ? `/profile/${user._id}` : '/login', icon: <User size={20} /> },
    ];

    if (user && user.role === 'ADMIN') {
        navLinks.push({ name: 'Admin', path: '/admin', icon: <Shield size={20} /> });
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans text-gray-800">
            {/* Top Navbar */}
            <header className="bg-[#FDFBF7] sticky top-0 z-40 border-b border-gray-100">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
                    <div className="flex items-center gap-8 flex-1">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/logo.jpg" alt="PetNet Logo" className="w-10 h-10 object-contain" />
                            <span className="text-xl font-bold text-gray-900 hidden sm:block">PetNet</span>
                        </Link>
                        
                        {/* Search Bar */}
                        <div className="hidden md:flex relative flex-1 max-w-md" ref={searchRef}>
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search size={18} className="text-gray-400" />
                            </div>
                            <input 
                                type="text"
                                placeholder="Tìm kiếm người dùng..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
                                className="w-full bg-[#FFF5EE] border-none rounded-full py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-[#40E0D0] focus:outline-none placeholder-gray-400"
                            />
                            
                            {/* Search Dropdown */}
                            {showSearchDropdown && searchResults.length > 0 && (
                                <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                                    <div className="py-2 max-h-[300px] overflow-y-auto">
                                        {searchResults.map(u => (
                                            <Link 
                                                key={u._id} 
                                                to={`/profile/${u._id}`}
                                                onClick={() => {
                                                    setShowSearchDropdown(false);
                                                    setSearchQuery('');
                                                }}
                                                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                                            >
                                                {u.profile?.avatar ? (
                                                    <img src={u.profile.avatar.startsWith('http') ? u.profile.avatar : `${API_URL}${u.profile.avatar}`} alt={u.username} className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-xs">
                                                        {u.username.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="font-medium text-sm text-gray-900">{u.username}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {showSearchDropdown && searchQuery.trim() && searchResults.length === 0 && (
                                <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 p-4 text-center text-sm text-gray-500 z-50">
                                    Không tìm thấy người dùng nào.
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Right Actions */}
                    <div className="flex items-center gap-4 sm:gap-6">
                        {user ? (
                            <>
                                <div className="relative" ref={notificationRef}>
                                    <button 
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="text-gray-500 hover:text-[#964B00] transition-colors relative"
                                        title="Notifications"
                                    >
                                        <Bell size={22} />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Notifications Dropdown */}
                                    {showNotifications && (
                                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                                <h3 className="font-bold text-gray-800">Notifications</h3>
                                            </div>
                                            <div className="max-h-80 overflow-y-auto">
                                                {notifications.length > 0 ? (
                                                    notifications.map(notif => (
                                                        <div 
                                                            key={notif._id} 
                                                            onClick={() => handleNotificationClick(notif)}
                                                            className={`p-4 border-b border-gray-50 cursor-pointer transition-colors flex gap-3 items-start ${notif.isRead ? 'bg-white hover:bg-gray-50' : 'bg-[#F0FDF8] hover:bg-[#E0F8F0]'}`}
                                                        >
                                                            {notif.sender?.profile?.avatar ? (
                                                                <img src={notif.sender.profile.avatar.startsWith('http') ? notif.sender.profile.avatar : `${API_URL}${notif.sender.profile.avatar}`} alt={notif.sender.username} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-sm flex-shrink-0">
                                                                    {notif.sender?.username?.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <div className="flex-1">
                                                                <p className="text-sm text-gray-800">
                                                                    <span className="font-bold">{notif.sender?.username}</span>
                                                                    {notif.type === 'LIKE' && ' đã thích bài viết của bạn.'}
                                                                    {notif.type === 'COMMENT' && ' đã bình luận về bài viết của bạn.'}
                                                                    {notif.type === 'SAVE' && ' đã lưu bài viết của bạn.'}
                                                                    {notif.type === 'INTEREST' && ' đã liên hệ với bạn về thú cưng.'}
                                                                    {notif.type === 'FOLLOW' && ' đã bắt đầu theo dõi bạn.'}
                                                                </p>
                                                                <span className="text-xs text-gray-500 mt-1 block">
                                                                    {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                                </span>
                                                            </div>
                                                            {!notif.isRead && (
                                                                <div className="w-2 h-2 rounded-full bg-[#40E0D0] mt-2"></div>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-6 text-center text-gray-500 text-sm">
                                                        No new notifications.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <Link to={`/profile/${user._id}`} className="transition-transform hover:scale-105 ml-2" title="Profile">
                                    {user.profile?.avatar ? (
                                        <img src={user.profile.avatar.startsWith('http') ? user.profile.avatar : `${API_URL}${user.profile.avatar}`} alt={user.username} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-[#FFE5B4] flex items-center justify-center text-[#964B00] font-bold text-sm border-2 border-white shadow-sm">
                                            {user.username?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </Link>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-gray-700 hover:text-[#964B00] text-sm font-medium">Login</Link>
                                <Link to="/register" className="bg-[#964B00] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#7a3c00] transition-colors">Sign up</Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className={`max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex ${isAuthPage ? 'justify-center' : 'gap-8'}`}>
                
                {/* Left Sidebar */}
                {!isAuthPage && (
                    <aside className="hidden lg:flex flex-col w-[260px] flex-shrink-0 sticky top-[96px] h-[calc(100vh-120px)]">
                    {/* User Mini Card */}
                    {user && (
                        <div className="bg-[#FFF8F3] rounded-2xl p-4 mb-6 flex items-center gap-3">
                            {user.profile?.avatar ? (
                                <img src={user.profile.avatar.startsWith('http') ? user.profile.avatar : `${API_URL}${user.profile.avatar}`} alt={user.username} className="w-12 h-12 rounded-xl object-cover" />
                            ) : (
                                <div className="w-12 h-12 rounded-xl bg-[#FFE5B4] flex items-center justify-center text-[#964B00] font-bold text-lg">
                                    {user.username?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="overflow-hidden">
                                <h4 className="font-bold text-gray-900 truncate">{user.username}</h4>
                                <p className="text-xs text-gray-500 truncate">Pet Lover</p>
                            </div>
                        </div>
                    )}
                    
                    {/* Navigation */}
                    <nav className="flex flex-col gap-2 flex-1 overflow-y-auto min-h-0 pr-2 custom-scrollbar">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
                            return (
                                <Link 
                                    key={link.name} 
                                    to={link.path}
                                    className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl font-medium transition-all ${
                                        isActive 
                                            ? 'bg-[#40E0D0] text-gray-900 shadow-sm' 
                                            : 'text-gray-600 hover:bg-[#FFF5EE] hover:text-[#964B00]'
                                    }`}
                                >
                                    {link.icon}
                                    <span>{link.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                    
                    {/* Bottom Actions */}
                    <div className="mt-8 flex flex-col gap-4">
                        <button 
                            onClick={() => navigate('/')}
                            className="bg-[#964B00] text-white w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#7a3c00] transition-all shadow-md shadow-orange-900/10"
                        >
                            Post Update
                        </button>
                        
                        {user && (
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-5 py-3 text-gray-500 hover:text-red-500 transition-colors mt-4"
                            >
                                <LogOut size={20} />
                                <span className="font-medium">Logout</span>
                            </button>
                        )}
                    </div>
                </aside>
                )}

                {/* Main Content (Outlet) */}
                <main className={`flex-1 w-full ${isAuthPage ? 'max-w-md' : 'max-w-full lg:max-w-[calc(100%-292px)]'}`}>
                    <Outlet />
                </main>
            </div>
            
            {/* Mobile Navigation (Bottom bar) */}
            {!isAuthPage && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 z-50">
                {navLinks.filter(l => l.name !== 'Profile' && l.name !== 'Saved').map(link => (
                     <Link key={link.name} to={link.path} className={`p-2 rounded-xl ${location.pathname === link.path ? 'bg-[#40E0D0] text-gray-900' : 'text-gray-500'}`}>
                         {link.icon}
                     </Link>
                ))}
            </div>
            )}
        </div>
    );
};

export default MainLayout;
