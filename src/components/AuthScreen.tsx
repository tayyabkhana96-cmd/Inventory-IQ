import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  TrendingUp,
  Settings,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface AuthScreenProps {
  initialMode?: 'login' | 'signup';
  onCloseModal?: () => void;
  isModal?: boolean;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialMode = 'login',
  onCloseModal,
  isModal = false,
}) => {
  const {
    login,
    register,
    loginWithGoogle,
    continueAsGuest,
    authModalMode,
    setAuthModalMode,
    closeAuthModal,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode || authModalMode || 'login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState<UserRole>('ADMIN');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [regError, setRegError] = useState('');

  const handleTabChange = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setAuthModalMode(newMode);
    setLoginError('');
    setRegError('');
    setForgotSent(false);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim()) {
      setLoginError('Please enter your email address.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Please enter your password.');
      return;
    }

    const res = login(loginEmail, loginPassword);
    if (!res.success && res.error) {
      setLoginError(res.error);
    } else if (onCloseModal) {
      onCloseModal();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!agreeTerms) {
      setRegError('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }

    const res = register({
      name: regName,
      email: regEmail,
      password: regPassword,
      role: regRole,
      terminal: regRole === 'CASHIER' ? 'Register 01' : 'Main Console',
      location: 'Central Branch',
    });

    if (!res.success && res.error) {
      setRegError(res.error);
    } else if (onCloseModal) {
      onCloseModal();
    }
  };

  const fillDemoCredentials = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setLoginError('');
  };

  return (
    <div
      className={`w-full ${
        isModal
          ? 'max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] overflow-y-auto'
          : 'min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-8'
      }`}
    >
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* ================= LEFT BRAND & HERO COLUMN ================= */}
        <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-between py-4 lg:py-6 px-2 sm:px-6">
          
          {/* Top Brand Logo */}
          <div className="flex items-center gap-3.5 mb-8 sm:mb-12">
            {/* Custom 3D Isometric Cube / Hexagon with Bar Chart */}
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full drop-shadow-md"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Hexagon / Cube Outer Frame */}
                <path
                  d="M50 8L88 28V72L50 92L12 72V28L50 8Z"
                  stroke="#2563EB"
                  strokeWidth="8"
                  strokeLinejoin="round"
                  className="fill-blue-50/50"
                />
                {/* Vertical Bar Chart Bars inside */}
                {/* Green Bar (Left) */}
                <rect x="28" y="46" width="10" height="24" rx="4" fill="#10B981" />
                {/* Cyan Bar (Middle) */}
                <rect x="44" y="34" width="10" height="36" rx="4" fill="#06B6D4" />
                {/* Blue Bar (Right) */}
                <rect x="60" y="24" width="10" height="46" rx="4" fill="#2563EB" />
              </svg>
            </div>

            <div>
              <div className="flex items-baseline tracking-tight">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Inventory
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 ml-1.5">
                  IQ
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 tracking-normal mt-0.5">
                Smarter Inventory. Better Decisions.
              </p>
            </div>
          </div>

          {/* Headline and Narrative */}
          <div className="space-y-4 mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Take control of <br />
              your inventory
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-lg">
              Track stock, reduce waste, and make smarter decisions with Inventory IQ.
            </p>
          </div>

          {/* 3 Value Proposition Bullets with Round Icons */}
          <div className="space-y-4 sm:space-y-5 mb-8 sm:mb-10 max-w-md">
            {/* 1. Real-Time Tracking */}
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <TrendingUp className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  Real-Time Tracking
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
                  Know what you have, always.
                </p>
              </div>
            </div>

            {/* 2. Streamlined Operations */}
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Settings className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  Streamlined Operations
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
                  Save time and reduce errors.
                </p>
              </div>
            </div>

            {/* 3. Better Forecasting */}
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  Better Forecasting
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
                  Stay ahead of demand.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Custom Vector Illustration */}
          <div className="relative w-full max-w-lg mt-2 pt-2">
            <svg
              viewBox="0 0 520 280"
              className="w-full h-auto"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Soft light blue backdrop circular zone */}
              <ellipse cx="250" cy="190" rx="220" ry="85" fill="#EBF4FF" />

              {/* Warehouse Storage Rack on the Left */}
              <g id="warehouse-racks">
                {/* Vertical steel posts */}
                <rect x="25" y="60" width="7" height="175" rx="2" fill="#2563EB" />
                <rect x="75" y="60" width="7" height="175" rx="2" fill="#2563EB" />
                <rect x="130" y="60" width="7" height="175" rx="2" fill="#1D4ED8" />

                {/* Horizontal metal shelves */}
                <rect x="20" y="100" width="120" height="7" rx="2" fill="#3B82F6" />
                <rect x="20" y="150" width="120" height="7" rx="2" fill="#3B82F6" />
                <rect x="20" y="200" width="120" height="7" rx="2" fill="#3B82F6" />

                {/* Cardboard Boxes Top Tier */}
                <rect x="32" y="72" width="28" height="28" rx="2" fill="#D97706" />
                <rect x="42" y="72" width="8" height="28" fill="#B45309" />
                <rect x="68" y="70" width="34" height="30" rx="2" fill="#F59E0B" />
                <rect x="80" y="70" width="10" height="30" fill="#D97706" />
                <rect x="106" y="76" width="22" height="24" rx="2" fill="#D97706" />

                {/* Cardboard Boxes Middle Tier */}
                <rect x="30" y="118" width="42" height="32" rx="2" fill="#FBBF24" />
                <rect x="46" y="118" width="10" height="32" fill="#D97706" />
                <rect x="78" y="122" width="32" height="28" rx="2" fill="#D97706" />
                <rect x="89" y="122" width="8" height="28" fill="#B45309" />

                {/* Cardboard Boxes Bottom Tier */}
                <rect x="32" y="168" width="32" height="32" rx="2" fill="#D97706" />
                <rect x="42" y="168" width="8" height="32" fill="#B45309" />
                <rect x="70" y="166" width="46" height="34" rx="2" fill="#F59E0B" />
                <rect x="88" y="166" width="12" height="34" fill="#D97706" />
              </g>

              {/* Large Modern Monitor on the Right */}
              <g id="dashboard-monitor">
                {/* Monitor Stand Base */}
                <ellipse cx="370" cy="225" rx="36" ry="7" fill="#94A3B8" />
                <rect x="363" y="195" width="14" height="30" fill="#64748B" rx="3" />

                {/* Monitor Outer Frame */}
                <rect
                  x="235"
                  y="55"
                  width="220"
                  height="145"
                  rx="14"
                  fill="#FFFFFF"
                  stroke="#3B82F6"
                  strokeWidth="4"
                  className="drop-shadow-lg"
                />

                {/* Monitor Content - Bar Chart on Left */}
                <rect x="255" y="110" width="10" height="20" rx="3" fill="#60A5FA" />
                <rect x="270" y="98" width="10" height="32" rx="3" fill="#38BDF8" />
                <rect x="285" y="85" width="10" height="45" rx="3" fill="#0284C7" />
                <rect x="300" y="74" width="10" height="56" rx="3" fill="#2563EB" />

                {/* Donut Chart on Right */}
                <circle
                  cx="370"
                  cy="102"
                  r="24"
                  fill="none"
                  stroke="#06B6D4"
                  strokeWidth="8"
                  strokeDasharray="90 60"
                />
                <circle
                  cx="370"
                  cy="102"
                  r="24"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="8"
                  strokeDasharray="40 110"
                  strokeDashoffset="-90"
                />

                {/* Horizontal data rows */}
                <rect x="255" y="145" width="175" height="7" rx="3.5" fill="#E2E8F0" />
                <circle cx="260" cy="165" r="4" fill="#38BDF8" />
                <rect x="270" y="162" width="70" height="6" rx="3" fill="#E2E8F0" />
                <circle cx="260" cy="178" r="4" fill="#38BDF8" />
                <rect x="270" y="175" width="55" height="6" rx="3" fill="#E2E8F0" />
              </g>

              {/* Warehouse Inventory Manager Character */}
              <g id="inventory-manager">
                {/* Dark Hair */}
                <ellipse cx="195" cy="98" rx="14" ry="14" fill="#0F172A" />
                {/* Head / Neck */}
                <ellipse cx="202" cy="104" rx="10" ry="10" fill="#FED7AA" />
                <ellipse cx="196" cy="100" rx="12" ry="10" fill="#0F172A" />
                <rect x="194" y="112" width="9" height="12" fill="#FED7AA" />

                {/* Blue Shirt Body */}
                <path
                  d="M178 124C184 120 196 120 205 120C214 120 226 120 232 125L236 150L228 152L224 235H180L176 152L168 150L178 124Z"
                  fill="#2563EB"
                />

                {/* Arms holding tablet */}
                {/* Left Arm */}
                <path d="M174 135L195 170L205 165L186 132Z" fill="#1D4ED8" />
                {/* Right Arm */}
                <path d="M228 135L216 168L225 174L238 138Z" fill="#1D4ED8" />
                {/* Hands */}
                <ellipse cx="206" cy="167" rx="5" ry="5" fill="#FED7AA" />
                <ellipse cx="218" cy="170" rx="5" ry="5" fill="#FED7AA" />

                {/* Tablet Device */}
                <rect
                  x="204"
                  y="152"
                  width="36"
                  height="46"
                  rx="4"
                  transform="rotate(-15 204 152)"
                  fill="#FFFFFF"
                  stroke="#1E293B"
                  strokeWidth="2.5"
                  className="drop-shadow-md"
                />
                {/* Tablet Screen with graph */}
                <rect
                  x="212"
                  y="160"
                  width="4"
                  height="16"
                  rx="1"
                  transform="rotate(-15 212 160)"
                  fill="#06B6D4"
                />
                <rect
                  x="220"
                  y="158"
                  width="4"
                  height="22"
                  rx="1"
                  transform="rotate(-15 220 158)"
                  fill="#3B82F6"
                />
                <rect
                  x="228"
                  y="154"
                  width="4"
                  height="28"
                  rx="1"
                  transform="rotate(-15 228 154)"
                  fill="#2563EB"
                />
              </g>

              {/* Plant Pot on the Right */}
              <g id="potted-plant">
                <rect x="420" y="200" width="22" height="24" rx="2" fill="#94A3B8" />
                {/* Plant Leaves */}
                <path
                  d="M428 200C418 175 425 150 432 145C435 160 435 185 432 200Z"
                  fill="#10B981"
                />
                <path
                  d="M434 200C446 180 445 155 440 150C436 168 434 185 434 200Z"
                  fill="#059669"
                />
                <path
                  d="M426 200C410 188 412 170 415 165C422 178 424 190 426 200Z"
                  fill="#34D399"
                />
                <path
                  d="M436 200C452 188 450 170 447 165C440 178 438 190 436 200Z"
                  fill="#10B981"
                />
              </g>
            </svg>
          </div>
        </div>

        {/* ================= RIGHT CARD COLUMN (EXACT MATCH) ================= */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col items-center justify-center">
          <div className="w-full max-w-[480px]">
            
            {/* White Card Container with Subtle Shadow and Border */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 p-7 sm:p-9 relative">
              
              {/* Top Navigation Tabs: Log In | Create Account */}
              <div className="flex border-b border-slate-200">
                <button
                  type="button"
                  id="tab-login"
                  onClick={() => handleTabChange('login')}
                  className={`flex-1 pb-3 text-sm font-semibold transition-all relative text-center ${
                    mode === 'login'
                      ? 'text-blue-600 font-bold border-b-2 border-blue-600 -mb-[2px]'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  id="tab-create-account"
                  onClick={() => handleTabChange('signup')}
                  className={`flex-1 pb-3 text-sm font-semibold transition-all relative text-center ${
                    mode === 'signup'
                      ? 'text-blue-600 font-bold border-b-2 border-blue-600 -mb-[2px]'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* ================= TAB 1: LOG IN ================= */}
              {mode === 'login' && (
                <div className="pt-7">
                  <h2 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
                    Welcome Back
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 mb-6">
                    Sign in to your Inventory IQ account
                  </p>

                  {loginError && (
                    <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="font-medium">{loginError}</span>
                    </div>
                  )}

                  {forgotSent && (
                    <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                      <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                      <span>Password reset link sent to your email. Check your inbox!</span>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    {/* Email Input */}
                    <div className="relative">
                      <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        id="input-login-email"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        placeholder="Email address"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        required
                      />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                      <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        id="input-login-password"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full pl-12 pr-11 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        title={showLoginPassword ? 'Hide password' : 'Show password'}
                      >
                        {showLoginPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={e => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 accent-blue-600"
                        />
                        <span className="text-xs sm:text-sm text-slate-600">Remember me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotSent(true);
                          setLoginError('');
                        }}
                        className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>

                    {/* Blue Log In Button */}
                    <button
                      type="submit"
                      id="btn-login-submit"
                      className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
                    >
                      <span>Log In</span>
                    </button>
                  </form>

                  {/* Or Divider */}
                  <div className="relative my-6 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <span className="relative bg-white px-3 text-xs text-slate-400 font-medium">
                      or
                    </span>
                  </div>

                  {/* Google Login Button */}
                  <button
                    type="button"
                    id="btn-google-login"
                    onClick={loginWithGoogle}
                    className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium flex items-center justify-center gap-3 transition-colors shadow-2xs"
                  >
                    {/* Google Multicolor Logo */}
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  {/* 1-Click Fast Fill for Testing */}
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-2">
                      <span>Quick 1-Click Demo Accounts:</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => fillDemoCredentials('admin@inventoryiq.com', 'admin123')}
                        className="px-2 py-1.5 rounded-lg bg-blue-50/70 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-100 transition-colors text-center"
                      >
                        Admin (HQ)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          fillDemoCredentials('cashier@inventoryiq.com', 'cashier123')
                        }
                        className="px-2 py-1.5 rounded-lg bg-emerald-50/70 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-100 transition-colors text-center"
                      >
                        Cashier
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          fillDemoCredentials('warehouse@inventoryiq.com', 'warehouse123')
                        }
                        className="px-2 py-1.5 rounded-lg bg-amber-50/70 hover:bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-100 transition-colors text-center"
                      >
                        Warehouse
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 2: CREATE ACCOUNT ================= */}
              {mode === 'signup' && (
                <div className="pt-7">
                  <h2 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
                    Create an Account
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 mb-6">
                    Start managing your inventory smarter today
                  </p>

                  {regError && (
                    <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="font-medium">{regError}</span>
                    </div>
                  )}

                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                    {/* Name Input */}
                    <div className="relative">
                      <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        id="input-reg-name"
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        placeholder="Full name"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        required
                      />
                    </div>

                    {/* Email Input */}
                    <div className="relative">
                      <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        id="input-reg-email"
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="Email address"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        required
                      />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                      <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        id="input-reg-password"
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="Password (at least 4 characters)"
                        className="w-full pl-12 pr-11 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        required
                        minLength={4}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showRegPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Role Selection Chips */}
                    <div>
                      <span className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Assigned Store Role:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setRegRole('ADMIN')}
                          className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                            regRole === 'ADMIN'
                              ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          🛡️ Administrator
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegRole('CASHIER')}
                          className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                            regRole === 'CASHIER'
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          💳 Cashier POS
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegRole('WAREHOUSE_LEAD')}
                          className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                            regRole === 'WAREHOUSE_LEAD'
                              ? 'bg-amber-50 border-amber-500 text-amber-700 ring-1 ring-amber-500'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          📦 Warehouse Lead
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegRole('MANAGER')}
                          className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                            regRole === 'MANAGER'
                              ? 'bg-purple-50 border-purple-500 text-purple-700 ring-1 ring-purple-500'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          📊 Store Manager
                        </button>
                      </div>
                    </div>

                    {/* Agree to terms */}
                    <div className="pt-1">
                      <label className="flex items-start gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={e => setAgreeTerms(e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 accent-blue-600 mt-0.5 shrink-0"
                        />
                        <span className="text-xs text-slate-600 leading-snug">
                          I agree to the{' '}
                          <span className="text-blue-600 hover:underline">Terms of Service</span> and{' '}
                          <span className="text-blue-600 hover:underline">Privacy Policy</span>
                        </span>
                      </label>
                    </div>

                    {/* Primary Button */}
                    <button
                      type="submit"
                      id="btn-create-account-submit"
                      className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
                    >
                      <span>Create Account</span>
                    </button>
                  </form>

                  {/* Or Divider */}
                  <div className="relative my-5 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <span className="relative bg-white px-3 text-xs text-slate-400 font-medium">
                      or
                    </span>
                  </div>

                  {/* Google Login Button */}
                  <button
                    type="button"
                    onClick={loginWithGoogle}
                    className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium flex items-center justify-center gap-3 transition-colors shadow-2xs"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Outside Prompt - Exactly as shown in screenshot */}
            <div className="mt-6 text-center">
              {mode === 'login' ? (
                <p className="text-sm text-slate-600">
                  Don’t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleTabChange('signup')}
                    className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Create Account
                  </button>
                </p>
              ) : (
                <p className="text-sm text-slate-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleTabChange('login')}
                    className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Log In
                  </button>
                </p>
              )}
            </div>

            {/* Guest / Direct Demo Preview Button */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={continueAsGuest}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors py-1 px-3 rounded-lg hover:bg-slate-100"
              >
                <span>Or explore demo register as guest</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
