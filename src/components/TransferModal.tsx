import React, { useState, useEffect } from 'react';
import { X, ArrowLeftRight, Store, Warehouse, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface TransferModalProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ product: initialProduct, isOpen, onClose }) => {
  const { products, transferStock } = useStore();

  const [selectedId, setSelectedId] = useState<string>('');
  const [direction, setDirection] = useState<'WAREHOUSE_TO_STORE' | 'STORE_TO_WAREHOUSE'>('WAREHOUSE_TO_STORE');
  const [quantity, setQuantity] = useState<number>(5);
  const [reference, setReference] = useState('SHELF-RESTOCK');

  useEffect(() => {
    if (initialProduct) {
      setSelectedId(initialProduct.id);
    } else if (products.length > 0) {
      setSelectedId(products[0].id);
    }
  }, [initialProduct, products, isOpen]);

  if (!isOpen) return null;

  const currentProduct = products.find(p => p.id === selectedId) || products[0];
  const maxTransferrable =
    direction === 'WAREHOUSE_TO_STORE'
      ? currentProduct?.warehouseStock || 0
      : currentProduct?.storeStock || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || quantity <= 0) return;

    if (quantity > maxTransferrable) {
      alert(`Cannot transfer ${quantity} units. Only ${maxTransferrable} available.`);
      return;
    }

    const success = transferStock(currentProduct.id, quantity, direction, reference);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Stock Location Transfer</h3>
              <p className="text-xs text-slate-500">Move inventory between warehouse & retail shelves</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Select Product */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Item to Move</label>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (Store: {p.storeStock} | WH: {p.warehouseStock})
                </option>
              ))}
            </select>
          </div>

          {/* Transfer Direction Toggle */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Transfer Direction</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDirection('WAREHOUSE_TO_STORE')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  direction === 'WAREHOUSE_TO_STORE'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1 font-bold">
                  <Warehouse className="w-3.5 h-3.5 text-amber-600" />
                  <span>→</span>
                  <Store className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <span className="text-[11px] font-semibold">Warehouse to Shelf</span>
                <span className="text-[10px] text-slate-500">Replenish retail floor</span>
              </button>

              <button
                type="button"
                onClick={() => setDirection('STORE_TO_WAREHOUSE')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  direction === 'STORE_TO_WAREHOUSE'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1 font-bold">
                  <Store className="w-3.5 h-3.5 text-indigo-600" />
                  <span>→</span>
                  <Warehouse className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <span className="text-[11px] font-semibold">Shelf to Warehouse</span>
                <span className="text-[10px] text-slate-500">Return excess stock</span>
              </button>
            </div>
          </div>

          {/* Current Balances Box */}
          {currentProduct && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Source Available</span>
                <span className="font-black text-sm text-slate-900">
                  {maxTransferrable} {currentProduct.unit}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px]">Destination Balance</span>
                <span className="font-black text-sm text-indigo-600">
                  {direction === 'WAREHOUSE_TO_STORE'
                    ? currentProduct.storeStock
                    : currentProduct.warehouseStock}{' '}
                  {currentProduct.unit}
                </span>
              </div>
            </div>
          )}

          {/* Transfer Quantity */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">Quantity to Transfer</label>
              {maxTransferrable > 0 && (
                <button
                  type="button"
                  onClick={() => setQuantity(maxTransferrable)}
                  className="text-[10px] font-bold text-indigo-600 hover:underline"
                >
                  Move All ({maxTransferrable})
                </button>
              )}
            </div>
            <input
              type="number"
              min="1"
              max={maxTransferrable}
              required
              value={quantity}
              onChange={e => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-900 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Reference */}
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Reference / Reason</label>
            <input
              type="text"
              value={reference}
              onChange={e => setReference(e.target.value)}
              placeholder="e.g. SHELF-RESTOCK, MORNING-RUN"
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
              disabled={maxTransferrable <= 0}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Stock Transfer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
