import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, UserRole } from '../types';
import { INITIAL_USERS, StoredUserAccount } from '../data/initialData';
import { playSuccessChime, playErrorTone } from '../utils/audio';
import confetti from 'canvas-confetti';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  terminal?: string;
  location?: string;
  phone?: string;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  accounts: AuthUser[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (data: RegisterData) => { success: boolean; error?: string };
  loginWithGoogle: () => void;
  continueAsGuest: () => void;
  logout: () => void;
  switchUser: (userId: string) => boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: 'login' | 'signup') => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_STORAGE_KEY = 'inventoryiq_auth_accounts_v1';
const CURRENT_USER_KEY = 'inventoryiq_auth_current_user_v1';

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: 'bg-indigo-600',
  MANAGER: 'bg-purple-600',
  CASHIER: 'bg-emerald-600',
  WAREHOUSE_LEAD: 'bg-amber-600',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Stored user accounts with credentials
  const [storedAccounts, setStoredAccounts] = useState<StoredUserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  // Current session user (defaults to null so AuthScreen matches user design immediately)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      if (saved === 'null') return null;
      if (saved) {
        return JSON.parse(saved);
      }
      return null;
    } catch {
      return null;
    }
  });

  // Modal visibility and state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  // Sync accounts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(storedAccounts));
    } catch (e) {
      console.error('Failed to persist accounts:', e);
    }
  }, [storedAccounts]);

  // Sync currentUser to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.setItem(CURRENT_USER_KEY, 'null');
      }
    } catch (e) {
      console.error('Failed to persist current user:', e);
    }
  }, [currentUser]);

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const account = storedAccounts.find(u => u.email.toLowerCase() === cleanEmail);

    if (!account) {
      playErrorTone();
      return { success: false, error: 'No account found with this email address.' };
    }

    if (account.passwordHash !== password) {
      playErrorTone();
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    // Success: strip password and set session
    const { passwordHash: _, ...safeUser } = account;
    setCurrentUser(safeUser);
    playSuccessChime();
    setIsAuthModalOpen(false);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.2 },
    });

    return { success: true };
  };

  const register = (data: RegisterData): { success: boolean; error?: string } => {
    const cleanName = data.name.trim();
    const cleanEmail = data.email.trim().toLowerCase();

    if (!cleanName) {
      return { success: false, error: 'Please enter your full name.' };
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Please provide a valid email address.' };
    }

    if (!data.password || data.password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }

    // Check if email already registered
    const existing = storedAccounts.some(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      playErrorTone();
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }

    const newAccount: StoredUserAccount = {
      id: `user-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role: data.role,
      terminal: data.terminal || `${data.role === 'CASHIER' ? 'POS Counter' : 'Desk Terminal'}`,
      location: data.location || 'Retail Floor & Store',
      avatarColor: ROLE_COLORS[data.role] || 'bg-indigo-600',
      phone: data.phone || '',
      createdAt: new Date().toISOString(),
      passwordHash: data.password,
    };

    const updated = [newAccount, ...storedAccounts];
    setStoredAccounts(updated);

    // Auto-login the new user
    const { passwordHash: _, ...safeUser } = newAccount;
    setCurrentUser(safeUser);

    playSuccessChime();
    setIsAuthModalOpen(false);

    confetti({
      particleCount: 75,
      spread: 80,
      origin: { y: 0.3 },
    });

    return { success: true };
  };

  const loginWithGoogle = () => {
    // Check if google account already exists or create for Tayyab Khan (from user metadata)
    const googleEmail = 'tayyabkhana45@gmail.com';
    let account = storedAccounts.find(u => u.email.toLowerCase() === googleEmail);

    if (!account) {
      account = {
        id: `google-user-${Date.now()}`,
        name: 'Tayyab Khan',
        email: googleEmail,
        role: 'ADMIN',
        terminal: 'Admin Workstation',
        location: 'Main Retail Floor & HQ',
        avatarColor: 'bg-indigo-600',
        phone: '+92 300 8472910',
        createdAt: new Date().toISOString(),
        passwordHash: 'google_oauth_auth_token',
      };
      setStoredAccounts(prev => [account!, ...prev]);
    }

    const { passwordHash: _, ...safeUser } = account;
    setCurrentUser(safeUser);
    playSuccessChime();
    setIsAuthModalOpen(false);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.25 },
    });
  };

  const continueAsGuest = () => {
    // Quick demo guest access
    const guestUser: AuthUser = {
      id: 'guest-preview',
      name: 'Guest Operator',
      email: 'guest@inventoryiq.com',
      role: 'CASHIER',
      terminal: 'Demo Terminal 01',
      location: 'Retail Store Demo',
      avatarColor: 'bg-slate-600',
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(guestUser);
    playSuccessChime();
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setCurrentUser(null);
    playSuccessChime();
  };

  const switchUser = (userId: string): boolean => {
    const target = storedAccounts.find(u => u.id === userId);
    if (target) {
      const { passwordHash: _, ...safeUser } = target;
      setCurrentUser(safeUser);
      playSuccessChime();
      return true;
    }
    return false;
  };

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const safeAccounts: AuthUser[] = storedAccounts.map(({ passwordHash: _, ...safe }) => safe);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        accounts: safeAccounts,
        isAuthenticated: !!currentUser,
        login,
        register,
        loginWithGoogle,
        continueAsGuest,
        logout,
        switchUser,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
