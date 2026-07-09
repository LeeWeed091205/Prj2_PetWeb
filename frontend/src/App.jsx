import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';

import Home from './pages/Home';
import Adoptions from './pages/Adoptions';
import Products from './pages/Products';
import SavedPosts from './pages/SavedPosts';
import Profile from './pages/Profile';
import PostDetail from './pages/PostDetail';
import AdminDashboard from './pages/AdminDashboard';

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="adoptions" element={<Adoptions />} />
                <Route path="products" element={<Products />} />
                <Route path="saved-posts" element={<SavedPosts />} />
                <Route path="profile/:id" element={<Profile />} />
                <Route path="post/:id" element={<PostDetail />} />
                <Route path="admin" element={<AdminDashboard />} />
            </Route>
        </Routes>
    );
};

export default App;
