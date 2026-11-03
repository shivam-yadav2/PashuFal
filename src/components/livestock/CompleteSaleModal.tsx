import React, { useState } from 'react';
import { Animal, Contact } from '../../types/domain';
import { formatINR } from '../../lib/currency';

interface CompleteSaleModalProps {
  animal: Animal;
  contacts: Contact[];
  onClose: () => void;
  onConfirm: (agreedPrice: number, buyerContactId: string, notes?: string) => Promise<void>;
}

export const CompleteSaleModal: React.FC<CompleteSaleModalProps> = ({
  animal,
  contacts,
  onClose,
  onConfirm,
}) => {
  const [agreedPrice, setAgreedPrice] = useState<number>(animal.listing.priceMin);
  const [buyerContactId, setBuyerContactId] = useState<string>(
    animal.listing.reservedForContactId || contacts[0]?.id || ''
  );
  const [notes, setNotes] = useState<string>('Milking pail test completed. Animal dispatched via transport vehicle.');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerContactId) {
      setError('Please select the buyer from registered contacts.');
      return;
    }
    if (agreedPrice <= 0) {
      setError('Sale price must be greater than zero.');
      return;
    }

    setSubmitting(true);
    try {
      await onConfirm(agreedPrice, buyerContactId, notes);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to complete sale');
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
              Record Completed Cattle Sale (बिक्री दर्ज करें)
            </h3>
            <p className="text-[11px] text-stone-700">
              Animal #{animal.id} · {animal.breed} {animal.species}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleConfirm} className="space-y-4 pt-4">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block font-bold text-stone-800 pb-1">
              Final Buyer Contact
            </label>
            <select
              value={buyerContactId}
              onChange={(e) => setBuyerContactId(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-stone-50"
              required
            >
              <option value="">-- Choose Buyer from Contacts --</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.location}) - {c.phone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-800 pb-1">
              Agreed Sale Price (₹)
            </label>
            <input
              type="number"
              step="500"
              value={agreedPrice}
              onChange={(e) => setAgreedPrice(Number(e.target.value))}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono font-bold tabular-nums"
              required
            />
            <span className="text-[11px] text-stone-700 block pt-1">
              Original Asking: {formatINR(animal.listing.priceMin)} – {formatINR(animal.listing.priceMax)}
            </span>
          </div>

          {animal.ownershipType === 'BROKERAGE' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-950 text-[11px] space-y-1">
              <div className="font-bold">Brokerage Transaction Settlement</div>
              <div>Agreed Commission: ₹{animal.brokerageCommission?.toLocaleString('en-IN') || 1500}</div>
              <div className="text-stone-700">A brokerage settlement entry will be logged into the financial ledger.</div>
            </div>
          )}

          <div>
            <label className="block font-bold text-stone-800 pb-1">
              Sale & Transport Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
            />
          </div>

          <div className="p-3 bg-stone-100 rounded-lg border border-stone-200 text-stone-700 text-[11px]">
            ⚠️ This will mark listing #{animal.id} as <strong>SOLD</strong> and remove it from public catalog discovery. An immutable transaction receipt will be logged.
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
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
              {submitting ? 'Recording...' : 'Finalize Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
