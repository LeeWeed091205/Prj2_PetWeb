import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Bone, ShoppingBag } from 'lucide-react';

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Link to="/" className="text-xl font-bold text-orange-500 flex items-center gap-2">
                                    <Bone size={24} />
                                    PetWeb
                                </Link>
                            </div>
                            <nav className="ml-6 hidden md:flex space-x-8">
                                <Link to="/" className="text-gray-700 hover:text-orange-500 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-orange-500 text-sm font-medium">
                                    <Home className="w-4 h-4 mr-1" /> Home
                                </Link>
                                <Link to="/adoptions" className="text-gray-700 hover:text-orange-500 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-orange-500 text-sm font-medium">
                                    <Bone className="w-4 h-4 mr-1" /> Adoptions
                                </Link>
                                <Link to="/products" className="text-gray-700 hover:text-orange-500 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-orange-500 text-sm font-medium">
                                    <ShoppingBag className="w-4 h-4 mr-1" /> Products
                                </Link>
                            </nav>
                        </div>
                        <div className="flex items-center">
                            {user ? (
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium text-gray-700">Hello, {user.username}</span>
                                    <button
                                        onClick={handleLogout}
                                        className="text-gray-500 hover:text-red-500 transition-colors"
                                    >
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Link to="/login" className="text-gray-700 hover:text-orange-500 text-sm font-medium">Login</Link>
                                    <Link to="/register" className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-600 transition-colors">Sign up</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>

            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
                    &copy; 2026 PetWeb. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
