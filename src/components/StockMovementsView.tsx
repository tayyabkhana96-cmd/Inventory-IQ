import React, { useState, useMemo } from 'react';
import {
  ArrowLeftRight,
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Store,
  Warehouse,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { StockMovement, MovementType } from '../types';
import { formatDateTime, generateCsv, downloadBlob } from '../utils/format';

interface StockMovementsViewProps {
  onOpenTransferModal: () => void;
}

export const StockMovementsView: React.FC<StockMovementsViewProps> = ({ onOpenTransferModal }) => {
  const { movements, config } = useStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      const matchesSearch =
        !search ||
        m.productName.toLowerCase().includes(search.toLowerCase()) ||
        m.sku.toLowerCase().includes(search.toLowerCase()) ||
        m.reference.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'ALL' || m.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [movements, search, filterType]);

  const handleExportCsv = () => {
    const headers = [
      'Movement ID',
      'Date & Time',
      'Movement Type',
      'Product Name',
      'SKU',
      'Quantity Change',
      'Location Impact',
      'User / Terminal',
      'Reference',
      'Notes',
    ];

    const rows = filteredMovements.map(m => [
      m.id,
      formatDateTime(m.date),
      m.type,
      m.productName,
      m.sku,
      m.quantity,
      m.location,
      m.user,
      m.reference,
      m.notes || '',
    ]);

    const csvContent = generateCsv(headers, rows);
    downloadBlob(
      csvContent,
      `Megamart_Stock_Movements_${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  const getMovementBadge = (type: MovementType) => {
    switch (type) {
      case 'SALE':
        return {
          label: 'POS Customer Sale',
          bg: 'bg-rose-50',
          text: 'text-rose-700',
          border: 'border-rose-200',
          icon: ArrowDownLeft,
        };
      case 'RECEIPT':
        return {
          label: 'Supplier Receipt (GRN)',
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          icon: ArrowUpRight,
        };
      case 'TRANSFER_TO_SHELF':
        return {
          label: 'Shelf Restock (WH → Shelf)',
          bg: 'bg-indigo-50',
          text: 'text-indigo-700',
          border: 'border-indigo-200',
          icon: Store,
        };
      case 'TRANSFER_TO_WAREHOUSE':
        return {
          label: 'Backroom Return (Shelf → WH)',
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          icon: Warehouse,
        };
      case 'ADJUSTMENT_DAMAGE':
        return {
          label: 'Damage / Expiry Loss',
          bg: 'bg-rose-50',
          text: 'text-rose-700',
          border: 'border-rose-200',
          icon: AlertTriangle,
        };
      case 'ADJUSTMENT_AUDIT':
        return {
          label: 'Physical Count Audit',
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          icon: ArrowLeftRight,
        };
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
            <span>Stock Movements & Audit Ledger</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete immutable log of all inventory transfers, deliveries, and sales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Audit Trail</span>
          </button>
          <button
            onClick={onOpenTransferModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>+ Transfer to Shelf</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search movement, SKU, or reference (e.g. SALE-10492)..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="w-full sm:w-60 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Movement Types</option>
            <option value="SALE">POS Sales (Deductions)</option>
            <option value="RECEIPT">Supplier Receipts (Additions)</option>
            <option value="TRANSFER_TO_SHELF">Shelf Restocks (WH → Shelf)</option>
            <option value="TRANSFER_TO_WAREHOUSE">Backroom Returns (Shelf → WH)</option>
            <option value="ADJUSTMENT_DAMAGE">Damage & Expiry</option>
            <option value="ADJUSTMENT_AUDIT">Count Audits</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Product Name & SKU</th>
                <th className="py-3 px-3 text-center">Change Qty</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">User</th>
                <th className="py-3 px-4">Reference & Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No movements recorded yet.
                  </td>
                </tr>
              ) : (
                filteredMovements.map(m => {
                  const badge = getMovementBadge(m.type);
                  const Icon = badge.icon;
                  const isPositive = m.quantity > 0;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {formatDateTime(m.date)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 truncate max-w-[240px]">
                          {m.productName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">SKU: {m.sku}</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`font-black text-xs px-2 py-0.5 rounded-lg ${
                            isPositive
                              ? 'text-emerald-700 bg-emerald-50'
                              : 'text-rose-700 bg-rose-50'
                          }`}
                        >
                          {isPositive ? `+${m.quantity}` : m.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {m.location === 'STORE' ? (
                          <span className="flex items-center gap-1 text-indigo-600">
                            <Store className="w-3 h-3" /> Store Shelf
                          </span>
                        ) : m.location === 'WAREHOUSE' ? (
                          <span className="flex items-center gap-1 text-amber-600">
                            <Warehouse className="w-3 h-3" /> Warehouse
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-purple-600">
                            <ArrowLeftRight className="w-3 h-3" /> Transferred
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-700">{m.user}</td>
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-800 text-[11px]">
                          {m.reference}
                        </div>
                        {m.notes && (
                          <div className="text-[10px] text-slate-500 italic mt-0.5 truncate max-w-[220px]">
                            {m.notes}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
