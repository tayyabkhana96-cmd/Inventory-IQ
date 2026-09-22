import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Sparkles, Barcode, Store, Warehouse } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/format';

interface ProductModalProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  const { addProduct, updateProduct, suppliers, config } = useStore();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('Grocery & Food');
  const [brand, setBrand] = useState('');
  const [unit, setUnit] = useState<Product['unit']>('pcs');
  const [costPrice, setCostPrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [storeStock, setStoreStock] = useState<number>(10);
  const [warehouseStock, setWarehouseStock] = useState<number>(40);
  const [reorderPoint, setReorderPoint] = useState<number>(15);
  const [shelfAisle, setShelfAisle] = useState('');
  const [warehouseZone, setWarehouseZone] = useState('');
  const [supplierId, setSupplierId] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSku(product.sku);
      setBarcode(product.barcode);
      setCategory(product.category);
      setBrand(product.brand || '');
      setUnit(product.unit);
      setCostPrice(product.costPrice);
      setSellingPrice(product.sellingPrice);
      setStoreStock(product.storeStock);
      setWarehouseStock(product.warehouseStock);
      setReorderPoint(product.reorderPoint);
      setShelfAisle(product.locationDetails?.shelfAisle || '');
      setWarehouseZone(product.locationDetails?.warehouseZone || '');
      setSupplierId(product.supplierId || '');
    } else {
      // Auto-generate fresh unique SKU and Barcode
      const randomCode = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      setName('');
      setSku(`SKU-${Date.now().toString().slice(-4)}`);
      setBarcode(`896${randomCode.slice(0, 9)}`);
      setCategory('Grocery & Spices');
      setBrand('');
      setUnit('pcs');
      setCostPrice(100);
      setSellingPrice(150);
      setStoreStock(10);
      setWarehouseStock(30);
      setReorderPoint(15);
      setShelfAisle('Aisle 1');
      setWarehouseZone('Rack A-01');
      setSupplierId(suppliers[0]?.id || '');
    }
  }, [product, isOpen, suppliers]);

  if (!isOpen) return null;

  const marginPct =
    sellingPrice > 0 ? Math.round(((sellingPrice - costPrice) / sellingPrice) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim() || !barcode.trim()) {
      alert('Product Name, SKU, and Barcode are required.');
      return;
    }

    const payload = {
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      barcode: barcode.trim(),
      category: category.trim() || 'General',
      brand: brand.trim() || undefined,
      unit,
      costPrice: Math.max(0, costPrice),
      sellingPrice: Math.max(0, sellingPrice),
      storeStock: Math.max(0, storeStock),
      warehouseStock: Math.max(0, warehouseStock),
      reorderPoint: Math.max(1, reorderPoint),
      locationDetails: {
        shelfAisle: shelfAisle.trim() || undefined,
        warehouseZone: warehouseZone.trim() || undefined,
      },
      supplierId: supplierId || undefined,
    };

    if (product) {
      updateProduct({
        ...product,
        ...payload,
      });
    } else {
      addProduct(payload);
    }

    onClose();
  };

  const handleGenerateBarcode = () => {
    const randomCode = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    setBarcode(`896${randomCode.slice(0, 9)}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-lg text-slate-900">
              {product ? 'Edit Product Item' : 'Add New Item to Megamart Catalog'}
            </h3>
            <p className="text-xs text-slate-500">
              Set stock levels for both store shelves and central warehouse.
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Item Name & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Basmati Super Kernel Rice 5kg"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Brand Name</label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="e.g. Falak, Nestlé"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* SKU & Barcode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">SKU / Item Code *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="e.g. RIC-BSK-05"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">Barcode (UPC / EAN / 128) *</label>
                <button
                  type="button"
                  onClick={handleGenerateBarcode}
                  className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Auto-Generate
                </button>
              </div>
              <div className="relative">
                <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={barcode}
                  onChange={e => setBarcode(e.target.value)}
                  placeholder="Scan or type barcode..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="e.g. FMCG & Dairy, Beverages, Electronics"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Sale Packaging Unit</label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value as Product['unit'])}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="pack">Pack</option>
                <option value="box">Box</option>
                <option value="carton">Carton</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="liter">Liter</option>
              </select>
            </div>
          </div>

          {/* Pricing & Profit Margin Preview */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Pricing & Margin
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Wholesale Cost Price ({config.currencySymbol})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={costPrice}
                  onChange={e => setCostPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Retail Selling Price ({config.currencySymbol})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={sellingPrice}
                  onChange={e => setSellingPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-indigo-700"
                />
              </div>
              <div className="flex flex-col justify-end">
                <div className="p-2 bg-white rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 block">Gross Profit Margin</span>
                  <span className={`font-black text-sm ${marginPct >= 15 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    +{marginPct}% ({formatCurrency(sellingPrice - costPrice, config.currencySymbol)})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Location Stock Distribution */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Multi-Location Inventory Levels
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Store Shelf Stock</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={storeStock}
                  onChange={e => setStoreStock(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Warehouse className="w-3.5 h-3.5 text-amber-600" />
                  <span>Warehouse Stock</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={warehouseStock}
                  onChange={e => setWarehouseStock(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Restock Reorder Point
                </label>
                <input
                  type="number"
                  min="1"
                  value={reorderPoint}
                  onChange={e => setReorderPoint(parseInt(e.target.value) || 10)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-rose-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-slate-600 mb-1">Shelf Aisle / Floor Bay</label>
                <input
                  type="text"
                  value={shelfAisle}
                  onChange={e => setShelfAisle(e.target.value)}
                  placeholder="e.g. Aisle 3 - Shelf B"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Warehouse Zone / Rack</label>
                <input
                  type="text"
                  value={warehouseZone}
                  onChange={e => setWarehouseZone(e.target.value)}
                  placeholder="e.g. Pallet Bay R-04"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {/* Supplier Picker */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Preferred Supplier</label>
            <select
              value={supplierId}
              onChange={e => setSupplierId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            >
              <option value="">No vendor selected</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{product ? 'Save Changes' : 'Save Product to Catalog'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
