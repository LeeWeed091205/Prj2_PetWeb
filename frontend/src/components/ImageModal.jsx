import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const ImageModal = ({ imageUrl, onClose }) => {
    useEffect(() => {
        if (!imageUrl) return;
        
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [imageUrl, onClose]);

    if (!imageUrl) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
            onClick={onClose}
        >
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors p-2 bg-black bg-opacity-50 rounded-full"
            >
                <X size={24} />
            </button>
            <img 
                src={imageUrl} 
                alt="Full size" 
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
};

export default ImageModal;
