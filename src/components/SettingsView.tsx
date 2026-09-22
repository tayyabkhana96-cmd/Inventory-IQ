import React, { useState } from 'react';
import {
  Settings,
  Store,
  Receipt,
  Volume2,
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  Users,
  UserPlus,
  LogIn,
  LogOut,
  Shield,
  CreditCard,
  Warehouse,
  Briefcase,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { downloadBlob } from '../utils/format';

export const SettingsView: React.FC = () => {
  const { config, updateConfig, resetDatabase, products, sales, suppliers, movements, purchaseOrders } = useStore();
  const { currentUser, accounts, isAuthenticated, logout, switchUser, openAuthModal } = useAuth();

  const [storeName, setStoreName] = useState(config.storeName);
  const [branchName, setBranchName] = useState(config.branchName || config.storeTagline);
  const [address, setAddress] = useState(config.address);
  const [phone, setPhone] = useState(config.phone);
  const [currencySymbol, setCurrencySymbol] = useState(config.currencySymbol);
  const [taxRate, setTaxRate] = useState(config.taxRatePercent);
  const [defaultReorderThreshold, setDefaultReorderThreshold] = useState(config.lowStockGlobalThreshold);
  const [enableSoundEffects, setEnableSoundEffects] = useState(config.enableSoundEffects ?? true);
  const [receiptFooter, setReceiptFooter] = useState(config.receiptFooter || 'Thank you for shopping with us!');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      storeName,
      branchName,
      storeTagline: branchName,
      address,
      phone,
      currencySymbol,
      taxRatePercent: taxRate,
      enableTax: taxRate > 0,
      lowStockGlobalThreshold: defaultReorderThreshold,
      enableSoundEffects,
      receiptFooter,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      config,
      products,
      sales,
      suppliers,
      movements,
      purchaseOrders,
    };
    downloadBlob(
      JSON.stringify(backupData, null, 2),
      `Megamart_ERP_Backup_${new Date().toISOString().slice(0, 10)}.json`,
      'application/json'
    );
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <span>Store Configuration & ERP Settings</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Customize branding, multi-location parameters, taxes, thermal printers, and backups.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-bold text-xs flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      {/* Staff & User Authentication Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Staff Accounts &amp; Cashier Logins</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openAuthModal('signup')}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition-colors border border-indigo-200/80"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
            )}
          </div>
        </div>

        {/* Current Active User Status */}
        {isAuthenticated && currentUser ? (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl ${
                  currentUser.avatarColor || 'bg-indigo-600'
                } text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs`}
              >
                {currentUser.name
                  .split(' ')
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{currentUser.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wide">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-slate-500 text-xs mt-0.5">
                  {currentUser.email} • {currentUser.terminal || 'Main POS Register'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 border border-rose-200 transition-colors shrink-0 self-start sm:self-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 flex items-center justify-between">
            <div className="text-xs">
              <span className="font-bold">Currently in Guest Mode.</span> Log in or create a staff account to personalize POS registers and audit logs.
            </div>
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
            >
              Log In Now
            </button>
          </div>
        )}

        {/* Registered Staff Accounts */}
        <div className="pt-2">
          <div className="text-xs font-bold text-slate-700 mb-2">
            Registered Store Personnel ({accounts.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {accounts.map(acc => {
              const isCurrent = currentUser?.id === acc.id;
              return (
                <div
                  key={acc.id}
                  className={`p-3 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                    isCurrent
                      ? 'bg-indigo-50/60 border-indigo-300 ring-1 ring-indigo-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-slate-900 truncate">{acc.name}</span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.2 rounded bg-indigo-600 text-white text-[9px] font-bold">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-slate-500 text-[11px] truncate">{acc.email}</div>
                    <div className="text-slate-400 text-[10px] mt-1 capitalize">
                      Role: <span className="font-semibold text-slate-700">{acc.role.replace('_', ' ').toLowerCase()}</span>
                    </div>
                  </div>

                  {!isCurrent && (
                    <button
                      type="button"
                      onClick={() => switchUser(acc.id)}
                      className="mt-2.5 w-full py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
                    >
                      Switch to this User
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5 text-xs">
        {/* Store & Branch Information */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Store className="w-4 h-4 text-indigo-600" />
            <span>Megamart & General Store Identification</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Company / Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Branch / Facility Name</label>
              <input
                type="text"
                value={branchName}
                onChange={e => setBranchName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Store Address</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Helpline / Support Phone</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Currency & Tax Parameters */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <span>POS Financial & Tax Configuration</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Currency Symbol</label>
              <select
                value={currencySymbol}
                onChange={e => setCurrencySymbol(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="Rs.">Rs. (Pakistani Rupee)</option>
                <option value="₹">₹ (Indian Rupee)</option>
                <option value="$">$ (USD)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
                <option value="AED">AED (Emirati Dirham)</option>
                <option value="SAR">SAR (Saudi Riyal)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Default Sales Tax / GST (%)</label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={taxRate}
                onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Default Low Stock Alert</label>
              <input
                type="number"
                min="1"
                value={defaultReorderThreshold}
                onChange={e => setDefaultReorderThreshold(parseInt(e.target.value) || 10)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Thermal Receipt Bottom Note
            </label>
            <input
              type="text"
              value={receiptFooter}
              onChange={e => setReceiptFooter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
            />
          </div>
        </div>

        {/* Audio / iPad feedback */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Volume2 className="w-4 h-4 text-indigo-600" />
            <span>Hardware & Scanner Feedback</span>
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-xl">
            <input
              type="checkbox"
              checked={enableSoundEffects}
              onChange={e => setEnableSoundEffects(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <div className="font-bold text-slate-900">Enable Hardware Audio Chimes</div>
              <div className="text-slate-500 text-[11px]">
                Plays distinct scanner audio beeps on barcode scan and cash register checkout chimes.
              </div>
            </div>
          </label>
        </div>

        {/* Action button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* Database Management & Backups */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="pb-3 border-b border-slate-100 flex items-center gap-2 font-bold text-slate-900 text-sm">
          <Database className="w-4 h-4 text-slate-700" />
          <span>Local Storage Persistence & Data Management</span>
        </div>

        <p className="text-xs text-slate-500">
          All records (products, inventory levels, sales, and movements) are persisted securely in
          local device storage. You can backup your store snapshot or restore demo sample products.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportBackup}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Backup Store Database (JSON)</span>
          </button>

          <button
            onClick={() => {
              if (
                confirm(
                  'Are you sure you want to restore default demo catalog data? This will reset custom additions.'
                )
              ) {
                resetDatabase('MEGAMART');
                alert('Demo inventory and sample orders restored!');
              }
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
