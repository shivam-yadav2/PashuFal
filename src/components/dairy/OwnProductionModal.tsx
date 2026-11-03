import React, { useState } from 'react';
import { MilkProductionEntry, MilkShift } from '../../types/domain';
import { getTodayBusinessDate, getCurrentShift } from '../../lib/dates';

interface OwnProductionModalProps {
  onClose: () => void;
  onSave: (entry: Partial<MilkProductionEntry>) => Promise<void>;
}

export const OwnProductionModal: React.FC<OwnProductionModalProps> = ({
  onClose,
  onSave,
}) => {
  const [businessDate, setBusinessDate] = useState(getTodayBusinessDate());
  const [shift, setShift] = useState<MilkShift>(getCurrentShift());
  const [herdSource, setHerdSource] = useState('Main Dairy Shed A (Murrah Herd)');
  const [quantityLitres, setQuantityLitres] = useState<number>(140.0);
  const [notes, setNotes] = useState<string>('Milking completed on schedule. Clean stainless cans chilled.');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantityLitres <= 0) {
      setError('Please enter a valid milk quantity.');
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        id: `PROD-${Date.now()}`,
        businessDate,
        shift,
        herdSource,
        quantityLitres: Number(quantityLitres),
        recordedBy: 'Manager',
        notes,
        createdAt: new Date().toISOString(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record milk production');
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
              Own Herd Milking Entry (स्वयं का दुग्ध उत्पादन)
            </h3>
            <p className="text-[11px] text-stone-700">
              Record morning/evening milk yield from farm stables
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-800 pb-1">Date</label>
              <input
                type="date"
                value={businessDate}
                onChange={(e) => setBusinessDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-stone-800 pb-1">Milking Shift</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as MilkShift)}
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs bg-stone-50"
              >
                <option value="MORNING">Morning (सुबह)</option>
                <option value="EVENING">Evening (शाम)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-800 pb-1">Herd Shed / Source</label>
            <select
              value={herdSource}
              onChange={(e) => setHerdSource(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs bg-stone-50"
            >
              <option value="Main Dairy Shed A (Murrah Herd)">Main Dairy Shed A (Murrah Buffalo Herd)</option>
              <option value="Shed B (Desi Sahiwal & Gir Herd)">Shed B (Desi Sahiwal & Gir Cow Herd)</option>
              <option value="Shed C (Heifers & Recovery)">Shed C (Heifers & Recovery)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-800 pb-1">
              Quantity Produced (Litres)
            </label>
            <input
              type="number"
              step="0.5"
              value={quantityLitres}
              onChange={(e) => setQuantityLitres(Number(e.target.value))}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono font-bold tabular-nums text-stone-900"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-stone-800 pb-1">Observations / Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs"
            />
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 text-[11px] leading-relaxed">
            ℹ️ Posting this production entry automatically updates the <strong>Stock Movement Ledger</strong> and increases available morning dairy inventory.
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
              {submitting ? 'Posting...' : 'Post Production'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
