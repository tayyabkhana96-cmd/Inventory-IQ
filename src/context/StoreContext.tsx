import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Supplier,
  StockMovement,
  PurchaseOrder,
  StoreConfig,
  POSSale,
  HeldCart,
  POSCartItem,
  POStatus,
  MovementType,
} from '../types';
import {
  DEFAULT_CONFIG,
  INITIAL_PRODUCTS,
  INITIAL_SUPPLIERS,
  INITIAL_MOVEMENTS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_POS_SALES,
} from '../data/initialData';
import { playScannerBeep, playSuccessChime, playErrorTone } from '../utils/audio';
import confetti from 'canvas-confetti';

interface StoreContextType {
  products: Product[];
  suppliers: Supplier[];
  movements: StockMovement[];
  sales: POSSale[];
  purchaseOrders: PurchaseOrder[];
  config: StoreConfig;
  heldCarts: HeldCart[];
  selectedLocation: 'ALL' | 'STORE' | 'WAREHOUSE';
  setSelectedLocation: (loc: 'ALL' | 'STORE' | 'WAREHOUSE') => void;
  
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'salesCount' | 'updatedAt'>) => Product;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  importProductsFromList: (newProducts: Product[]) => void;
  
  // Stock operations
  adjustStock: (
    productId: string,
    quantityDelta: number,
    location: 'STORE' | 'WAREHOUSE',
    type: MovementType,
    reference: string,
    notes?: string
  ) => boolean;
  transferStock: (
    productId: string,
    quantity: number,
    direction: 'WAREHOUSE_TO_STORE' | 'STORE_TO_WAREHOUSE',
    reference?: string
  ) => boolean;
  receiveStockToWarehouse: (
    productId: string,
    quantity: number,
    reference: string,
    notes?: string
  ) => boolean;
  
  // POS operations
  processPOSSale: (
    cartItems: POSCartItem[],
    paymentMethod: 'CASH' | 'CARD' | 'QR_TRANSFER',
    cashTendered?: number,
    discountPercentTotal?: number,
    customerName?: string
  ) => POSSale | null;
  holdCurrentCart: (items: POSCartItem[], note?: string) => string;
  recallHeldCart: (heldId: string) => POSCartItem[] | null;
  removeHeldCart: (heldId: string) => void;
  
  // Supplier & PO operations
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Supplier;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'createdAt'>) => PurchaseOrder;
  updatePurchaseOrderStatus: (poId: string, status: POStatus) => void;
  
  // Config & Data Management
  updateConfig: (newConfig: Partial<StoreConfig>) => void;
  resetDatabase: (preset?: 'MEGAMART' | 'BLANK') => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_PREFIX = 'megamart_erp_v1_';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}products`);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}suppliers`);
      return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
    } catch {
      return INITIAL_SUPPLIERS;
    }
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}movements`);
      return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
    } catch {
      return INITIAL_MOVEMENTS;
    }
  });

  const [sales, setSales] = useState<POSSale[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}sales`);
      return saved ? JSON.parse(saved) : INITIAL_POS_SALES;
    } catch {
      return INITIAL_POS_SALES;
    }
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}pos`);
      return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
    } catch {
      return INITIAL_PURCHASE_ORDERS;
    }
  });

  const [config, setConfig] = useState<StoreConfig>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}config`);
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const [heldCarts, setHeldCarts] = useState<HeldCart[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}held_carts`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedLocation, setSelectedLocation] = useState<'ALL' | 'STORE' | 'WAREHOUSE'>('ALL');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}products`, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}suppliers`, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}movements`, JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}sales`, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}pos`, JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}config`, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}held_carts`, JSON.stringify(heldCarts));
  }, [heldCarts]);

  // Product Methods
  const addProduct = (productData: Omit<Product, 'id' | 'salesCount' | 'updatedAt'>): Product => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      salesCount: 0,
      updatedAt: new Date().toISOString(),
    };

    setProducts(prev => [newProduct, ...prev]);

    // Record initial receipt movement if starting with stock
    if (newProduct.warehouseStock > 0 || newProduct.storeStock > 0) {
      const initialMovements: StockMovement[] = [];
      if (newProduct.warehouseStock > 0) {
        initialMovements.push({
          id: `mov-${Date.now()}-1`,
          date: new Date().toISOString(),
          type: 'RECEIPT',
          productId: newProduct.id,
          productName: newProduct.name,
          sku: newProduct.sku,
          quantity: newProduct.warehouseStock,
          location: 'WAREHOUSE',
          user: config.activeCashier,
          reference: 'INITIAL-STOCK-WH',
          notes: 'Opening warehouse inventory balance',
        });
      }
      if (newProduct.storeStock > 0) {
        initialMovements.push({
          id: `mov-${Date.now()}-2`,
          date: new Date().toISOString(),
          type: 'RECEIPT',
          productId: newProduct.id,
          productName: newProduct.name,
          sku: newProduct.sku,
          quantity: newProduct.storeStock,
          location: 'STORE',
          user: config.activeCashier,
          reference: 'INITIAL-STOCK-STORE',
          notes: 'Opening store shelf inventory balance',
        });
      }
      setMovements(prev => [...initialMovements, ...prev]);
    }

    return newProduct;
  };

  const updateProduct = (updated: Product) => {
    setProducts(prev =>
      prev.map(p => (p.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const importProductsFromList = (newItems: Product[]) => {
    setProducts(prev => {
      // Merge by SKU or barcode if exists, otherwise append
      const map = new Map(prev.map(p => [p.sku.toLowerCase(), p]));
      newItems.forEach(item => {
        map.set(item.sku.toLowerCase(), item);
      });
      return Array.from(map.values());
    });
  };

  // Stock operations
  const adjustStock = (
    productId: string,
    quantityDelta: number,
    location: 'STORE' | 'WAREHOUSE',
    type: MovementType,
    reference: string,
    notes?: string
  ): boolean => {
    const product = products.find(p => p.id === productId);
    if (!product) return false;

    if (location === 'STORE') {
      const newStock = Math.max(0, product.storeStock + quantityDelta);
      updateProduct({ ...product, storeStock: newStock });
    } else {
      const newStock = Math.max(0, product.warehouseStock + quantityDelta);
      updateProduct({ ...product, warehouseStock: newStock });
    }

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      date: new Date().toISOString(),
      type,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: quantityDelta,
      location,
      user: config.activeCashier,
      reference: reference || 'MANUAL-ADJUST',
      notes,
    };

    setMovements(prev => [movement, ...prev]);
    return true;
  };

  const transferStock = (
    productId: string,
    quantity: number,
    direction: 'WAREHOUSE_TO_STORE' | 'STORE_TO_WAREHOUSE',
    reference = 'SHELF-TRANSFER'
  ): boolean => {
    const product = products.find(p => p.id === productId);
    if (!product || quantity <= 0) return false;

    if (direction === 'WAREHOUSE_TO_STORE') {
      if (product.warehouseStock < quantity) {
        playErrorTone();
        return false;
      }
      updateProduct({
        ...product,
        warehouseStock: product.warehouseStock - quantity,
        storeStock: product.storeStock + quantity,
      });

      const movement: StockMovement = {
        id: `mov-${Date.now()}`,
        date: new Date().toISOString(),
        type: 'TRANSFER_TO_SHELF',
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity,
        location: 'TRANSFER',
        user: config.activeCashier,
        reference,
        notes: `Restocked ${quantity} ${product.unit} from Warehouse to Store shelves`,
      };
      setMovements(prev => [movement, ...prev]);
      playScannerBeep();
      return true;
    } else {
      if (product.storeStock < quantity) {
        playErrorTone();
        return false;
      }
      updateProduct({
        ...product,
        storeStock: product.storeStock - quantity,
        warehouseStock: product.warehouseStock + quantity,
      });

      const movement: StockMovement = {
        id: `mov-${Date.now()}`,
        date: new Date().toISOString(),
        type: 'TRANSFER_TO_WAREHOUSE',
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity,
        location: 'TRANSFER',
        user: config.activeCashier,
        reference,
        notes: `Returned ${quantity} ${product.unit} from Store shelves back to Warehouse`,
      };
      setMovements(prev => [movement, ...prev]);
      playScannerBeep();
      return true;
    }
  };

  const receiveStockToWarehouse = (
    productId: string,
    quantity: number,
    reference: string,
    notes?: string
  ): boolean => {
    return adjustStock(productId, quantity, 'WAREHOUSE', 'RECEIPT', reference, notes);
  };

  // POS Sale Checkout
  const processPOSSale = (
    cartItems: POSCartItem[],
    paymentMethod: 'CASH' | 'CARD' | 'QR_TRANSFER',
    cashTendered?: number,
    discountPercentTotal = 0,
    customerName?: string
  ): POSSale | null => {
    if (!cartItems.length) return null;

    let grossSubtotal = 0;
    let costTotal = 0;

    const saleItems = cartItems.map(item => {
      const p = item.product;
      const subtotal = item.subtotal;
      grossSubtotal += subtotal;
      costTotal += p.costPrice * item.quantity;
      return {
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        barcode: p.barcode,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        costPrice: p.costPrice,
        discountPercent: item.discountPercent,
        subtotal,
      };
    });

    const discountAmount = (grossSubtotal * discountPercentTotal) / 100;
    const discountedTotal = grossSubtotal - discountAmount;
    const taxAmount = config.enableTax
      ? (discountedTotal * config.taxRatePercent) / 100
      : 0;
    const grandTotal = discountedTotal + taxAmount;
    const profitTotal = grandTotal - taxAmount - costTotal;

    const saleId = `SALE-${Date.now().toString().slice(-6)}`;
    const newSale: POSSale = {
      id: saleId,
      timestamp: new Date().toISOString(),
      items: saleItems,
      subtotal: grossSubtotal,
      taxRate: config.enableTax ? config.taxRatePercent : 0,
      taxAmount,
      discountTotal: discountAmount,
      grandTotal,
      costTotal,
      profitTotal,
      paymentMethod,
      cashTendered: paymentMethod === 'CASH' ? (cashTendered ?? grandTotal) : undefined,
      changeGiven:
        paymentMethod === 'CASH' && cashTendered
          ? Math.max(0, cashTendered - grandTotal)
          : undefined,
      cashierName: config.activeCashier,
      customerName,
    };

    // Deduct stock from store shelves and update sales count
    const updatedProducts = [...products];
    const newMovements: StockMovement[] = [];

    cartItems.forEach(cartItem => {
      const idx = updatedProducts.findIndex(p => p.id === cartItem.product.id);
      if (idx !== -1) {
        const current = updatedProducts[idx];
        const newStoreStock = Math.max(0, current.storeStock - cartItem.quantity);
        updatedProducts[idx] = {
          ...current,
          storeStock: newStoreStock,
          salesCount: (current.salesCount || 0) + cartItem.quantity,
          updatedAt: new Date().toISOString(),
        };

        newMovements.push({
          id: `mov-${Date.now()}-${cartItem.product.id}`,
          date: new Date().toISOString(),
          type: 'SALE',
          productId: current.id,
          productName: current.name,
          sku: current.sku,
          quantity: -cartItem.quantity,
          location: 'STORE',
          user: config.activeCashier,
          reference: saleId,
          notes: `POS Sale checkout (${paymentMethod})`,
        });
      }
    });

    setProducts(updatedProducts);
    setMovements(prev => [...newMovements, ...prev]);
    setSales(prev => [newSale, ...prev]);

    // Audio & Confetti
    playSuccessChime();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.85 },
      colors: ['#4f46e5', '#06b6d4', '#10b981'],
    });

    return newSale;
  };

  const holdCurrentCart = (items: POSCartItem[], note = 'Customer browsing'): string => {
    const id = `HELD-${Date.now().toString().slice(-4)}`;
    const held: HeldCart = {
      id,
      savedAt: new Date().toISOString(),
      note,
      items: [...items],
    };
    setHeldCarts(prev => [held, ...prev]);
    return id;
  };

  const recallHeldCart = (heldId: string): POSCartItem[] | null => {
    const found = heldCarts.find(c => c.id === heldId);
    if (!found) return null;
    setHeldCarts(prev => prev.filter(c => c.id !== heldId));
    return found.items;
  };

  const removeHeldCart = (heldId: string) => {
    setHeldCarts(prev => prev.filter(c => c.id !== heldId));
  };

  // Supplier & PO operations
  const addSupplier = (supplierData: Omit<Supplier, 'id'>): Supplier => {
    const newSup: Supplier = {
      ...supplierData,
      id: `sup-${Date.now()}`,
    };
    setSuppliers(prev => [newSup, ...prev]);
    return newSup;
  };

  const updateSupplier = (supplier: Supplier) => {
    setSuppliers(prev => prev.map(s => (s.id === supplier.id ? supplier : s)));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const createPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'createdAt'>): PurchaseOrder => {
    const newPo: PurchaseOrder = {
      ...poData,
      id: `PO-${new Date().getFullYear()}-${(purchaseOrders.length + 1).toString().padStart(2, '0')}`,
      createdAt: new Date().toISOString(),
    };
    setPurchaseOrders(prev => [newPo, ...prev]);
    return newPo;
  };

  const updatePurchaseOrderStatus = (poId: string, newStatus: POStatus) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return;

    // If changing to RECEIVED, automatically add items into Warehouse inventory!
    if (newStatus === 'RECEIVED' && po.status !== 'RECEIVED') {
      const updatedProducts = [...products];
      const newMovements: StockMovement[] = [];

      po.items.forEach(poItem => {
        const idx = updatedProducts.findIndex(p => p.id === poItem.productId);
        if (idx !== -1) {
          const prod = updatedProducts[idx];
          updatedProducts[idx] = {
            ...prod,
            warehouseStock: prod.warehouseStock + poItem.quantity,
            costPrice: poItem.unitCost || prod.costPrice,
            updatedAt: new Date().toISOString(),
          };

          newMovements.push({
            id: `mov-${Date.now()}-${prod.id}`,
            date: new Date().toISOString(),
            type: 'RECEIPT',
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            quantity: poItem.quantity,
            location: 'WAREHOUSE',
            user: config.activeCashier,
            reference: po.id,
            notes: `Received PO shipment from ${po.supplierName}`,
          });
        }
      });

      setProducts(updatedProducts);
      setMovements(prev => [...newMovements, ...prev]);
      playSuccessChime();
    }

    setPurchaseOrders(prev =>
      prev.map(p => (p.id === poId ? { ...p, status: newStatus } : p))
    );
  };

  // Config & Database reset
  const updateConfig = (newConfig: Partial<StoreConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const resetDatabase = (preset: 'MEGAMART' | 'BLANK' = 'MEGAMART') => {
    if (preset === 'BLANK') {
      setProducts([]);
      setMovements([]);
      setSales([]);
      setPurchaseOrders([]);
      setHeldCarts([]);
    } else {
      setProducts(INITIAL_PRODUCTS);
      setSuppliers(INITIAL_SUPPLIERS);
      setMovements(INITIAL_MOVEMENTS);
      setSales(INITIAL_POS_SALES);
      setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
      setHeldCarts([]);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        suppliers,
        movements,
        sales,
        purchaseOrders,
        config,
        heldCarts,
        selectedLocation,
        setSelectedLocation,
        addProduct,
        updateProduct,
        deleteProduct,
        importProductsFromList,
        adjustStock,
        transferStock,
        receiveStockToWarehouse,
        processPOSSale,
        holdCurrentCart,
        recallHeldCart,
        removeHeldCart,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        createPurchaseOrder,
        updatePurchaseOrderStatus,
        updateConfig,
        resetDatabase,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
