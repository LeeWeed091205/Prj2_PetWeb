import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Heart, MapPin, Phone, Trash2, PlusCircle, X } from 'lucide-react';

const Adoptions = () => {
    const { user } = useAuth();
    const [adoptions, setAdoptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);

    // Form states
    const [petName, setPetName] = useState('');
    const [petType, setPetType] = useState('dog');
    const [age, setAge] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [contactInfo, setContactInfo] = useState('');

    useEffect(() => {
        fetchAdoptions();
    }, []);

    const fetchAdoptions = async () => {
        try {
            const response = await api.get('/adoptions');
            setAdoptions(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load adoptions');
            setLoading(false);
        }
    };

    const handleCreateAdoption = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/adoptions', {
                petName,
                petType,
                age,
                description,
                location,
                contactInfo,
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

    if (loading) return <div className="text-center py-10">Loading adoptions...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-900">Nhận nuôi thú cưng</h2>
                {user && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 flex items-center gap-2 transition-colors"
                    >
                        {showForm ? <X size={18} /> : <PlusCircle size={18} />}
                        {showForm ? 'Đóng form' : 'Đăng tin'}
                    </button>
                )}
            </div>

            {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}

            {/* Create Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-200 mb-8">
                    <h3 className="text-lg font-bold mb-4">Đăng tin nhận nuôi / Thất lạc</h3>
                    <form onSubmit={handleCreateAdoption} className="space-y-4">
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
                        <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400 relative">
                            [No Image]
                            <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                                {adoption.status}
                            </span>
                        </div>
                        <div className="p-4 flex-grow flex flex-col">
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
                                    disabled={adoption.adoptionRequests?.includes(user._id)}
                                    className="w-full mt-auto bg-orange-50 text-orange-600 border border-orange-200 py-2 rounded font-medium hover:bg-orange-100 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Heart size={18} className={adoption.adoptionRequests?.includes(user._id) ? "fill-orange-600" : ""} />
                                    {adoption.adoptionRequests?.includes(user._id) ? 'Đã quan tâm' : 'Nhận nuôi bé'}
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
