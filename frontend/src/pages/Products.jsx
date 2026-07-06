import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Trash2, PlusCircle, X, ShoppingCart } from 'lucide-react';

const Products = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);

    // Form states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load products');
            setLoading(false);
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/products', {
                title,
                description,
                price: Number(price),
                images: [],
            });
            setProducts([response.data, ...products]);
            setShowForm(false);
            // Reset
            setTitle('');
            setDescription('');
            setPrice('');
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

    if (loading) return <div className="text-center py-10">Loading marketplace...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingCart className="text-orange-500" /> Chợ phụ kiện
                </h2>
                {user && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 flex items-center gap-2 transition-colors"
                    >
                        {showForm ? <X size={18} /> : <PlusCircle size={18} />}
                        {showForm ? 'Đóng form' : 'Đăng bán đồ'}
                    </button>
                )}
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả sản phẩm</label>
                            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 min-h-[100px] focus:border-orange-500 focus:outline-none" placeholder="Chi tiết sản phẩm, tình trạng cũ/mới, thông tin liên lạc..."></textarea>
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
                        <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                            [Hình ảnh sản phẩm]
                        </div>
                        <div className="p-4 flex-grow flex flex-col">
                            <h3 className="font-bold text-gray-900 line-clamp-2 mb-1" title={product.title}>{product.title}</h3>
                            <p className="text-orange-600 font-bold text-lg mb-2">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                            </p>
                            <p className="text-gray-600 text-sm line-clamp-2 flex-grow mb-4">{product.description}</p>
                            
                            <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
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
