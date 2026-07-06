import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';

import Home from './pages/Home';
import Adoptions from './pages/Adoptions';
import Products from './pages/Products';

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="adoptions" element={<Adoptions />} />
                <Route path="products" element={<Products />} />
            </Route>
        </Routes>
    );
};

export default App;
