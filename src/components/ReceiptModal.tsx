import React, { useEffect, useRef } from 'react';
import { Printer, X, CheckCircle2, Download, Store } from 'lucide-react';
import { POSSale } from '../types';
import { useStore } from '../context/StoreContext';
import { formatCurrency, formatDateTime } from '../utils/format';
import JsBarcode from 'jsbarcode';

interface ReceiptModalProps {
  sale: POSSale | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, onClose }) => {
  const { config } = useStore();
  const barcodeSvgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (sale && barcodeSvgRef.current) {
      try {
        JsBarcode(barcodeSvgRef.current, sale.id, {
          format: 'CODE128',
          lineColor: '#000',
          width: 1.5,
          height: 36,
          displayValue: false,
          margin: 0,
        });
      } catch (err) {
        console.debug('Barcode render error', err);
      }
    }
  }, [sale]);

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Transaction Approved</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 80mm Printable Receipt Box */}
        <div
          id="printable-receipt"
          className="my-4 p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 font-mono text-xs text-slate-800"
        >
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300">
            <div className="font-extrabold text-sm uppercase tracking-tight text-slate-900">
              {config.storeName}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{config.address}</div>
            <div className="text-[10px] text-slate-500">Tel: {config.phone}</div>
            <div className="text-[10px] text-slate-400 mt-1">TAX / NTN: PK-8831902</div>
          </div>

          {/* Meta Info */}
          <div className="py-2 border-b border-dashed border-slate-300 text-[10px] space-y-0.5">
            <div className="flex justify-between">
              <span>Receipt #:</span>
              <span className="font-bold">{sale.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Date/Time:</span>
              <span>{formatDateTime(sale.timestamp)}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{sale.cashierName}</span>
            </div>
            {sale.customerName && (
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{sale.customerName}</span>
              </div>
            )}
          </div>

          {/* Itemized Lines */}
          <div className="py-2 border-b border-dashed border-slate-300 space-y-1.5 text-[11px]">
            {sale.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between font-bold">
                  <span className="truncate max-w-[180px]">{item.productName}</span>
                  <span>{formatCurrency(item.subtotal, config.currencySymbol)}</span>
                </div>
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>
                    {item.quantity} x {formatCurrency(item.unitPrice, config.currencySymbol)}
                  </span>
                  {item.discountPercent > 0 && <span>(-{item.discountPercent}%)</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Totals Calculation */}
          <div className="py-2 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(sale.subtotal, config.currencySymbol)}</span>
            </div>
            {sale.discountTotal > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount:</span>
                <span>-{formatCurrency(sale.discountTotal, config.currencySymbol)}</span>
              </div>
            )}
            {sale.taxAmount > 0 && (
              <div className="flex justify-between">
                <span>Tax ({sale.taxRate}%):</span>
                <span>{formatCurrency(sale.taxAmount, config.currencySymbol)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs font-black pt-1 border-t border-slate-200">
              <span>NET TOTAL:</span>
              <span>{formatCurrency(sale.grandTotal, config.currencySymbol)}</span>
            </div>
          </div>

          {/* Payment & Change Breakdown */}
          <div className="py-2 text-[10px] space-y-0.5">
            <div className="flex justify-between">
              <span>Payment Type:</span>
              <span className="font-bold">{sale.paymentMethod}</span>
            </div>
            {sale.cashTendered !== undefined && (
              <div className="flex justify-between">
                <span>Cash Tendered:</span>
                <span>{formatCurrency(sale.cashTendered, config.currencySymbol)}</span>
              </div>
            )}
            {sale.changeGiven !== undefined && (
              <div className="flex justify-between font-bold text-slate-900">
                <span>Change Returned:</span>
                <span>{formatCurrency(sale.changeGiven, config.currencySymbol)}</span>
              </div>
            )}
          </div>

          {/* Footer Barcode & Thank You */}
          <div className="pt-2 text-center border-t border-dashed border-slate-300">
            <svg ref={barcodeSvgRef} className="mx-auto my-1 max-w-full h-9" />
            <div className="text-[9px] text-slate-400 font-mono">{sale.id}</div>
            <div className="text-[10px] font-bold mt-1 text-slate-600">
              Thank you for shopping with us!
            </div>
            <div className="text-[9px] text-slate-400">Please retain receipt for exchange within 7 days.</div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            Done
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt (80mm)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
