import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Content */}
            <div className="relative bg-surface border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="sticky top-0 right-0 z-10 flex justify-end p-4">
                    <button
                        onClick={onClose}
                        className="bg-black/50 hover:bg-white text-white hover:text-black rounded-full p-2 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="px-8 pb-8 pt-2">
                    {title && <h2 className="text-3xl font-black mb-6 text-primary">{title}</h2>}
                    <div className="prose prose-invert prose-p:text-white/70 max-w-none">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
