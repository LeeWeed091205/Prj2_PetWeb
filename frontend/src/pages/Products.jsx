import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Trash2, PlusCircle, X, ShoppingCart, Image as ImageIcon, MapPin, Phone, Search } from 'lucide-react';

const Products = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [searchLocation, setSearchLocation] = useState('');

    // Form states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [location, setLocation] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async (search = '') => {
        try {
            const response = await api.get(`/products${search ? `?location=${search}` : ''}`);
            setProducts(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load products');
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview('');
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('price', Number(price));
            formData.append('location', location);
            formData.append('contactInfo', contactInfo);
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const response = await api.post('/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProducts([response.data, ...products]);
            setShowForm(false);
            // Reset
            setTitle('');
            setDescription('');
            setPrice('');
            setLocation('');
            setContactInfo('');
            clearImage();
        } catch (err) {
            alert('Failed to post product');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/products/${id}`);
            setProducts(products.filter(p => p._id !== id));
        } catch (err) {
            alert('Failed to delete product');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setLoading(true);
        fetchProducts(searchLocation);
    };

    const handleClearSearch = () => {
        setSearchLocation('');
        setLoading(true);
        fetchProducts('');
    };

    if (loading) return <div className="text-center py-10">Loading marketplace...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-gray-200 pb-4 gap-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingCart className="text-orange-500" /> Chợ phụ kiện
                </h2>
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <form onSubmit={handleSearch} className="relative flex-grow md:flex-grow-0 max-w-xs">
                        <input
                            type="text"
                            placeholder="Tìm theo khu vực..."
                            value={searchLocation}
                            onChange={(e) => setSearchLocation(e.target.value)}
                            className="w-full border border-gray-300 rounded-full py-2 pl-4 pr-10 focus:border-orange-500 focus:outline-none text-sm"
                        />
                        {searchLocation ? (
                            <button type="button" onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500">
                                <X size={16} />
                            </button>
                        ) : (
                            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500">
                                <Search size={16} />
                            </button>
                        )}
                    </form>
                    {user && (
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-orange-500 text-white px-4 py-2 rounded-full md:rounded-lg font-medium hover:bg-orange-600 flex items-center gap-2 transition-colors flex-shrink-0"
                        >
                            {showForm ? <X size={18} /> : <PlusCircle size={18} />}
                            <span className="hidden md:inline">{showForm ? 'Đóng form' : 'Đăng bán đồ'}</span>
                        </button>
                    )}
                </div>
            </div>

            {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}

            {/* Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-200 mb-8 max-w-2xl mx-auto">
                    <h3 className="text-lg font-bold mb-4">Thông tin sản phẩm</h3>
                    <form onSubmit={handleCreateProduct} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 focus:border-orange-500 focus:outline-none" placeholder="vd: Chuồng chó sắt, Đồ chơi cho mèo..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mức giá (VNĐ)</label>
                            <input type="number" required min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 focus:border-orange-500 focus:outline-none" placeholder="100000" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực / Địa chỉ</label>
                                <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 focus:border-orange-500 focus:outline-none" placeholder="Quận, Thành phố..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Thông tin liên hệ</label>
                                <input type="text" required value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 focus:border-orange-500 focus:outline-none" placeholder="SĐT, Zalo, Facebook..." />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả sản phẩm</label>
                            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 min-h-[100px] focus:border-orange-500 focus:outline-none" placeholder="Chi tiết sản phẩm, tình trạng cũ/mới..."></textarea>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh sản phẩm</label>
                            {imagePreview ? (
                                <div className="relative inline-block">
                                    <img src={imagePreview} alt="Preview" className="max-h-48 rounded-md object-cover border border-gray-200" />
                                    <button type="button" onClick={clearImage} className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 hover:bg-red-500">
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="product-image-upload"
                                    />
                                    <label htmlFor="product-image-upload" className="cursor-pointer text-gray-500 hover:text-orange-500 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 transition-colors">
                                        <ImageIcon size={32} className="mb-2" />
                                        <span className="text-sm font-medium">Bấm để chọn ảnh</span>
                                    </label>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end pt-2">
                            <button type="submit" className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors">
                                Đăng bán
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(product => (
                    <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                        <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                                <img 
                                    src={product.images[0].startsWith('http') ? product.images[0] : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${product.images[0]}`} 
                                    alt={product.title} 
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                                />
                            ) : (
                                <span>[Chưa có hình]</span>
                            )}
                        </div>
                        <div className="p-4 flex-grow flex flex-col">
                            <h3 className="font-bold text-gray-900 line-clamp-2 mb-1" title={product.title}>{product.title}</h3>
                            <p className="text-orange-600 font-bold text-lg mb-2">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                            </p>
                            <p className="text-gray-600 text-sm line-clamp-2 flex-grow mb-4">{product.description}</p>
                            
                            <div className="space-y-2 text-sm text-gray-600 mb-4 border-t border-gray-100 pt-3">
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-gray-400" /> {product.location || 'Chưa cập nhật'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone size={16} className="text-gray-400" /> {product.contactInfo || 'Chưa cập nhật'}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 border-t border-gray-100 pt-3 mt-auto">
                                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-xs">
                                    {product.seller?.username?.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm text-gray-700 flex-grow truncate">{product.seller?.username}</span>
                                {(user?._id === product.seller?._id || user?.role === 'ADMIN') && (
                                    <button onClick={() => handleDeleteProduct(product._id)} className="text-gray-400 hover:text-red-500">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {products.length === 0 && !loading && (
                <div className="text-center py-20 text-gray-500">
                    Chưa có sản phẩm nào được đăng bán.
                </div>
            )}
        </div>
    );
};

export default Products;
