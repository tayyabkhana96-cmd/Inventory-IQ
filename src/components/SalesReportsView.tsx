import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  DollarSign,
  TrendingUp,
  Percent,
  Receipt,
  CreditCard,
  Banknote,
  QrCode,
  ArrowUpRight,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { POSSale } from '../types';
import {
  formatCurrency,
  formatDateTime,
  generateCsv,
  downloadBlob,
} from '../utils/format';

export const SalesReportsView: React.FC = () => {
  const { sales, config } = useStore();
  const [period, setPeriod] = useState<'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'THIS_MONTH' | 'ALL'>('TODAY');

  // Filter sales based on period
  const filteredSales = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const yesterday = new Date(now.getTime() - 86400000);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return sales.filter(s => {
      const saleDate = new Date(s.timestamp);
      if (period === 'TODAY') {
        return s.timestamp.startsWith(todayStr);
      }
      if (period === 'YESTERDAY') {
        return s.timestamp.startsWith(yesterdayStr);
      }
      if (period === 'LAST_7_DAYS') {
        return saleDate >= sevenDaysAgo;
      }
      if (period === 'THIS_MONTH') {
        return saleDate >= firstDayOfMonth;
      }
      return true; // ALL
    });
  }, [sales, period]);

  // Aggregate Metrics
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalCost = filteredSales.reduce((sum, s) => sum + s.costTotal, 0);
  const totalProfit = filteredSales.reduce((sum, s) => sum + s.profitTotal, 0);
  const profitMarginPct = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;
  const totalTransactions = filteredSales.length;
  const avgBasketSize = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;
  const totalUnitsSold = filteredSales.reduce(
    (sum, s) => sum + s.items.reduce((iSum, i) => iSum + i.quantity, 0),
    0
  );

  // Payment methods breakdown
  const paymentBreakdown = useMemo(() => {
    let cash = 0, card = 0, qr = 0;
    filteredSales.forEach(s => {
      if (s.paymentMethod === 'CASH') cash += s.grandTotal;
      else if (s.paymentMethod === 'CARD') card += s.grandTotal;
      else if (s.paymentMethod === 'QR_TRANSFER') qr += s.grandTotal;
    });
    return { cash, card, qr };
  }, [filteredSales]);

  // Top products in this period
  const productPerformance = useMemo(() => {
    const map = new Map<string, { name: string; sku: string; qty: number; revenue: number; profit: number }>();
    filteredSales.forEach(s => {
      s.items.forEach(item => {
        const existing = map.get(item.productId) || {
          name: item.productName,
          sku: item.sku,
          qty: 0,
          revenue: 0,
          profit: 0,
        };
        existing.qty += item.quantity;
        existing.revenue += item.subtotal;
        existing.profit += (item.unitPrice - item.costPrice) * item.quantity;
        map.set(item.productId, existing);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales]);

  // Export Sales to CSV
  const handleExportCsv = () => {
    const headers = [
      'Transaction ID',
      'Date & Time',
      'Cashier',
      'Customer',
      'Payment Method',
      'Items Count',
      'Subtotal',
      'Discount',
      'Tax',
      'Grand Total',
      'Wholesale Cost',
      'Gross Profit',
    ];

    const rows = filteredSales.map(s => [
      s.id,
      formatDateTime(s.timestamp),
      s.cashierName,
      s.customerName || 'Walk-in',
      s.paymentMethod,
      s.items.reduce((sum, i) => sum + i.quantity, 0),
      s.subtotal,
      s.discountTotal,
      s.taxAmount,
      s.grandTotal,
      s.costTotal,
      s.profitTotal,
    ]);

    const csvContent = generateCsv(headers, rows);
    downloadBlob(
      csvContent,
      `Megamart_Sales_Report_${period}_${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  const handlePrintZReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span>Automated Sales Reporting & Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time sales velocity, revenue audit, and cashier reconciliation.
          </p>
        </div>

        {/* Period Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            {(
              [
                ['TODAY', 'Today'],
                ['YESTERDAY', 'Yesterday'],
                ['LAST_7_DAYS', 'Last 7 Days'],
                ['THIS_MONTH', 'This Month'],
                ['ALL', 'All Time'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  period === key
                    ? 'bg-white text-indigo-600 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
            title="Export CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrintZReport}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95"
            title="Print Shift / End-of-Day Z-Report"
          >
            <Printer className="w-4 h-4" />
            <span>Print Z-Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Gross Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(totalRevenue, config.currencySymbol)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {totalTransactions} total customer transactions
            </div>
          </div>
        </div>

        {/* Net Profit & Margin */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Gross Profit
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 tracking-tight">
              {formatCurrency(totalProfit, config.currencySymbol)}
            </div>
            <div className="mt-1 text-xs text-slate-500 flex items-center justify-between">
              <span>Cost Basis: {formatCurrency(totalCost, config.currencySymbol)}</span>
              <span className="font-bold text-emerald-700">{profitMarginPct}% Margin</span>
            </div>
          </div>
        </div>

        {/* Average Basket Size */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Avg Basket Ticket
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(avgBasketSize, config.currencySymbol)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Per customer receipt average
            </div>
          </div>
        </div>

        {/* Units Sold */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Units Handed Out
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {totalUnitsSold.toLocaleString()}{' '}
              <span className="text-sm font-semibold text-slate-500">units</span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Removed from retail floor inventory
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods & Cashier Drawer Reconciliation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Payment Channel Settlement</h2>
            <p className="text-xs text-slate-500">Breakdown of tender types collected</p>
          </div>

          <div className="space-y-3">
            {/* Cash */}
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Physical Cash</div>
                  <div className="text-[11px] text-slate-500">In Register Drawer</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-black text-slate-900">
                  {formatCurrency(paymentBreakdown.cash, config.currencySymbol)}
                </div>
                <div className="text-[10px] text-slate-500">
                  {Math.round((paymentBreakdown.cash / (totalRevenue || 1)) * 100)}% of total
                </div>
              </div>
            </div>

            {/* Card */}
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Card Terminal / POS</div>
                  <div className="text-[11px] text-slate-500">Bank Settlement</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-black text-slate-900">
                  {formatCurrency(paymentBreakdown.card, config.currencySymbol)}
                </div>
                <div className="text-[10px] text-slate-500">
                  {Math.round((paymentBreakdown.card / (totalRevenue || 1)) * 100)}% of total
                </div>
              </div>
            </div>

            {/* QR */}
            <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Mobile QR / Online</div>
                  <div className="text-[11px] text-slate-500">Instant Wallet</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-black text-slate-900">
                  {formatCurrency(paymentBreakdown.qr, config.currencySymbol)}
                </div>
                <div className="text-[10px] text-slate-500">
                  {Math.round((paymentBreakdown.qr / (totalRevenue || 1)) * 100)}% of total
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Best Selling Items in Period */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Top Revenue Contributing Items</h2>
              <p className="text-xs text-slate-500">Filtered by {period.toLowerCase().replace('_', ' ')}</p>
            </div>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 font-bold border-b border-slate-100 text-[11px]">
                  <th className="py-2">Item</th>
                  <th className="py-2 text-center">Units Sold</th>
                  <th className="py-2 text-right">Gross Revenue</th>
                  <th className="py-2 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productPerformance.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No sales recorded in this period.
                    </td>
                  </tr>
                ) : (
                  productPerformance.slice(0, 5).map(prod => (
                    <tr key={prod.sku} className="hover:bg-slate-50/70">
                      <td className="py-2.5">
                        <div className="font-bold text-slate-900 truncate max-w-[220px]">
                          {prod.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">SKU: {prod.sku}</div>
                      </td>
                      <td className="py-2.5 text-center font-semibold text-slate-700">
                        {prod.qty}
                      </td>
                      <td className="py-2.5 text-right font-bold text-slate-900">
                        {formatCurrency(prod.revenue, config.currencySymbol)}
                      </td>
                      <td className="py-2.5 text-right font-bold text-emerald-600">
                        +{formatCurrency(prod.profit, config.currencySymbol)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detailed Transaction History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Transaction Audit Register</h2>
            <p className="text-xs text-slate-500">Every customer checkout timestamped and signed by cashier</p>
          </div>
          <span className="text-xs text-slate-400">Showing {filteredSales.length} records</span>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead>
              <tr className="text-slate-400 font-bold border-b border-slate-100 text-[11px]">
                <th className="py-2 px-3">Receipt #</th>
                <th className="py-2 px-3">Date / Time</th>
                <th className="py-2 px-3">Cashier</th>
                <th className="py-2 px-3">Items</th>
                <th className="py-2 px-3">Payment</th>
                <th className="py-2 px-3 text-right">Total</th>
                <th className="py-2 px-3 text-right">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No transactions recorded for this period.
                  </td>
                </tr>
              ) : (
                filteredSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-600">{sale.id}</td>
                    <td className="py-3 px-3 text-slate-600">{formatDateTime(sale.timestamp)}</td>
                    <td className="py-3 px-3 text-slate-700">{sale.cashierName}</td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-900">
                        {sale.items.reduce((s, i) => s + i.quantity, 0)} items
                      </span>
                      <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                        {sale.items.map(i => i.productName).join(', ')}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sale.paymentMethod === 'CASH'
                            ? 'bg-emerald-50 text-emerald-700'
                            : sale.paymentMethod === 'CARD'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-purple-50 text-purple-700'
                        }`}
                      >
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-black text-slate-900">
                      {formatCurrency(sale.grandTotal, config.currencySymbol)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-600">
                      +{formatCurrency(sale.profitTotal, config.currencySymbol)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
