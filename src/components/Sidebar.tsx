import React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ArrowLeftRight,
  BarChart3,
  Truck,
  FileSpreadsheet,
  Settings,
  Store,
  Warehouse,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  LogIn,
  UserPlus,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { ViewTab } from '../types';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { getProductStatus } from '../utils/format';

interface SidebarProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isCollapsed = false,
  setIsCollapsed,
}) => {
  const { products, purchaseOrders, heldCarts, config } = useStore();
  const { currentUser, isAuthenticated, logout, openAuthModal } = useAuth();

  const lowStockCount = products.filter(p => {
    const s = getProductStatus(p);
    return s === 'LOW_STOCK' || s === 'OUT_OF_STOCK';
  }).length;

  const activePoCount = purchaseOrders.filter(
    po => po.status === 'PENDING' || po.status === 'APPROVED' || po.status === 'SHIPPED'
  ).length;

  const navItems = [
    {
      id: 'dashboard' as ViewTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'pos' as ViewTab,
      label: 'POS Register',
      icon: ShoppingCart,
      badge: heldCarts.length > 0 ? `${heldCarts.length} Held` : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'inventory' as ViewTab,
      label: 'Inventory & Items',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'movements' as ViewTab,
      label: 'Stock Movements',
      icon: ArrowLeftRight,
      badge: null,
    },
    {
      id: 'sales-reports' as ViewTab,
      label: 'Sales & Reports',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'purchase-orders' as ViewTab,
      label: 'Purchase Orders',
      icon: FileSpreadsheet,
      badge: activePoCount > 0 ? `${activePoCount}` : null,
      badgeColor: 'bg-indigo-500 text-white',
    },
    {
      id: 'suppliers' as ViewTab,
      label: 'Suppliers',
      icon: Truck,
      badge: null,
    },
    {
      id: 'settings' as ViewTab,
      label: 'Store Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleNavClick = (tab: ViewTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile / iPad Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        id="app-sidebar"
        className={`
          fixed top-0 bottom-0 left-0 z-50 bg-slate-950 text-slate-100 flex flex-col border-r border-slate-800/80 
          transition-all duration-200 ease-in-out
          lg:static lg:h-full lg:translate-x-0 shrink-0
          ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
          ${isMobileMenuOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className={`border-b border-slate-800/80 ${isCollapsed ? 'p-3 flex flex-col items-center gap-2' : 'p-4'}`}>
          <div className="flex items-center justify-between gap-2.5 w-full">
            <div className={`flex items-center gap-3 min-w-0 ${isCollapsed ? 'justify-center w-full' : 'flex-1'}`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/25 shrink-0">
                <Store className="w-5 h-5" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <h1
                    className="font-bold text-base tracking-tight text-white leading-tight flex items-center gap-1.5 truncate"
                    title="Inventory IQ"
                  >
                    <span>Inventory IQ</span>
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 text-[9px] font-extrabold border border-indigo-500/40 tracking-wider">
                      ERP
                    </span>
                  </h1>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                    <Warehouse className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{config.branchName || 'Store & Warehouse ERP'}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle */}
            {setIsCollapsed && (
              <button
                type="button"
                onClick={() => setIsCollapsed(prev => !prev)}
                className={`hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/90 transition-colors shrink-0 ${
                  isCollapsed ? 'w-full justify-center' : ''
                }`}
                title={isCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
              >
                {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>
            )}

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/90 transition-colors shrink-0"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Mode Switch Info (Only when expanded) */}
        {!isCollapsed && (
          <div className="px-3.5 py-2 mx-3 mt-3 rounded-lg bg-slate-900/90 border border-slate-800/90 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2 text-slate-300 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="font-medium truncate">System Online</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 shrink-0 ml-2">v2.4 Pro</span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className={`flex-1 py-3 space-y-1 overflow-y-auto no-scrollbar ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {!isCollapsed && (
            <div className="px-3 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Store Operations
            </div>
          )}
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                title={isCollapsed ? `${item.label}${item.badge ? ` (${item.badge})` : ''}` : undefined}
                className={`relative w-full flex items-center rounded-xl font-medium text-sm transition-all ${
                  isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5'
                } ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />

                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className={`shrink-0 ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap leading-tight ${
                          item.badgeColor || 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {/* Collapsed notification dot */}
                {isCollapsed && item.badge && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-slate-950" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User & Terminal Footer */}
        <div className={`border-t border-slate-800/80 bg-slate-950/80 shrink-0 ${isCollapsed ? 'p-2' : 'p-3'}`}>
          {isAuthenticated && currentUser ? (
            <div
              className={`rounded-xl bg-slate-900/90 border border-slate-800 flex items-center ${
                isCollapsed ? 'justify-center p-2 flex-col gap-1.5' : 'gap-2.5 p-2.5'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg ${
                  currentUser.avatarColor || 'bg-indigo-600'
                } text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}
                title={`${currentUser.name} (${currentUser.role})`}
              >
                {currentUser.name
                  .split(' ')
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>

              {!isCollapsed ? (
                <>
                  <div className="min-w-0 flex-1">
                    <div
                      className="text-xs font-semibold text-slate-200 truncate"
                      title={currentUser.name}
                    >
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                      <span className="capitalize text-emerald-400 font-medium">
                        {currentUser.role.replace('_', ' ').toLowerCase()}
                      </span>
                      <span>•</span>
                      <span className="truncate">{currentUser.terminal || 'Terminal'}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={logout}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors shrink-0"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={logout}
                  className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className={`rounded-xl bg-slate-900/90 border border-slate-800 ${isCollapsed ? 'p-1.5' : 'p-2.5 space-y-2'}`}>
              {!isCollapsed ? (
                <>
                  <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                    <span>Not Signed In</span>
                    <span className="text-[10px] text-amber-400">Guest Mode</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => openAuthModal('login')}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                    >
                      <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Log In</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openAuthModal('signup')}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Sign Up</span>
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="w-full p-1.5 flex items-center justify-center rounded-lg text-indigo-400 hover:bg-slate-800"
                  title="Log In / Sign Up"
                >
                  <LogIn className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
