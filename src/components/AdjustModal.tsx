import React, { useState } from 'react';
import { X, Layers, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Product, MovementType } from '../types';
import { useStore } from '../context/StoreContext';

interface AdjustModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AdjustModal: React.FC<AdjustModalProps> = ({ product, isOpen, onClose }) => {
  const { adjustStock } = useStore();

  const [location, setLocation] = useState<'STORE' | 'WAREHOUSE'>('STORE');
  const [adjustmentType, setAdjustmentType] = useState<MovementType>('ADJUSTMENT_AUDIT');
  const [quantityDelta, setQuantityDelta] = useState<number>(0);
  const [notes, setNotes] = useState('');

  if (!isOpen || !product) return null;

  const currentStock = location === 'STORE' ? product.storeStock : product.warehouseStock;
  const newStock = Math.max(0, currentStock + quantityDelta);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantityDelta === 0) {
      alert('Please specify a positive or negative quantity change.');
      return;
    }

    const refCode = `ADJ-${Date.now().toString().slice(-4)}`;
    adjustStock(product.id, quantityDelta, location, adjustmentType, refCode, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Inventory Adjustment</h3>
              <p className="text-xs text-slate-500">Manual stock corrections, damages, or audits</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Item details */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="font-bold text-slate-900 text-sm">{product.name}</div>
            <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-1">
              <span>SKU: {product.sku}</span>
              <span>•</span>
              <span>Shelf: <b>{product.storeStock}</b></span>
              <span>•</span>
              <span>Warehouse: <b>{product.warehouseStock}</b></span>
            </div>
          </div>

          {/* Location Picker */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Target Location</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLocation('STORE')}
                className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all ${
                  location === 'STORE'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                Retail Shelf Stock
              </button>
              <button
                type="button"
                onClick={() => setLocation('WAREHOUSE')}
                className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all ${
                  location === 'WAREHOUSE'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                Central Warehouse
              </button>
            </div>
          </div>

          {/* Reason Type */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Reason for Adjustment</label>
            <select
              value={adjustmentType}
              onChange={e => setAdjustmentType(e.target.value as MovementType)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              <option value="ADJUSTMENT_AUDIT">Stock Count Discrepancy / Routine Audit</option>
              <option value="ADJUSTMENT_DAMAGE">Damaged / Broken / Expired Goods</option>
              <option value="RECEIPT">Direct Shipment Receipt (Unscheduled Inbound)</option>
            </select>
          </div>

          {/* Quantity Delta Input */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Adjustment Amount (+ to add, - to subtract)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                required
                value={quantityDelta}
                onChange={e => setQuantityDelta(parseInt(e.target.value) || 0)}
                placeholder="e.g. +5 or -2"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-slate-500">
              <span>Current {location === 'STORE' ? 'Shelf' : 'Warehouse'}: {currentStock}</span>
              <span className="font-bold text-indigo-600">New Balance: {newStock} {product.unit}</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes / Auditor Comment</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Broken packaging discovered during morning stock count."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          {/* Modal Buttons */}
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
              <span>Apply Adjustment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
