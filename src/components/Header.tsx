import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Store,
  Warehouse,
  Bell,
  Scan,
  Plus,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  X,
  Volume2,
  LogIn,
  UserPlus,
  LogOut,
  User,
  ChevronDown,
  Shield,
  CreditCard,
  Briefcase,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { ViewTab, Product } from '../types';
import { getProductStatus, formatCurrency } from '../utils/format';
import { playScannerBeep } from '../utils/audio';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  setActiveTab: (tab: ViewTab) => void;
  onSelectProductForDetail?: (product: Product) => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  setActiveTab,
  onSelectProductForDetail,
  isSidebarCollapsed,
  onToggleSidebar,
}) => {
  const { products, selectedLocation, setSelectedLocation, config } = useStore();
  const {
    currentUser,
    accounts,
    isAuthenticated,
    logout,
    switchUser,
    openAuthModal,
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products for instant search
  const searchResults = searchQuery.trim()
    ? products
        .filter(
          p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.barcode.includes(searchQuery.trim()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 6)
    : [];

  const lowStockProducts = products.filter(p => {
    const s = getProductStatus(p);
    return s === 'LOW_STOCK' || s === 'OUT_OF_STOCK';
  });

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu & Location Switcher */}
      <div className="flex items-center gap-3">
        <button
          id="btn-sidebar-toggle"
          onClick={() => {
            if (window.innerWidth >= 1024 && onToggleSidebar) {
              onToggleSidebar();
            } else {
              onOpenMobileMenu();
            }
          }}
          className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center"
          title={isSidebarCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar / Menu (Ctrl+B)'}
        >
          <Menu className="w-5 h-5 lg:hidden" />
          <div className="hidden lg:flex items-center justify-center">
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-5 h-5 text-indigo-600" />
            ) : (
              <PanelLeftClose className="w-5 h-5 text-slate-500 hover:text-slate-800" />
            )}
          </div>
        </button>

        {/* Location Filter Pills for Laptop & iPad */}
        <div className="hidden sm:flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-medium">
          <button
            id="loc-all-btn"
            onClick={() => setSelectedLocation('ALL')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              selectedLocation === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Stock
          </button>
          <button
            id="loc-store-btn"
            onClick={() => setSelectedLocation('STORE')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              selectedLocation === 'STORE'
                ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Store Shelves</span>
          </button>
          <button
            id="loc-warehouse-btn"
            onClick={() => setSelectedLocation('WAREHOUSE')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              selectedLocation === 'WAREHOUSE'
                ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Warehouse className="w-3.5 h-3.5" />
            <span>Warehouse</span>
          </button>
        </div>
      </div>

      {/* Center: Universal Product & Barcode Search */}
      <div ref={searchRef} className="flex-1 max-w-md relative">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search items, SKU, or scan barcode..."
            className="w-full pl-9 pr-8 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {isSearchFocused && searchResults.length > 0 && (
          <div className="absolute top-full mt-1.5 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="text-[11px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
              Matching Products ({searchResults.length})
            </div>
            <div className="space-y-1">
              {searchResults.map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    if (onSelectProductForDetail) onSelectProductForDetail(p);
                    setActiveTab('inventory');
                    setIsSearchFocused(false);
                    setSearchQuery('');
                  }}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="font-semibold text-slate-900 truncate">{p.name}</div>
                    <div className="text-slate-500 text-[11px] flex items-center gap-2">
                      <span>SKU: {p.sku}</span>
                      <span>•</span>
                      <span className="font-mono">Barcode: {p.barcode}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-indigo-600">
                      {formatCurrency(p.sellingPrice, config.currencySymbol)}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Store: {p.storeStock} | WH: {p.warehouseStock}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Action Icons & New Sale Button */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Scanner Audio Feedback Test */}
        <button
          id="btn-test-beep"
          onClick={() => playScannerBeep()}
          title="Test Scanner Sound"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 hidden md:flex items-center gap-1.5 text-xs font-medium border border-transparent hover:border-slate-200"
        >
          <Volume2 className="w-4 h-4 text-indigo-500" />
          <span className="hidden xl:inline text-slate-600">Laser Ready</span>
        </button>

        {/* Notifications Popover */}
        <div ref={notifRef} className="relative">
          <button
            id="btn-notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
            title="Stock Alerts"
          >
            <Bell className="w-5 h-5" />
            {lowStockProducts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Inventory Alerts</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                  {lowStockProducts.length} items
                </span>
              </div>

              <div className="py-2 max-h-72 overflow-y-auto space-y-2">
                {lowStockProducts.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    <span>All product stocks are healthy!</span>
                  </div>
                ) : (
                  lowStockProducts.slice(0, 5).map(p => {
                    const isOut = p.storeStock + p.warehouseStock <= 0;
                    return (
                      <div
                        key={p.id}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                          isOut
                            ? 'bg-rose-50/60 border-rose-200'
                            : 'bg-amber-50/60 border-amber-200'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-900 truncate">{p.name}</div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            Store: <span className="font-bold">{p.storeStock}</span> | Warehouse:{' '}
                            <span className="font-bold">{p.warehouseStock}</span> (Min:{' '}
                            {p.reorderPoint})
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab('inventory');
                            setShowNotifications(false);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${
                            isOut
                              ? 'bg-rose-600 text-white hover:bg-rose-700'
                              : 'bg-amber-600 text-white hover:bg-amber-700'
                          }`}
                        >
                          Restock
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {lowStockProducts.length > 5 && (
                <button
                  onClick={() => {
                    setActiveTab('inventory');
                    setShowNotifications(false);
                  }}
                  className="w-full mt-2 pt-2 border-t border-slate-100 text-center text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  View all {lowStockProducts.length} low stock items →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Direct POS Checkout Button */}
        <button
          id="btn-quick-pos"
          onClick={() => setActiveTab('pos')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Open POS</span>
        </button>

        {/* User Authentication & Account Menu */}
        <div ref={userMenuRef} className="relative pl-1 border-l border-slate-200">
          {isAuthenticated && currentUser ? (
            <div>
              <button
                id="btn-user-profile"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200/80"
                title={`${currentUser.name} (${currentUser.role})`}
              >
                <div
                  className={`w-7 h-7 rounded-lg ${
                    currentUser.avatarColor || 'bg-indigo-600'
                  } text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs`}
                >
                  {currentUser.name
                    .split(' ')
                    .map(n => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-indigo-600 font-semibold leading-none capitalize">
                    {currentUser.role.replace('_', ' ').toLowerCase()}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* User Account Popover */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* Account Summary Header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div
                      className={`w-10 h-10 rounded-xl ${
                        currentUser.avatarColor || 'bg-indigo-600'
                      } text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md`}
                    >
                      {currentUser.name
                        .split(' ')
                        .map(n => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{currentUser.email}</div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold tracking-wide uppercase">
                          {currentUser.role.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">
                          {currentUser.terminal || 'Main POS'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Switch Account Quick List */}
                  <div className="py-2.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 pb-1">
                      Switch Active Staff / Terminal
                    </div>
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {accounts.map(acc => {
                        const isCurrent = acc.id === currentUser.id;
                        return (
                          <button
                            key={acc.id}
                            onClick={() => {
                              if (!isCurrent) switchUser(acc.id);
                              setShowUserMenu(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                              isCurrent
                                ? 'bg-indigo-50/80 text-indigo-950 font-bold border border-indigo-100'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-5 h-5 rounded-md ${
                                  acc.avatarColor || 'bg-slate-600'
                                } text-white text-[10px] font-bold flex items-center justify-center shrink-0`}
                              >
                                {acc.name[0]}
                              </div>
                              <span className="truncate">{acc.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                              {acc.role === 'ADMIN' ? 'Admin' : acc.role === 'CASHIER' ? 'Cashier' : 'Staff'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Links */}
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        openAuthModal('signup');
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <UserPlus className="w-4 h-4 text-indigo-600" />
                      <span>Create New Account</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                id="btn-header-login"
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-200 transition-all"
                title="Log In"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                <span>Log In</span>
              </button>

              <button
                id="btn-header-signup"
                onClick={() => openAuthModal('signup')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-all"
                title="Create Account"
              >
                <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Create Account</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
