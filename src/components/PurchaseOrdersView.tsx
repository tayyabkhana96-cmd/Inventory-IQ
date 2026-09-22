import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  AlertCircle,
  Eye,
  X,
  Printer,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PurchaseOrder, POStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/format';

interface PurchaseOrdersViewProps {
  onOpenCreatePOModal: () => void;
}

export const PurchaseOrdersView: React.FC<PurchaseOrdersViewProps> = ({ onOpenCreatePOModal }) => {
  const { purchaseOrders, updatePurchaseOrderStatus, config } = useStore();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);

  const filteredPOs = purchaseOrders.filter(
    po => statusFilter === 'ALL' || po.status === statusFilter
  );

  const getStatusBadge = (status: POStatus) => {
    switch (status) {
      case 'DRAFT':
        return { label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
      case 'PENDING':
        return { label: 'Pending Approval', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
      case 'APPROVED':
        return { label: 'Approved by Vendor', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      case 'SHIPPED':
        return { label: 'In Transit', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
      case 'RECEIVED':
        return { label: 'Received in Warehouse', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
      case 'CANCELLED':
        return { label: 'Cancelled', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            <span>Purchase Orders & Supplier Inbound</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create vendor orders; receiving automatically adds stock into Central Warehouse inventory.
          </p>
        </div>

        <button
          onClick={onOpenCreatePOModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Purchase Order</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {(
          [
            ['ALL', 'All Orders'],
            ['PENDING', 'Pending'],
            ['APPROVED', 'Approved'],
            ['SHIPPED', 'In Transit'],
            ['RECEIVED', 'Received'],
            ['DRAFT', 'Drafts'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* PO Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-3">Supplier</th>
                <th className="py-3 px-3">Created</th>
                <th className="py-3 px-3">Expected</th>
                <th className="py-3 px-3">Items Count</th>
                <th className="py-3 px-3 text-right">Total Cost</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No purchase orders found in this category.
                  </td>
                </tr>
              ) : (
                filteredPOs.map(po => {
                  const badge = getStatusBadge(po.status);
                  const totalUnits = po.items.reduce((s, i) => s + i.quantity, 0);
                  const canReceive = po.status !== 'RECEIVED' && po.status !== 'CANCELLED';

                  return (
                    <tr key={po.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                        {po.id}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {po.supplierName}
                      </td>
                      <td className="py-3 px-3 text-slate-500">{formatDate(po.createdAt)}</td>
                      <td className="py-3 px-3 text-slate-500">{formatDate(po.expectedDate)}</td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-900">{totalUnits} units</span>
                        <div className="text-[10px] text-slate-400">({po.items.length} SKUs)</div>
                      </td>
                      <td className="py-3 px-3 text-right font-black text-slate-900">
                        {formatCurrency(po.totalAmount, config.currencySymbol)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedPo(po)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                            title="View Items Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {canReceive && (
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Confirm receipt of ${totalUnits} units from ${po.supplierName}? This will instantly update your Warehouse stock.`
                                  )
                                ) {
                                  updatePurchaseOrderStatus(po.id, 'RECEIVED');
                                }
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1 transition-all active:scale-95"
                            >
                              <PackageCheck className="w-3.5 h-3.5" />
                              <span>Receive Stock</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PO Detail Modal */}
      {selectedPo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Purchase Order Details</h3>
                <span className="font-mono text-xs text-indigo-600 font-bold">{selectedPo.id}</span>
              </div>
              <button
                onClick={() => setSelectedPo(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Supplier:</span>
                <span className="font-bold text-slate-900">{selectedPo.supplierName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Expected Delivery:</span>
                <span>{formatDate(selectedPo.expectedDate)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Status:</span>
                <span className="font-bold">{selectedPo.status}</span>
              </div>
              {selectedPo.notes && (
                <div className="p-2 bg-slate-50 rounded-lg text-slate-600 italic">
                  Note: {selectedPo.notes}
                </div>
              )}
            </div>

            {/* Line items */}
            <div className="py-2 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase mb-2">
                Ordered Items
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {selectedPo.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{item.productName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">SKU: {item.sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">
                        {item.quantity} units @ {formatCurrency(item.unitCost, config.currencySymbol)}
                      </div>
                      <div className="text-[11px] font-bold text-indigo-600">
                        Total: {formatCurrency(item.subtotal, config.currencySymbol)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-700">Total Inbound Order:</span>
              <span className="text-lg font-black text-slate-900">
                {formatCurrency(selectedPo.totalAmount, config.currencySymbol)}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedPo(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
