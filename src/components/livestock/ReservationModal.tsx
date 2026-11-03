import React, { useState } from 'react';
import { Animal, Contact } from '../../types/domain';
import { formatINR } from '../../lib/currency';

interface ReservationModalProps {
  animal: Animal;
  contacts: Contact[];
  onClose: () => void;
  onConfirm: (deposit: number, contactId: string) => Promise<void>;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  animal,
  contacts,
  onClose,
  onConfirm,
}) => {
  const [deposit, setDeposit] = useState<number>(10000);
  const [contactId, setContactId] = useState<string>(contacts[0]?.id || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactId) {
      setError('Please select a registered buyer.');
      return;
    }
    if (deposit <= 0) {
      setError('Token deposit must be greater than zero.');
      return;
    }

    setSubmitting(true);
    try {
      await onConfirm(deposit, contactId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to place reservation');
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
              Hold Reservation (बयाना / टोकन)
            </h3>
            <p className="text-[11px] text-stone-700">
              Reserve #{animal.id} ({animal.breed} {animal.species})
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
              Select Prospective Buyer Contact
            </label>
            <select
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-stone-50"
              required
            >
              <option value="">-- Choose Buyer from Directory --</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.location}) - {c.phone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-800 pb-1">
              Token Deposit Amount Received (₹)
            </label>
            <input
              type="number"
              step="1000"
              value={deposit}
              onChange={(e) => setDeposit(Number(e.target.value))}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono tabular-nums"
              required
            />
            <span className="text-[11px] text-stone-700 block pt-1">
              Indicative Range: {formatINR(animal.listing.priceMin)} – {formatINR(animal.listing.priceMax)}
            </span>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
            ℹ️ Marking this animal as <strong>RESERVED</strong> will lock the listing and display a reservation banner on the public catalog to prevent conflicting inquiries.
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
              className="px-4 py-1.5 rounded-lg bg-orange-700 hover:bg-orange-800 text-white font-semibold shadow-xs"
            >
              {submitting ? 'Holding...' : 'Confirm Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
