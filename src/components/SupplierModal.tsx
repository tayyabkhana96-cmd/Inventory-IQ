import React, { useState, useEffect } from 'react';
import { X, Truck, CheckCircle2 } from 'lucide-react';
import { Supplier } from '../types';
import { useStore } from '../context/StoreContext';

interface SupplierModalProps {
  supplier?: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({ supplier, isOpen, onClose }) => {
  const { addSupplier, updateSupplier } = useStore();

  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Beverages & Drinks');
  const [address, setAddress] = useState('');
  const [leadTimeDays, setLeadTimeDays] = useState<number>(2);
  const [paymentTerms, setPaymentTerms] = useState('Net 15');

  useEffect(() => {
    if (supplier) {
      setName(supplier.name);
      setContactPerson(supplier.contactPerson);
      setEmail(supplier.email);
      setPhone(supplier.phone);
      setCategory(supplier.category);
      setAddress(supplier.address || '');
      setLeadTimeDays(supplier.leadTimeDays);
      setPaymentTerms(supplier.paymentTerms);
    } else {
      setName('');
      setContactPerson('');
      setEmail('');
      setPhone('+92 300 ');
      setCategory('General Goods & FMCG');
      setAddress('');
      setLeadTimeDays(3);
      setPaymentTerms('Net 30');
    }
  }, [supplier, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Supplier name is required.');
      return;
    }

    const payload = {
      name: name.trim(),
      contactPerson: contactPerson.trim() || 'Procurement Agent',
      email: email.trim() || 'vendor@example.com',
      phone: phone.trim() || 'N/A',
      category: category.trim() || 'General Store',
      address: address.trim() || undefined,
      leadTimeDays: Math.max(1, leadTimeDays),
      paymentTerms: paymentTerms.trim() || 'Immediate',
      status: 'ACTIVE' as const,
      rating: supplier?.rating || 4.8,
    };

    if (supplier) {
      updateSupplier({
        ...supplier,
        ...payload,
      });
    } else {
      addSupplier(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {supplier ? 'Edit Supplier' : 'Register New Vendor'}
              </h3>
              <p className="text-xs text-slate-500">Contact & distribution terms</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Company / Supplier Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. National Foods Distributing Co."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Representative</label>
              <input
                type="text"
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                placeholder="e.g. Tariq Mehmood"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="e.g. Dairy & Frozen"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="sales@distributor.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Warehouse / Depot Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. Plot 44, Industrial Estate Phase 2"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Delivery Lead Time</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  value={leadTimeDays}
                  onChange={e => setLeadTimeDays(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
                <span className="text-slate-500 font-medium">days</span>
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Terms</label>
              <input
                type="text"
                value={paymentTerms}
                onChange={e => setPaymentTerms(e.target.value)}
                placeholder="e.g. Net 15, COD"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{supplier ? 'Save Changes' : 'Add Supplier'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
