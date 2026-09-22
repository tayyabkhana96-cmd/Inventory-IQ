import React, { useState } from 'react';
import { X, Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { downloadBlob, generateCsv } from '../utils/format';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ isOpen, onClose }) => {
  const { importProductsFromList } = useStore();
  const [dragActive, setDragActive] = useState(false);
  const [parsedItems, setParsedItems] = useState<Product[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const headers = [
      'Name',
      'SKU',
      'Barcode',
      'Category',
      'Brand',
      'Unit',
      'CostPrice',
      'SellingPrice',
      'StoreStock',
      'WarehouseStock',
      'ReorderPoint',
      'ShelfLocation',
      'WarehouseZone',
    ];

    const sampleRows = [
      [
        'Fresh White Eggs (Tray of 30)',
        'EGG-TRY-30',
        '896400099101',
        'Dairy & Fresh',
        'Farm Fresh',
        'pack',
        520,
        650,
        25,
        100,
        30,
        'Chiller Aisle 1',
        'Cold Room A',
      ],
      [
        'Whole Wheat Bread 750g',
        'BRD-WHT-75',
        '896400099102',
        'Bakery',
        'Dawn',
        'pack',
        160,
        210,
        15,
        45,
        20,
        'Bakery Counter',
        'Rack B-1',
      ],
      [
        'Toothpaste Total Clean 140g',
        'TP-COL-140',
        '896400099103',
        'Personal Care',
        'Colgate',
        'pcs',
        220,
        290,
        18,
        60,
        15,
        'Aisle 4 Bay B',
        'Rack D-2',
      ],
    ];

    const csvString = generateCsv(headers, sampleRows);
    downloadBlob(csvString, 'Megamart_Product_Import_Template.csv');
  };

  const parseCsvText = (text: string) => {
    try {
      setErrorMessage('');
      const lines = text
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0);

      if (lines.length < 2) {
        setErrorMessage('The uploaded CSV file is empty or missing headers.');
        return;
      }

      // Simple robust CSV tokenizer handling commas inside quotes
      const tokenize = (line: string): string[] => {
        const result: string[] = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = '';
          } else {
            cur += char;
          }
        }
        result.push(cur.trim());
        return result.map(v => v.replace(/^"|"$/g, ''));
      };

      const headers = tokenize(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
      const items: Product[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = tokenize(lines[i]);
        if (cols.length < 2) continue;

        const row: Record<string, string> = {};
        headers.forEach((h, idx) => {
          row[h] = cols[idx] || '';
        });

        const name = row['name'] || row['productname'] || row['item'] || `Item ${i}`;
        const sku =
          row['sku'] || row['code'] || `SKU-${Date.now().toString().slice(-4)}-${i}`;
        const barcode =
          row['barcode'] ||
          row['upc'] ||
          row['ean'] ||
          Math.floor(100000000000 + Math.random() * 900000000000).toString();
        const category = row['category'] || 'General Store';
        const brand = row['brand'] || undefined;
        const unit = (row['unit'] || 'pcs') as Product['unit'];
        const costPrice = parseFloat(row['costprice'] || row['cost'] || '0') || 0;
        const sellingPrice =
          parseFloat(row['sellingprice'] || row['price'] || row['retail'] || '0') || costPrice * 1.25;
        const storeStock = parseInt(row['storestock'] || row['shelfstock'] || '10') || 0;
        const warehouseStock =
          parseInt(row['warehousestock'] || row['stock'] || '20') || 0;
        const reorderPoint = parseInt(row['reorderpoint'] || row['reorder'] || '10') || 10;
        const shelfAisle = row['shelflocation'] || row['aisle'] || undefined;
        const warehouseZone = row['warehousezone'] || row['zone'] || undefined;

        items.push({
          id: `imp-${Date.now()}-${i}`,
          name,
          sku,
          barcode,
          category,
          brand,
          unit,
          costPrice,
          sellingPrice,
          storeStock,
          warehouseStock,
          reorderPoint,
          locationDetails: { shelfAisle, warehouseZone },
          salesCount: 0,
          updatedAt: new Date().toISOString(),
        });
      }

      if (items.length === 0) {
        setErrorMessage('No valid product rows could be read from this file.');
        return;
      }

      setParsedItems(items);
    } catch (err) {
      setErrorMessage('Failed to parse CSV. Please verify formatting.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = evt => {
        const text = evt.target?.result as string;
        if (text) parseCsvText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleConfirmImport = () => {
    if (parsedItems.length > 0) {
      importProductsFromList(parsedItems);
      alert(`Successfully imported ${parsedItems.length} products into your catalog!`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Bulk Product Catalog Import</h3>
              <p className="text-xs text-slate-500">Upload existing store Excel or CSV file</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4 space-y-4 text-xs">
          {/* Step 1: Template Download */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between">
            <div>
              <div className="font-bold text-indigo-950">1. Need a template format?</div>
              <div className="text-[11px] text-indigo-700">
                Download the standardized CSV file with sample products & column headers.
              </div>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-bold rounded-xl flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Template</span>
            </button>
          </div>

          {/* Step 2: Upload Zone */}
          <div
            onDragOver={e => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={e => {
              e.preventDefault();
              setDragActive(false);
              const file = e.dataTransfer.files[0];
              if (file) {
                setFileName(file.name);
                const reader = new FileReader();
                reader.onload = evt => {
                  const text = evt.target?.result as string;
                  if (text) parseCsvText(text);
                };
                reader.readAsText(file);
              }
            }}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
              dragActive
                ? 'border-indigo-600 bg-indigo-50/50'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50'
            }`}
          >
            <FileSpreadsheet className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <div className="font-bold text-slate-800">
              {fileName ? fileName : 'Drag and drop your .csv file here'}
            </div>
            <p className="text-slate-400 text-[11px] mt-1">Or click to select from iPad or Laptop</p>

            <label className="mt-3 inline-block px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 font-bold text-indigo-600 rounded-xl cursor-pointer shadow-xs">
              <span>Choose CSV File</span>
              <input type="file" accept=".csv,text/csv" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Preview of Parsed Items */}
          {parsedItems.length > 0 && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <div className="flex items-center gap-2 font-bold text-emerald-800 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Ready to Import {parsedItems.length} Products</span>
              </div>
              <div className="text-[11px] text-emerald-700 max-h-28 overflow-y-auto divide-y divide-emerald-100 pt-1">
                {parsedItems.slice(0, 5).map((p, idx) => (
                  <div key={idx} className="py-1 flex justify-between">
                    <span className="font-semibold truncate max-w-[240px]">{p.name}</span>
                    <span>SKU: {p.sku} | {p.category}</span>
                  </div>
                ))}
                {parsedItems.length > 5 && (
                  <div className="pt-1 text-center font-bold">
                    + {parsedItems.length - 5} more items
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={parsedItems.length === 0}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm & Import ({parsedItems.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
