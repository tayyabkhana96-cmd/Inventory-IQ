import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PosView } from './components/PosView';
import { InventoryView } from './components/InventoryView';
import { SalesReportsView } from './components/SalesReportsView';
import { StockMovementsView } from './components/StockMovementsView';
import { SuppliersView } from './components/SuppliersView';
import { PurchaseOrdersView } from './components/PurchaseOrdersView';
import { SettingsView } from './components/SettingsView';
import { ReceiptModal } from './components/ReceiptModal';
import { ProductModal } from './components/ProductModal';
import { TransferModal } from './components/TransferModal';
import { AdjustModal } from './components/AdjustModal';
import { BarcodeGeneratorModal } from './components/BarcodeGeneratorModal';
import { CsvImportModal } from './components/CsvImportModal';
import { SupplierModal } from './components/SupplierModal';
import { CreatePOModal } from './components/CreatePOModal';
import { AuthModal } from './components/AuthModal';
import { AuthScreen } from './components/AuthScreen';
import { ViewTab, Product, Supplier, POSSale } from './types';

function MainApp() {
  const { currentUser } = useAuth();
  const { config, updateConfig } = useStore();

  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pos_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Keep Store active cashier aligned with authenticated staff user
  useEffect(() => {
    if (currentUser) {
      const formatted = `${currentUser.name} (${currentUser.terminal || currentUser.role})`;
      if (config.activeCashier !== formatted) {
        updateConfig({
          activeCashier: formatted,
          defaultWarehouseLocation: currentUser.location || config.defaultWarehouseLocation,
        });
      }
    } else {
      if (config.activeCashier !== 'Guest / Not Signed In') {
        updateConfig({
          activeCashier: 'Guest / Not Signed In',
        });
      }
    }
  }, [currentUser]);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('pos_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Modal states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null);

  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedProductForTransfer, setSelectedProductForTransfer] = useState<Product | null>(null);

  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState<Product | null>(null);

  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [selectedProductForBarcode, setSelectedProductForBarcode] = useState<Product | null>(null);

  const [csvImportModalOpen, setCsvImportModalOpen] = useState(false);

  const [createPoModalOpen, setCreatePoModalOpen] = useState(false);
  const [selectedSupplierIdForPo, setSelectedSupplierIdForPo] = useState<string | undefined>(undefined);

  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [selectedSupplierForEdit, setSelectedSupplierForEdit] = useState<Supplier | null>(null);

  const [completedSaleReceipt, setCompletedSaleReceipt] = useState<POSSale | null>(null);

  // Keyboard shortcut listener for retail terminal efficiency
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      // Ctrl+B / Cmd+B to toggle sidebar collapse
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleToggleSidebar();
        return;
      }

      switch (e.key) {
        case 'F1':
          e.preventDefault();
          setActiveTab('pos');
          break;
        case 'F2':
          e.preventDefault();
          setActiveTab('inventory');
          break;
        case 'F3':
          e.preventDefault();
          setActiveTab('dashboard');
          break;
        case 'F4':
          e.preventDefault();
          setActiveTab('sales-reports');
          break;
        case 'F5':
          e.preventDefault();
          setActiveTab('stock-movements');
          break;
        case 'F6':
          e.preventDefault();
          setActiveTab('purchase-orders');
          break;
        case 'Escape':
          setProductModalOpen(false);
          setTransferModalOpen(false);
          setAdjustModalOpen(false);
          setBarcodeModalOpen(false);
          setCsvImportModalOpen(false);
          setCreatePoModalOpen(false);
          setSupplierModalOpen(false);
          setCompletedSaleReceipt(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Modal Trigger Handlers
  const handleOpenProductModal = (product?: Product) => {
    setSelectedProductForEdit(product || null);
    setProductModalOpen(true);
  };

  const handleOpenTransferModal = (product?: Product) => {
    setSelectedProductForTransfer(product || null);
    setTransferModalOpen(true);
  };

  const handleOpenAdjustModal = (product: Product) => {
    setSelectedProductForAdjust(product);
    setAdjustModalOpen(true);
  };

  const handleOpenBarcodeModal = (product: Product) => {
    setSelectedProductForBarcode(product);
    setBarcodeModalOpen(true);
  };

  const handleOpenSupplierModal = (supplier?: Supplier) => {
    setSelectedSupplierForEdit(supplier || null);
    setSupplierModalOpen(true);
  };

  const handleOpenCreatePOModal = (supplierId?: string) => {
    setSelectedSupplierIdForPo(supplierId);
    setCreatePoModalOpen(true);
  };

  // If user is not logged in, show the exact AuthScreen requested
  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100/70 text-slate-900 font-sans antialiased select-none">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={tab => {
          setActiveTab(tab);
          setIsMobileMenuOpen(false);
        }}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          setActiveTab={setActiveTab}
          onSelectProductForDetail={prod => {
            handleOpenProductModal(prod);
          }}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={handleToggleSidebar}
        />

        {/* Dynamic Tab Body */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 no-scrollbar">
          <div className="max-w-7xl mx-auto w-full">
            {activeTab === 'dashboard' && (
              <DashboardView
                setActiveTab={setActiveTab}
                onOpenProductModal={handleOpenProductModal}
                onOpenTransferModal={handleOpenTransferModal}
              />
            )}

            {activeTab === 'pos' && (
              <PosView
                onSaleCompleted={sale => {
                  setCompletedSaleReceipt(sale);
                }}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryView
                onOpenProductModal={handleOpenProductModal}
                onOpenTransferModal={handleOpenTransferModal}
                onOpenAdjustModal={handleOpenAdjustModal}
                onOpenBarcodeModal={handleOpenBarcodeModal}
                onOpenCsvImportModal={() => setCsvImportModalOpen(true)}
              />
            )}

            {activeTab === 'sales-reports' && <SalesReportsView />}

            {activeTab === 'stock-movements' && (
              <StockMovementsView
                onOpenTransferModal={() => handleOpenTransferModal()}
              />
            )}

            {activeTab === 'suppliers' && (
              <SuppliersView
                onOpenSupplierModal={handleOpenSupplierModal}
                onOpenCreatePOModal={handleOpenCreatePOModal}
              />
            )}

            {activeTab === 'purchase-orders' && (
              <PurchaseOrdersView
                onOpenCreatePOModal={() => handleOpenCreatePOModal()}
              />
            )}

            {activeTab === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Modals Container */}
      <ProductModal
        isOpen={productModalOpen}
        product={selectedProductForEdit}
        onClose={() => {
          setProductModalOpen(false);
          setSelectedProductForEdit(null);
        }}
      />

      <TransferModal
        isOpen={transferModalOpen}
        product={selectedProductForTransfer}
        onClose={() => {
          setTransferModalOpen(false);
          setSelectedProductForTransfer(null);
        }}
      />

      <AdjustModal
        isOpen={adjustModalOpen}
        product={selectedProductForAdjust}
        onClose={() => {
          setAdjustModalOpen(false);
          setSelectedProductForAdjust(null);
        }}
      />

      <BarcodeGeneratorModal
        isOpen={barcodeModalOpen}
        product={selectedProductForBarcode}
        onClose={() => {
          setBarcodeModalOpen(false);
          setSelectedProductForBarcode(null);
        }}
      />

      <CsvImportModal
        isOpen={csvImportModalOpen}
        onClose={() => setCsvImportModalOpen(false)}
      />

      <SupplierModal
        isOpen={supplierModalOpen}
        supplier={selectedSupplierForEdit}
        onClose={() => {
          setSupplierModalOpen(false);
          setSelectedSupplierForEdit(null);
        }}
      />

      <CreatePOModal
        isOpen={createPoModalOpen}
        supplierId={selectedSupplierIdForPo}
        onClose={() => {
          setCreatePoModalOpen(false);
          setSelectedSupplierIdForPo(undefined);
        }}
      />

      <ReceiptModal
        sale={completedSaleReceipt}
        onClose={() => setCompletedSaleReceipt(null)}
      />

      {/* Authentication Modal (Log In / Create Account) */}
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <MainApp />
      </StoreProvider>
    </AuthProvider>
  );
}
