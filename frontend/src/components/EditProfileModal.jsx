import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const EditProfileModal = ({ userProfile, onClose, onUpdateSuccess }) => {
    const { user, login } = useAuth(); // We might not need login, but if we need to update context maybe we can just reload or update local state. Actually AuthContext doesn't expose a setUser.
    const [formData, setFormData] = useState({
        username: userProfile.username || '',
        bio: userProfile.profile?.bio || '',
        location: userProfile.profile?.location || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const res = await api.put(`/users/${userProfile._id}/profile`, formData);
            onUpdateSuccess(res.data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-lg">Chỉnh sửa hồ sơ</h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên hiển thị</label>
                            <input 
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:border-transparent outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tiểu sử (Bio)</label>
                            <textarea 
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Viết vài dòng giới thiệu về bạn và thú cưng..."
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:border-transparent outline-none transition-all resize-none min-h-[100px]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực</label>
                            <input 
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Ví dụ: Hà Nội, TP.HCM"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#40E0D0] focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-full font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="px-5 py-2.5 bg-[#106A61] hover:bg-[#0c4c45] text-white rounded-full font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Đang lưu...' : (
                                <>
                                    <Check size={18} /> Lưu thay đổi
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
