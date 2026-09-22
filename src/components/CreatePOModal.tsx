import React, { useState } from 'react';
import { X, Plus, Trash2, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/format';

interface CreatePOModalProps {
  supplierId?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ItemRow {
  productId: string;
  quantity: number;
  unitCost: number;
}

export const CreatePOModal: React.FC<CreatePOModalProps> = ({
  supplierId: defaultSupplierId,
  isOpen,
  onClose,
}) => {
  const { suppliers, products, createPurchaseOrder, config } = useStore();

  const [supplierId, setSupplierId] = useState<string>(defaultSupplierId || suppliers[0]?.id || '');
  const [expectedDays, setExpectedDays] = useState<number>(3);
  const [notes, setNotes] = useState('');
  const [rows, setRows] = useState<ItemRow[]>([
    { productId: products[0]?.id || '', quantity: 20, unitCost: products[0]?.costPrice || 100 },
  ]);

  if (!isOpen) return null;

  const handleAddRow = () => {
    const firstProd = products[0];
    if (firstProd) {
      setRows(prev => [...prev, { productId: firstProd.id, quantity: 10, unitCost: firstProd.costPrice }]);
    }
  };

  const handleRemoveRow = (index: number) => {
    setRows(prev => prev.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, newProdId: string) => {
    const prod = products.find(p => p.id === newProdId);
    setRows(prev =>
      prev.map((r, i) =>
        i === index
          ? {
              ...r,
              productId: newProdId,
              unitCost: prod?.costPrice || r.unitCost,
            }
          : r
      )
    );
  };

  const handleQtyChange = (index: number, qty: number) => {
    setRows(prev => prev.map((r, i) => (i === index ? { ...r, quantity: Math.max(1, qty) } : r)));
  };

  const handleCostChange = (index: number, cost: number) => {
    setRows(prev => prev.map((r, i) => (i === index ? { ...r, unitCost: Math.max(0, cost) } : r)));
  };

  const totalPoAmount = rows.reduce((sum, r) => sum + r.quantity * r.unitCost, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === supplierId);
    if (!sup) {
      alert('Please select a supplier.');
      return;
    }

    if (rows.length === 0) {
      alert('Please add at least one product item to order.');
      return;
    }

    const items = rows.map(r => {
      const prod = products.find(p => p.id === r.productId);
      return {
        productId: r.productId,
        productName: prod?.name || 'Unknown Item',
        sku: prod?.sku || 'UNKNOWN',
        quantity: r.quantity,
        unitCost: r.unitCost,
        subtotal: r.quantity * r.unitCost,
      };
    });

    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + expectedDays);

    createPurchaseOrder({
      supplierId: sup.id,
      supplierName: sup.name,
      items,
      expectedDate: expectedDate.toISOString().slice(0, 10),
      status: 'PENDING',
      totalAmount: totalPoAmount,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">New Purchase Order</h3>
              <p className="text-xs text-slate-500">Order wholesale items from authorized suppliers</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Supplier & Lead Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Vendor / Supplier *</label>
              <select
                value={supplierId}
                onChange={e => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Expected Delivery In (Days)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={expectedDays}
                onChange={e => setExpectedDays(parseInt(e.target.value) || 3)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          {/* Item Rows Table */}
          <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-700">
              <span>Order Line Items</span>
              <button
                type="button"
                onClick={handleAddRow}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Item</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {rows.map((row, idx) => (
                <div
                  key={idx}
                  className="bg-white p-2 rounded-xl border border-slate-200 grid grid-cols-12 gap-2 items-center text-xs"
                >
                  <div className="col-span-5">
                    <select
                      value={row.productId}
                      onChange={e => handleProductChange(idx, e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 text-[11px]"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={row.quantity}
                      onChange={e => handleQtyChange(idx, parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold"
                    />
                  </div>

                  <div className="col-span-3">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Cost"
                      value={row.unitCost}
                      onChange={e => handleCostChange(idx, parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-right font-bold"
                    />
                  </div>

                  <div className="col-span-2 flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-[11px]">
                      {formatCurrency(row.quantity * row.unitCost, config.currencySymbol)}
                    </span>
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center px-1 font-bold text-slate-900">
              <span>Estimated Order Total:</span>
              <span className="text-base text-indigo-700">
                {formatCurrency(totalPoAmount, config.currencySymbol)}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-600 mb-1">Special Instructions / PO Memo</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Deliver to Loading Dock 2, Net 30 payment."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Issue Purchase Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
