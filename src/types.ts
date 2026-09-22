export type StockStatus = 'HEALTHY' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK';

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  brand?: string;
  unit: 'pcs' | 'kg' | 'pack' | 'box' | 'liter' | 'carton';
  costPrice: number;       // Wholesale buy cost
  sellingPrice: number;    // Retail selling price
  storeStock: number;      // Quantity currently on retail megamart shelves
  warehouseStock: number;  // Quantity in central warehouse / backroom
  reorderPoint: number;    // Minimum combined threshold before restock alert
  locationDetails?: {
    warehouseZone?: string; // e.g. "Rack B-04"
    shelfAisle?: string;    // e.g. "Aisle 3 - Shelf B"
  };
  supplierId?: string;
  expiryDate?: string;
  salesCount: number;      // Total units sold
  updatedAt: string;
}

export type MovementType = 'SALE' | 'RECEIPT' | 'TRANSFER_TO_SHELF' | 'TRANSFER_TO_WAREHOUSE' | 'ADJUSTMENT_DAMAGE' | 'ADJUSTMENT_AUDIT';

export interface StockMovement {
  id: string;
  date: string;
  type: MovementType;
  productId: string;
  productName: string;
  sku: string;
  quantity: number; // positive for additions, negative for deductions
  location: 'STORE' | 'WAREHOUSE' | 'TRANSFER';
  user: string;
  reference: string; // e.g. "POS-88231", "PO-1049", "SHELF-RESTOCK"
  notes?: string;
}

export interface POSCartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  subtotal: number;
}

export interface POSSale {
  id: string;
  timestamp: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    barcode: string;
    quantity: number;
    unitPrice: number;
    costPrice: number;
    discountPercent: number;
    subtotal: number;
  }[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountTotal: number;
  grandTotal: number;
  costTotal: number;
  profitTotal: number;
  paymentMethod: 'CASH' | 'CARD' | 'QR_TRANSFER';
  cashTendered?: number;
  changeGiven?: number;
  cashierName: string;
  customerName?: string;
}

export interface HeldCart {
  id: string;
  savedAt: string;
  note: string;
  items: POSCartItem[];
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: string;
  leadTimeDays: number;
  paymentTerms: string; // "Net 15", "Net 30", "COD"
  rating: number;
  status: 'ACTIVE' | 'ON_HOLD';
  address?: string;
}

export type POStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'SHIPPED' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  createdAt: string;
  expectedDate: string;
  status: POStatus;
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitCost: number;
    subtotal: number;
  }[];
  totalAmount: number;
  notes?: string;
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'WAREHOUSE_LEAD';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  terminal?: string;
  location?: string;
  avatarColor?: string;
  phone?: string;
  createdAt: string;
}

export interface StoreConfig {
  storeName: string;
  storeTagline: string;
  branchName?: string;
  address: string;
  phone: string;
  email: string;
  currencySymbol: string;
  currencyCode: string;
  taxRatePercent: number; // e.g., 5 for 5%
  enableTax: boolean;
  activeCashier: string;
  defaultWarehouseLocation: string;
  lowStockGlobalThreshold: number;
  enableSoundEffects?: boolean;
  receiptFooter?: string;
}

export type ViewTab = 
  | 'dashboard'
  | 'inventory'
  | 'pos'
  | 'movements'
  | 'sales-reports'
  | 'suppliers'
  | 'purchase-orders'
  | 'settings';
