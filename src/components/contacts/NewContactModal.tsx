import React, { useState } from 'react';
import { Contact, ContactRole } from '../../types/domain';

interface NewContactModalProps {
  onClose: () => void;
  onSave: (contact: Partial<Contact>) => Promise<void>;
}

export const NewContactModal: React.FC<NewContactModalProps> = ({
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Gorakhpur');
  const [roles, setRoles] = useState<ContactRole[]>(['LIVESTOCK_BUYER']);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleRole = (r: ContactRole) => {
    if (roles.includes(r)) {
      if (roles.length > 1) {
        setRoles(roles.filter(x => x !== r));
      }
    } else {
      setRoles([...roles, r]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Name and phone number are required.');
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        id: `CONT-${Date.now().toString().slice(-4)}`,
        name,
        phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
        whatsapp: phone.replace(/[^0-9]/g, ''),
        location,
        roles,
        active: true,
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save contact');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl border border-stone-200 max-w-md w-full overflow-hidden shadow-2xl p-6 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              Add New Shared Contact (संपर्क जोड़ें)
            </h3>
            <p className="text-[11px] text-stone-700">
              Shared directory for buyers, sellers, farmers, and dairy customers
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block font-bold text-stone-800 pb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Suresh Yadav or Dr. Arvind Tiwari"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-800 pb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="94500 00000"
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-stone-800 pb-1">Town / Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Betiahata, Gorakhpur"
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-800 pb-1.5">Business Roles (Select all that apply)</label>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {[
                { id: 'LIVESTOCK_BUYER', label: 'Livestock Buyer' },
                { id: 'LIVESTOCK_SELLER', label: 'Livestock Seller / Farmer' },
                { id: 'MILK_SUPPLIER', label: 'Milk Supplier (किसान)' },
                { id: 'DAIRY_CUSTOMER', label: 'Household Milk Customer' },
                { id: 'BULK_BUYER', label: 'Bulk Commercial Buyer' },
              ].map((item) => (
                <label
                  key={item.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                    roles.includes(item.id as ContactRole)
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={roles.includes(item.id as ContactRole)}
                    onChange={() => toggleRole(item.id as ContactRole)}
                    className="rounded text-emerald-700"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-800 pb-1">Operational Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Morning 2L delivery subscriber, pays on 1st of month"
              className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs"
            />
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-stone-600 hover:bg-stone-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 rounded-lg bg-[#142921] hover:bg-[#1E3A2F] text-amber-100 font-semibold shadow-xs"
            >
              {submitting ? 'Saving...' : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
