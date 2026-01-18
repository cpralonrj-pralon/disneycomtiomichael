import React from 'react';
import { supabase } from '../lib/supabaseClient';

interface AuthModalProps {
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error logging in:', error);
            alert('Erro ao fazer login com Google. Tente novamente.');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-surface border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
                    <span className="material-symbols-outlined">close</span>
                </button>

                <div className="text-center mb-8">
                    <div className="size-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                        <span className="material-symbols-outlined text-3xl">lock</span>
                    </div>
                    <h3 className="text-2xl font-black mb-2">Identifique-se</h3>
                    <p className="text-white/60 text-sm">Para deixar seu depoimento, precisamos saber quem é você. É rapidinho!</p>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    className="w-full bg-white text-navy-deep font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
                    Entrar com Google
                </button>
            </div>
        </div>
    );
};

export default AuthModal;
