import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  ArrowLeftRight,
  Edit2,
  Trash2,
  Barcode,
  Download,
  Upload,
  Layers,
  Store,
  Warehouse,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, StockStatus } from '../types';
import {
  formatCurrency,
  getProductStatus,
  getStatusBadgeInfo,
  generateCsv,
  downloadBlob,
} from '../utils/format';

interface InventoryViewProps {
  onOpenProductModal: (product?: Product) => void;
  onOpenTransferModal: (product?: Product) => void;
  onOpenAdjustModal: (product: Product) => void;
  onOpenBarcodeModal: (product: Product) => void;
  onOpenCsvImportModal: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  onOpenProductModal,
  onOpenTransferModal,
  onOpenAdjustModal,
  onOpenBarcodeModal,
  onOpenCsvImportModal,
}) => {
  const { products, deleteProduct, config, selectedLocation, setSelectedLocation } = useStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'price' | 'sales'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [products]);

  // Filtered & Sorted items
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesSearch =
          !search ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase()) ||
          p.barcode.includes(search.trim()) ||
          (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()));

        const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;

        const status = getProductStatus(p);
        const matchesStatus = selectedStatus === 'ALL' || status === selectedStatus;

        return matchesSearch && matchesCat && matchesStatus;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortBy === 'name') {
          cmp = a.name.localeCompare(b.name);
        } else if (sortBy === 'stock') {
          const aTotal = a.storeStock + a.warehouseStock;
          const bTotal = b.storeStock + b.warehouseStock;
          cmp = aTotal - bTotal;
        } else if (sortBy === 'price') {
          cmp = a.sellingPrice - b.sellingPrice;
        } else if (sortBy === 'sales') {
          cmp = (a.salesCount || 0) - (b.salesCount || 0);
        }
        return sortOrder === 'asc' ? cmp : -cmp;
      });
  }, [products, search, selectedCategory, selectedStatus, sortBy, sortOrder]);

  // Export inventory to CSV
  const handleExportCsv = () => {
    const headers = [
      'Product ID',
      'Name',
      'SKU',
      'Barcode',
      'Category',
      'Brand',
      'Unit',
      'Cost Price',
      'Selling Price',
      'Store Shelf Stock',
      'Warehouse Stock',
      'Total Stock',
      'Reorder Point',
      'Shelf Location',
      'Warehouse Zone',
      'Sales Count',
    ];

    const rows = filteredProducts.map(p => [
      p.id,
      p.name,
      p.sku,
      p.barcode,
      p.category,
      p.brand || '',
      p.unit,
      p.costPrice,
      p.sellingPrice,
      p.storeStock,
      p.warehouseStock,
      p.storeStock + p.warehouseStock,
      p.reorderPoint,
      p.locationDetails?.shelfAisle || '',
      p.locationDetails?.warehouseZone || '',
      p.salesCount || 0,
    ]);

    const csvContent = generateCsv(headers, rows);
    downloadBlob(
      csvContent,
      `Megamart_Inventory_${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  const toggleSort = (col: 'name' | 'stock' | 'price' | 'sales') => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header & Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            <span>Inventory & Product Catalog</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Total {products.length} registered products across Store Shelves and Warehouse.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="inv-export-btn"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
            title="Download CSV for Excel or Backup"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            id="inv-import-btn"
            onClick={onOpenCsvImportModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
            title="Import Excel or CSV sheet with custom items"
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Import CSV</span>
          </button>
          <button
            id="inv-add-product-btn"
            onClick={() => onOpenProductModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="inv-search-input"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter by name, SKU, barcode..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              id="inv-category-select"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="ALL">All Categories ({products.length})</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              id="inv-status-select"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="HEALTHY">In Stock (Healthy)</option>
              <option value="LOW_STOCK">Low Stock (Restock Alert)</option>
              <option value="OUT_OF_STOCK">Out of Stock (Zero Units)</option>
              <option value="OVERSTOCK">Surplus / Overstock</option>
            </select>
          </div>

          {/* Location Focus */}
          <div>
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-medium">
              <button
                onClick={() => setSelectedLocation('ALL')}
                className={`flex-1 py-1 rounded-lg transition-all text-center ${
                  selectedLocation === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedLocation('STORE')}
                className={`flex-1 py-1 rounded-lg transition-all text-center ${
                  selectedLocation === 'STORE'
                    ? 'bg-white text-indigo-600 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Shelf
              </button>
              <button
                onClick={() => setSelectedLocation('WAREHOUSE')}
                className={`flex-1 py-1 rounded-lg transition-all text-center ${
                  selectedLocation === 'WAREHOUSE'
                    ? 'bg-white text-indigo-600 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Warehouse
              </button>
            </div>
          </div>
        </div>

        {/* Quick Result Summary Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Showing <b className="text-slate-800">{filteredProducts.length}</b> of {products.length} items
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> In Stock:{' '}
              {products.filter(p => getProductStatus(p) === 'HEALTHY').length}
            </span>
            <span className="flex items-center gap-1 text-amber-600">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Low:{' '}
              {products.filter(p => getProductStatus(p) === 'LOW_STOCK').length}
            </span>
            <span className="flex items-center gap-1 text-rose-600">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Out:{' '}
              {products.filter(p => getProductStatus(p) === 'OUT_OF_STOCK').length}
            </span>
          </div>
        </div>
      </div>

      {/* Product Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th
                  onClick={() => toggleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Product & SKU</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3">Barcode</th>
                <th className="py-3 px-3">Category</th>
                <th
                  onClick={() => toggleSort('stock')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Stock (Store / WH)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('price')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 select-none text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Cost / Retail</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-700">No matching products found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try clearing filters or add your first product above.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const status = getProductStatus(p);
                  const badge = getStatusBadgeInfo(status);
                  const totalStock = p.storeStock + p.warehouseStock;
                  const marginPct =
                    p.sellingPrice > 0
                      ? Math.round(((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100)
                      : 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & SKU */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200 shrink-0">
                            {p.category.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">{p.name}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2">
                              <span>SKU: {p.sku}</span>
                              {p.brand && <span>• {p.brand}</span>}
                              <span className="px-1.5 py-0.2 bg-slate-100 rounded text-[10px] uppercase font-mono">
                                {p.unit}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Barcode */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => onOpenBarcodeModal(p)}
                          className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-mono text-[11px] transition-colors"
                          title="Click to view/print barcode label"
                        >
                          <Barcode className="w-3.5 h-3.5 text-slate-500" />
                          <span>{p.barcode}</span>
                        </button>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {p.category}
                        </span>
                      </td>

                      {/* Stock Breakdown (Store / Warehouse) */}
                      <td className="py-3 px-3">
                        <div>
                          <div className="font-bold text-slate-900">
                            {totalStock}{' '}
                            <span className="text-[11px] font-normal text-slate-500">
                              total
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span
                              className={`flex items-center gap-1 ${
                                p.storeStock <= 3 ? 'text-rose-600 font-semibold' : ''
                              }`}
                            >
                              <Store className="w-3 h-3 text-indigo-500" /> Store: {p.storeStock}
                            </span>
                            <span>|</span>
                            <span className="flex items-center gap-1">
                              <Warehouse className="w-3 h-3 text-amber-500" /> WH: {p.warehouseStock}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Cost & Retail Price */}
                      <td className="py-3 px-3 text-right">
                        <div>
                          <div className="font-bold text-indigo-600">
                            {formatCurrency(p.sellingPrice, config.currencySymbol)}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Cost: {formatCurrency(p.costPrice, config.currencySymbol)} (
                            <span className="text-emerald-600 font-semibold">+{marginPct}%</span>)
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Shelf Transfer Button */}
                          <button
                            id={`btn-transfer-${p.id}`}
                            onClick={() => onOpenTransferModal(p)}
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                            title="Transfer Stock between Warehouse & Shelf"
                          >
                            <ArrowLeftRight className="w-4 h-4" />
                          </button>

                          {/* Quick Adjust Stock */}
                          <button
                            id={`btn-adjust-${p.id}`}
                            onClick={() => onOpenAdjustModal(p)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Audit / Adjust physical inventory count"
                          >
                            <Layers className="w-4 h-4" />
                          </button>

                          {/* Edit Item */}
                          <button
                            id={`btn-edit-${p.id}`}
                            onClick={() => onOpenProductModal(p)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                            title="Edit Product Details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Item */}
                          <button
                            id={`btn-delete-${p.id}`}
                            onClick={() => {
                              if (
                                confirm(
                                  `Are you sure you want to delete "${p.name}"? This removes it from the catalog.`
                                )
                              ) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
    </div>
  );
};
