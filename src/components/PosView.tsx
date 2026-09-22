import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ShoppingCart,
  Barcode,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  QrCode,
  Clock,
  RotateCcw,
  CheckCircle2,
  Printer,
  X,
  Store,
  Tag,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, POSCartItem, POSSale } from '../types';
import { formatCurrency } from '../utils/format';
import { playScannerBeep, playErrorTone } from '../utils/audio';

interface PosViewProps {
  onSaleCompleted: (sale: POSSale) => void;
}

export const PosView: React.FC<PosViewProps> = ({ onSaleCompleted }) => {
  const {
    products,
    processPOSSale,
    holdCurrentCart,
    recallHeldCart,
    removeHeldCart,
    heldCarts,
    config,
  } = useStore();

  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [customerName, setCustomerName] = useState('');

  // Payment checkout modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'QR_TRANSFER'>('CASH');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [isHeldModalOpen, setIsHeldModalOpen] = useState(false);
  const [lastCompletedSale, setLastCompletedSale] = useState<POSSale | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus scanner on mount and after cart updates
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, [cart, isCheckoutOpen]);

  // Handle hardware USB/Bluetooth barcode scanner inputs
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is currently typing in an input field other than barcode, ignore global listener
      const activeEl = document.activeElement;
      if (
        activeEl &&
        activeEl.tagName === 'INPUT' &&
        activeEl.id !== 'pos-barcode-input'
      ) {
        return;
      }

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 100) {
        buffer = ''; // Reset buffer if typing slow (manual keyboard entry)
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length >= 3) {
          e.preventDefault();
          handleScanCode(buffer);
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products, cart]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [products]);

  // Filtered products for touch grid
  const displayedProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery.trim());
      const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategory]);

  // Add item to cart
  const addToCart = (product: Product, qtyToAdd = 1) => {
    if (product.storeStock <= 0) {
      playErrorTone();
      alert(`"${product.name}" has 0 units on the store shelf. Please restock from the warehouse.`);
      return;
    }

    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.product.id === product.id);
      if (existingIdx !== -1) {
        const existing = prev[existingIdx];
        const newQty = existing.quantity + qtyToAdd;

        if (newQty > product.storeStock) {
          playErrorTone();
          alert(`Only ${product.storeStock} units of "${product.name}" available on retail shelves.`);
          return prev;
        }

        const subtotal =
          newQty * existing.unitPrice * (1 - existing.discountPercent / 100);
        const updated = [...prev];
        updated[existingIdx] = { ...existing, quantity: newQty, subtotal };
        playScannerBeep();
        return updated;
      } else {
        if (qtyToAdd > product.storeStock) {
          playErrorTone();
          alert(`Only ${product.storeStock} units of "${product.name}" available.`);
          return prev;
        }
        playScannerBeep();
        return [
          {
            product,
            quantity: qtyToAdd,
            unitPrice: product.sellingPrice,
            discountPercent: 0,
            subtotal: qtyToAdd * product.sellingPrice,
          },
          ...prev,
        ];
      }
    });
  };

  const updateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(index);
      return;
    }
    const item = cart[index];
    if (newQty > item.product.storeStock) {
      playErrorTone();
      alert(`Only ${item.product.storeStock} units in store stock.`);
      return;
    }
    const subtotal = newQty * item.unitPrice * (1 - item.discountPercent / 100);
    const updated = [...cart];
    updated[index] = { ...item, quantity: newQty, subtotal };
    setCart(updated);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountPercent(0);
    setCustomerName('');
  };

  // Barcode scan action
  const handleScanCode = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    const matched = products.find(
      p =>
        p.barcode.toLowerCase() === trimmed.toLowerCase() ||
        p.sku.toLowerCase() === trimmed.toLowerCase()
    );

    if (matched) {
      addToCart(matched, 1);
      setBarcodeInput('');
    } else {
      playErrorTone();
      alert(`No product found with barcode or SKU: ${trimmed}`);
    }
  };

  // Cart calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const cartDiscountAmount = (cartSubtotal * discountPercent) / 100;
  const discountedSubtotal = cartSubtotal - cartDiscountAmount;
  const taxAmount = config.enableTax
    ? (discountedSubtotal * config.taxRatePercent) / 100
    : 0;
  const grandTotal = discountedSubtotal + taxAmount;
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Quick tenders calculations
  const numTendered = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, numTendered - grandTotal);

  // Complete sale
  const handleCompleteCheckout = () => {
    if (cart.length === 0) return;

    if (paymentMethod === 'CASH' && numTendered < grandTotal) {
      playErrorTone();
      alert(`Cash tendered (${formatCurrency(numTendered, config.currencySymbol)}) is less than total (${formatCurrency(grandTotal, config.currencySymbol)})!`);
      return;
    }

    const completed = processPOSSale(
      cart,
      paymentMethod,
      paymentMethod === 'CASH' ? numTendered : undefined,
      discountPercent,
      customerName.trim() || undefined
    );

    if (completed) {
      setLastCompletedSale(completed);
      setIsCheckoutOpen(false);
      clearCart();
      onSaleCompleted(completed);
    }
  };

  const handleHoldCart = () => {
    if (cart.length === 0) return;
    const note = prompt('Add an optional reference note for this held cart:', `Customer #${heldCarts.length + 1}`);
    holdCurrentCart(cart, note || undefined);
    clearCart();
  };

  const handleRecall = (heldId: string) => {
    const items = recallHeldCart(heldId);
    if (items) {
      setCart(items);
      setIsHeldModalOpen(false);
      playScannerBeep();
    }
  };

  return (
    <div className="h-[calc(100vh-5.5rem)] flex flex-col lg:flex-row gap-4 pb-4">
      {/* Left Column: Touch Product Grid & Barcode Scanner */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 overflow-hidden">
        {/* Top: Barcode Scanner Input Bar */}
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="relative flex-1">
            <Barcode className="w-5 h-5 text-indigo-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="pos-barcode-input"
              ref={barcodeInputRef}
              type="text"
              value={barcodeInput}
              onChange={e => setBarcodeInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleScanCode(barcodeInput);
                }
              }}
              placeholder="Scan barcode with laser gun or type code & press Enter..."
              className="w-full pl-10 pr-24 py-2.5 bg-indigo-50/40 border-2 border-indigo-200 focus:border-indigo-600 rounded-xl text-xs sm:text-sm font-mono tracking-wide focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
            <button
              onClick={() => handleScanCode(barcodeInput)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Scan
            </button>
          </div>

          <div className="relative max-w-[200px] hidden sm:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Quick search..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Category Filter Pills for iPad touch selection */}
        <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto no-scrollbar shrink-0 border-b border-slate-100">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Items ({products.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Responsive Product Grid */}
        <div className="flex-1 overflow-y-auto pt-3 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {displayedProducts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs">
              No products found matching your search.
            </div>
          ) : (
            displayedProducts.map(prod => {
              const inStock = prod.storeStock > 0;
              return (
                <button
                  key={prod.id}
                  id={`pos-prod-${prod.id}`}
                  onClick={() => addToCart(prod, 1)}
                  disabled={!inStock}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all group active:scale-[0.98] ${
                    inStock
                      ? 'bg-white hover:bg-indigo-50/40 border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-md'
                      : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span className="font-mono truncate">{prod.sku}</span>
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded ${
                          inStock
                            ? prod.storeStock <= 5
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {inStock ? `${prod.storeStock} on shelf` : 'Out of stock'}
                      </span>
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {prod.name}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="font-black text-sm text-slate-900">
                      {formatCurrency(prod.sellingPrice, config.currencySymbol)}
                    </div>
                    <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      +
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Checkout Cart & Cash Register */}
      <div className="w-full lg:w-96 xl:w-[420px] flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 shrink-0">
        {/* Cart Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Active Register</h2>
              <span className="text-[11px] text-slate-500 font-medium">
                {totalItemsCount} items selected
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {heldCarts.length > 0 && (
              <button
                onClick={() => setIsHeldModalOpen(true)}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-lg border border-amber-200 flex items-center gap-1"
                title="Recall held transactions"
              >
                <Clock className="w-3 h-3" />
                <span>Recall ({heldCarts.length})</span>
              </button>
            )}
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Empty Cart"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Cart Line Items */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 divide-y divide-slate-100">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <ShoppingCart className="w-10 h-10 text-slate-200 mb-2" />
              <p className="font-bold text-sm text-slate-700">The cart is empty</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Scan barcodes or tap products on the left to start sale.
              </p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={item.product.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 truncate">{item.product.name}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>{formatCurrency(item.unitPrice, config.currencySymbol)} each</span>
                    <span>•</span>
                    <span className="text-slate-400">SKU: {item.product.sku}</span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-0.5 shrink-0">
                  <button
                    onClick={() => updateQuantity(idx, item.quantity - 1)}
                    className="w-6 h-6 rounded-md hover:bg-white flex items-center justify-center text-slate-600 font-bold transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(idx, item.quantity + 1)}
                    className="w-6 h-6 rounded-md hover:bg-white flex items-center justify-center text-slate-600 font-bold transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Item Subtotal */}
                <div className="text-right shrink-0 min-w-[65px]">
                  <div className="font-bold text-slate-900">
                    {formatCurrency(item.subtotal, config.currencySymbol)}
                  </div>
                </div>

                {/* Remove Line */}
                <button
                  onClick={() => removeFromCart(idx)}
                  className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart Bottom Summary & Checkout Trigger */}
        <div className="pt-3 border-t border-slate-200/80 space-y-2.5">
          {/* Subtotal & Discount */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(cartSubtotal, config.currencySymbol)}
              </span>
            </div>

            {/* Optional Discount selector */}
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" />
                <span>Cart Discount:</span>
              </span>
              <div className="flex items-center gap-1">
                {[0, 5, 10].map(pct => (
                  <button
                    key={pct}
                    onClick={() => setDiscountPercent(pct)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                      discountPercent === pct
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {pct === 0 ? 'None' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {discountPercent > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold text-xs">
                <span>Discount ({discountPercent}%):</span>
                <span>-{formatCurrency(cartDiscountAmount, config.currencySymbol)}</span>
              </div>
            )}

            {config.enableTax && (
              <div className="flex justify-between text-slate-600">
                <span>Tax ({config.taxRatePercent}%):</span>
                <span>{formatCurrency(taxAmount, config.currencySymbol)}</span>
              </div>
            )}

            {/* Grand Total */}
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-100 text-slate-900">
              <span className="text-sm font-bold">Total Amount Due:</span>
              <span className="text-xl font-black text-indigo-600">
                {formatCurrency(grandTotal, config.currencySymbol)}
              </span>
            </div>
          </div>

          {/* Action Buttons: Hold & Charge */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              id="pos-hold-btn"
              onClick={handleHoldCart}
              disabled={cart.length === 0}
              className="py-2.5 px-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
              title="Park / Hold current cart"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Hold</span>
            </button>

            <button
              id="pos-charge-btn"
              onClick={() => {
                setCashTendered(grandTotal.toString());
                setIsCheckoutOpen(true);
              }}
              disabled={cart.length === 0}
              className="col-span-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Banknote className="w-4 h-4" />
              <span>Charge {formatCurrency(grandTotal, config.currencySymbol)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Checkout / Payment Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Payment & Receipt</h3>
                <p className="text-xs text-slate-500">Choose settlement method and finalize transaction</p>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Display */}
            <div className="my-4 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                Grand Total Payable
              </span>
              <div className="text-3xl font-black text-indigo-900 mt-1">
                {formatCurrency(grandTotal, config.currencySymbol)}
              </div>
              <div className="text-xs text-indigo-700 mt-1">
                {totalItemsCount} item{totalItemsCount === 1 ? '' : 's'} across cart
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => setPaymentMethod('CASH')}
                className={`py-3 px-2 rounded-xl font-bold text-xs flex flex-col items-center gap-1.5 border transition-all ${
                  paymentMethod === 'CASH'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span>Cash Payment</span>
              </button>
              <button
                onClick={() => setPaymentMethod('CARD')}
                className={`py-3 px-2 rounded-xl font-bold text-xs flex flex-col items-center gap-1.5 border transition-all ${
                  paymentMethod === 'CARD'
                    ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Credit / Debit Card</span>
              </button>
              <button
                onClick={() => setPaymentMethod('QR_TRANSFER')}
                className={`py-3 px-2 rounded-xl font-bold text-xs flex flex-col items-center gap-1.5 border transition-all ${
                  paymentMethod === 'QR_TRANSFER'
                    ? 'bg-purple-50 border-purple-500 text-purple-800 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span>Mobile QR / Bank</span>
              </button>
            </div>

            {/* Cash Tendered & Change Due Section */}
            {paymentMethod === 'CASH' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cash Tendered from Customer:
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                      {config.currencySymbol}
                    </span>
                    <input
                      id="cash-tendered-input"
                      type="number"
                      value={cashTendered}
                      onChange={e => setCashTendered(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Quick Cash Presets */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-semibold">Presets:</span>
                  <button
                    onClick={() => setCashTendered(grandTotal.toString())}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-100"
                  >
                    Exact
                  </button>
                  <button
                    onClick={() => setCashTendered((Math.ceil(grandTotal / 500) * 500).toString())}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-100"
                  >
                    Round 500
                  </button>
                  <button
                    onClick={() => setCashTendered((Math.ceil(grandTotal / 1000) * 1000).toString())}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-100"
                  >
                    Round 1000
                  </button>
                  <button
                    onClick={() => setCashTendered((Math.ceil(grandTotal / 5000) * 5000).toString())}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-100"
                  >
                    Round 5000
                  </button>
                </div>

                {/* Change Due Box */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Change Due to Customer:</span>
                  <span className="text-lg font-black text-emerald-600">
                    {formatCurrency(changeDue, config.currencySymbol)}
                  </span>
                </div>
              </div>
            )}

            {/* Optional Customer Name */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Customer Name / Mobile (Optional):
              </label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="e.g. Walk-in customer, Ahmed Khan"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Modal Bottom Confirm */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                id="pos-confirm-payment-btn"
                onClick={handleCompleteCheckout}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-emerald-600/25 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Sale & Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Held Carts Recall Modal */}
      {isHeldModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Held Transactions</h3>
                <p className="text-xs text-slate-500">Pick up a previous customer's pending items</p>
              </div>
              <button
                onClick={() => setIsHeldModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3 space-y-2 max-h-72 overflow-y-auto">
              {heldCarts.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No parked carts right now.
                </div>
              ) : (
                heldCarts.map(hc => {
                  const total = hc.items.reduce((s, i) => s + i.subtotal, 0);
                  const count = hc.items.reduce((s, i) => s + i.quantity, 0);
                  return (
                    <div
                      key={hc.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{hc.note}</div>
                        <div className="text-[11px] text-slate-500">
                          {count} items • Total: {formatCurrency(total, config.currencySymbol)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleRecall(hc.id)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs"
                        >
                          Load to Cart
                        </button>
                        <button
                          onClick={() => removeHeldCart(hc.id)}
                          className="p-1 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
