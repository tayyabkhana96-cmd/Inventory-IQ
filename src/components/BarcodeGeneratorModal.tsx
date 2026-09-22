import React, { useEffect, useRef, useState } from 'react';
import { X, Printer, Barcode, Copy, Check, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatCurrency } from '../utils/format';
import JsBarcode from 'jsbarcode';

interface BarcodeGeneratorModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BarcodeGeneratorModal: React.FC<BarcodeGeneratorModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { config } = useStore();
  const svgRef = useRef<SVGSVGElement>(null);
  const [copies, setCopies] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (product && svgRef.current) {
      try {
        JsBarcode(svgRef.current, product.barcode, {
          format: 'CODE128',
          width: 2,
          height: 60,
          displayValue: true,
          font: 'monospace',
          fontSize: 14,
          textMargin: 4,
          margin: 10,
        });
      } catch (err) {
        console.error('Barcode error', err);
      }
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleCopyBarcode = () => {
    navigator.clipboard.writeText(product.barcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Barcode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Barcode Label Generator</h3>
              <p className="text-xs text-slate-500">Official Code128 standard for scanner guns</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Barcode Label Card */}
        <div
          id="printable-barcodes"
          className="my-4 p-5 rounded-2xl border-2 border-slate-200 bg-white text-center shadow-xs"
        >
          <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            {config.storeName}
          </div>
          <div className="font-extrabold text-sm text-slate-900 mt-1 truncate">
            {product.name}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            SKU: <span className="font-mono font-bold text-slate-800">{product.sku}</span> |{' '}
            {product.category}
          </div>

          <div className="my-3 flex justify-center">
            <svg ref={svgRef} className="max-w-full" />
          </div>

          <div className="pt-2 border-t border-dashed border-slate-200 flex items-center justify-between px-2">
            <span className="text-[11px] text-slate-500 font-mono">
              Shelf: {product.locationDetails?.shelfAisle || 'Store Floor'}
            </span>
            <span className="text-base font-black text-indigo-700">
              {formatCurrency(product.sellingPrice, config.currencySymbol)}
            </span>
          </div>
        </div>

        {/* Label options */}
        <div className="flex items-center justify-between gap-3 text-xs py-2 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4">
          <button
            onClick={handleCopyBarcode}
            className="flex items-center gap-1.5 font-bold text-indigo-600 hover:text-indigo-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied code!' : 'Copy barcode string'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Stickers:</span>
            <select
              value={copies}
              onChange={e => setCopies(parseInt(e.target.value) || 1)}
              className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold"
            >
              <option value="1">1 Label</option>
              <option value="4">4 Labels</option>
              <option value="12">12 Labels</option>
              <option value="24">24 Sheet</option>
            </select>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
          >
            Done
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Label Stickers ({copies})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
