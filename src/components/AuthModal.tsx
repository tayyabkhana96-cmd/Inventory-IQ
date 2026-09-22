import React from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthScreen } from './AuthScreen';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode } = useAuth();

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl">
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center shadow-lg z-50 hover:bg-slate-50 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <AuthScreen
          initialMode={authModalMode}
          onCloseModal={closeAuthModal}
          isModal={true}
        />
      </div>
    </div>
  );
};
