import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Heart, MapPin, Phone, Trash2, PlusCircle, X, Image as ImageIcon, Search } from 'lucide-react';

const Adoptions = () => {
    const { user } = useAuth();
    const [adoptions, setAdoptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [searchLocation, setSearchLocation] = useState('');

    // Form states
    const [petName, setPetName] = useState('');
    const [petType, setPetType] = useState('dog');
    const [age, setAge] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [postType, setPostType] = useState('adoption');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        fetchAdoptions();
    }, []);

    const fetchAdoptions = async (search = '') => {
        try {
            const response = await api.get(`/adoptions${search ? `?location=${search}` : ''}`);
            setAdoptions(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load adoptions');
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

    const handleCreateAdoption = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('petName', petName);
            formData.append('petType', petType);
            formData.append('age', age);
            formData.append('description', description);
            formData.append('location', location);
            formData.append('contactInfo', contactInfo);
            formData.append('postType', postType);
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const response = await api.post('/adoptions', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAdoptions([response.data, ...adoptions]);
            setShowForm(false);
            // Reset form
            setPetName('');
            setPetType('dog');
            setAge('');
            setDescription('');
            setLocation('');
            setContactInfo('');
            setPostType('adoption');
            clearImage();
        } catch (err) {
            alert('Failed to post adoption');
        }
    };

    const handleDeleteAdoption = async (id) => {
        if (!window.confirm('Are you sure you want to delete this adoption post?')) return;
        try {
            await api.delete(`/adoptions/${id}`);
            setAdoptions(adoptions.filter(a => a._id !== id));
        } catch (err) {
            alert('Failed to delete adoption');
        }
    };

    const handleExpressInterest = async (id) => {
        try {
            await api.post(`/adoptions/${id}/interest`);
            alert('Interest expressed successfully! The owner can now see your request.');
            fetchAdoptions();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to express interest');
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const response = await api.put(`/adoptions/${id}/status`, { status: newStatus });
            setAdoptions(adoptions.map(a => a._id === id ? { ...a, status: response.data.status } : a));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const getStatusLabel = (status, postType) => {
        if (status === 'available') return postType === 'lost' ? 'Đang tìm kiếm' : 'Có sẵn';
        if (status === 'pending') return 'Đang chờ';
        if (status === 'adopted') return postType === 'lost' ? 'Đã tìm thấy' : 'Đã có chủ';
        return status;
    };

    const getStatusColor = (status) => {
        if (status === 'available') return 'bg-green-500';
        if (status === 'pending') return 'bg-yellow-500';
        if (status === 'adopted') return 'bg-gray-500';
        return 'bg-green-500';
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setLoading(true);
        fetchAdoptions(searchLocation);
    };

    const handleClearSearch = () => {
        setSearchLocation('');
        setLoading(true);
        fetchAdoptions('');
    };

    if (loading) return <div className="text-center py-10">Loading adoptions...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-gray-200 pb-4 gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Nhận nuôi hoặc tìm thú cưng thất lạc</h2>
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <form onSubmit={handleSearch} className="relative flex-grow md:flex-grow-0 max-w-xs">
                        <input
                            type="text"
                            placeholder="Tìm theo khu vực (vd: Hà Nội)"
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
                            <span className="hidden md:inline">{showForm ? 'Đóng form' : 'Đăng tin'}</span>
                        </button>
                    )}
                </div>
            </div>

            {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}

            {/* Create Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-200 mb-8">
                    <h3 className="text-lg font-bold mb-4">Đăng tin nhận nuôi / Thất lạc</h3>
                    <form onSubmit={handleCreateAdoption} className="space-y-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Loại bài đăng</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" value="adoption" checked={postType === 'adoption'} onChange={(e) => setPostType(e.target.value)} className="accent-orange-500" />
                                    <span>Nhận nuôi</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" value="lost" checked={postType === 'lost'} onChange={(e) => setPostType(e.target.value)} className="accent-orange-500" />
                                    <span>Tìm thú cưng thất lạc</span>
                                </label>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên thú cưng</label>
                                <input type="text" required value={petName} onChange={(e) => setPetName(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 focus:border-orange-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Loài</label>
                                <select value={petType} onChange={(e) => setPetType(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 focus:border-orange-500 focus:outline-none">
                                    <option value="dog">Chó</option>
                                    <option value="cat">Mèo</option>
                                    <option value="bird">Chim</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tuổi (ước lượng)</label>
                                <input type="text" required value={age} onChange={(e) => setAge(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 focus:border-orange-500 focus:outline-none" placeholder="vd: 2 tháng, 1 tuổi..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực / Địa chỉ</label>
                                <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 focus:border-orange-500 focus:outline-none" placeholder="Quận, Thành phố..." />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 min-h-[100px] focus:border-orange-500 focus:outline-none" placeholder="Đặc điểm nhận dạng, hoàn cảnh..."></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Thông tin liên hệ</label>
                            <input type="text" required value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 focus:border-orange-500 focus:outline-none" placeholder="SĐT, Zalo hoặc Facebook..." />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh thú cưng</label>
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
                                        id="adoption-image-upload"
                                    />
                                    <label htmlFor="adoption-image-upload" className="cursor-pointer text-gray-500 hover:text-orange-500 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 transition-colors">
                                        <ImageIcon size={32} className="mb-2" />
                                        <span className="text-sm font-medium">Bấm để chọn ảnh</span>
                                    </label>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end pt-2">
                            <button type="submit" className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors">
                                Đăng tin
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adoptions.map(adoption => (
                    <div key={adoption._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400 relative overflow-hidden">
                            {adoption.images && adoption.images.length > 0 ? (
                                <img 
                                    src={adoption.images[0].startsWith('http') ? adoption.images[0] : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${adoption.images[0]}`} 
                                    alt={adoption.petName} 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                <span>[No Image]</span>
                            )}
                            <span className={`absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded ${getStatusColor(adoption.status)}`}>
                                {getStatusLabel(adoption.status, adoption.postType)}
                            </span>
                        </div>
                        <div className="p-4 flex-grow flex flex-col">
                            <div className="mb-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${adoption.postType === 'lost' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {adoption.postType === 'lost' ? 'Tìm thú cưng thất lạc' : 'Nhận nuôi thú cưng'}
                                </span>
                            </div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{adoption.petName}</h3>
                                {(user?._id === adoption.owner?._id || user?.role === 'ADMIN') && (
                                    <button onClick={() => handleDeleteAdoption(adoption._id)} className="text-gray-400 hover:text-red-500">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                <span className="capitalize bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-xs font-medium">{adoption.petType}</span>
                                <span>• {adoption.age}</span>
                            </div>
                            
                            {(user?._id === adoption.owner?._id || user?.role === 'ADMIN') && (
                                <div className="mb-3 flex items-center gap-2 text-sm">
                                    <span className="text-gray-500 font-medium">Trạng thái:</span>
                                    <select 
                                        value={adoption.status}
                                        onChange={(e) => handleUpdateStatus(adoption._id, e.target.value)}
                                        className="border border-gray-300 rounded p-1 text-xs focus:outline-none focus:border-orange-500"
                                    >
                                        <option value="available">{adoption.postType === 'lost' ? 'Đang tìm kiếm' : 'Có sẵn'}</option>
                                        <option value="pending">Đang chờ</option>
                                        <option value="adopted">{adoption.postType === 'lost' ? 'Đã tìm thấy' : 'Đã có chủ'}</option>
                                    </select>
                                </div>
                            )}

                            <p className="text-gray-700 text-sm mb-4 line-clamp-3 flex-grow">{adoption.description}</p>
                            
                            <div className="space-y-2 text-sm text-gray-600 mb-4 border-t border-gray-100 pt-3">
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-gray-400" /> {adoption.location}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone size={16} className="text-gray-400" /> {adoption.contactInfo}
                                </div>
                            </div>

                            {user && user._id !== adoption.owner?._id && (
                                <button
                                    onClick={() => handleExpressInterest(adoption._id)}
                                    disabled={adoption.status === 'adopted' || adoption.adoptionRequests?.includes(user._id)}
                                    className={`w-full mt-auto border py-2 rounded font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${adoption.postType === 'lost' ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'}`}
                                >
                                    <Heart size={18} className={adoption.adoptionRequests?.includes(user._id) ? (adoption.postType === 'lost' ? "fill-red-600" : "fill-orange-600") : ""} />
                                    {adoption.status === 'adopted' ? (adoption.postType === 'lost' ? 'Đã tìm thấy' : 'Đã có chủ') : 
                                     adoption.adoptionRequests?.includes(user._id) ? 'Đã liên hệ' : 
                                     (adoption.postType === 'lost' ? 'Liên hệ báo tin' : 'Nhận nuôi bé')}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {adoptions.length === 0 && !loading && (
                <div className="text-center py-10 text-gray-500">
                    Hiện chưa có tin nhận nuôi nào.
                </div>
            )}
        </div>
    );
};

export default Adoptions;
