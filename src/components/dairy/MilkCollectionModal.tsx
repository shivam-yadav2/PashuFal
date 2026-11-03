import React, { useState } from 'react';
import { Contact, MilkCollectionEntry, MilkProductType, MilkShift } from '../../types/domain';
import { getTodayBusinessDate, getCurrentShift } from '../../lib/dates';
import { formatINRExact } from '../../lib/currency';

interface MilkCollectionModalProps {
  suppliers: Contact[];
  onClose: () => void;
  onSave: (entry: Partial<MilkCollectionEntry>) => Promise<void>;
}

export const MilkCollectionModal: React.FC<MilkCollectionModalProps> = ({
  suppliers,
  onClose,
  onSave,
}) => {
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [businessDate, setBusinessDate] = useState(getTodayBusinessDate());
  const [shift, setShift] = useState<MilkShift>(getCurrentShift());
  const [productType, setProductType] = useState<MilkProductType>('BUFFALO_MILK');
  const [grossLitres, setGrossLitres] = useState<number>(35.0);
  const [acceptedLitres, setAcceptedLitres] = useState<number>(35.0);
  const [fatPercentage, setFatPercentage] = useState<number>(7.2);
  const [snfPercentage, setSnfPercentage] = useState<number>(9.0);
  const [ratePerLitre, setRatePerLitre] = useState<number>(58.0);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('Lactometer reading standard, clean morning intake.');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rejectedLitres = Math.max(0, grossLitres - acceptedLitres);
  const calculatedCost = acceptedLitres * ratePerLitre;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      setError('Please select a registered farmer / milk supplier.');
      return;
    }
    if (acceptedLitres > grossLitres) {
      setError('Accepted litres cannot exceed gross received litres.');
      return;
    }
    if (acceptedLitres < 0 || ratePerLitre <= 0) {
      setError('Please enter valid positive quantities and rates.');
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        id: `COL-${Date.now()}`,
        supplierContactId: supplierId,
        businessDate,
        shift,
        productType,
        grossLitresReceived: Number(grossLitres),
        acceptedLitres: Number(acceptedLitres),
        rejectedLitres,
        rejectionReason: rejectedLitres > 0 ? rejectionReason : undefined,
        fatPercentage: Number(fatPercentage),
        snfPercentage: Number(snfPercentage),
        purchaseRatePerLitre: Number(ratePerLitre),
        totalCost: calculatedCost,
        paymentStatus: 'PENDING',
        recordedBy: 'Manager',
        notes,
        createdAt: new Date().toISOString(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record milk collection');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl border border-stone-200 max-w-lg w-full overflow-hidden shadow-2xl p-6 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              Farmer Milk Collection Intake (दूध संकलन)
            </h3>
            <p className="text-[11px] text-stone-700">
              Record received volume, FAT/SNF quality test, and purchase rate
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

          {/* Supplier & Shift */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-800 pb-1">Supplier / Farmer</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs bg-stone-50"
                required
              >
                <option value="">-- Select Farmer --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.location})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-800 pb-1">Milking Shift</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as MilkShift)}
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs bg-stone-50"
              >
                <option value="MORNING">Morning Shift (सुबह)</option>
                <option value="EVENING">Evening Shift (शाम)</option>
              </select>
            </div>
          </div>

          {/* Product Type & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-800 pb-1">Milk Type</label>
              <select
                value={productType}
                onChange={(e) => {
                  const pt = e.target.value as MilkProductType;
                  setProductType(pt);
                  if (pt === 'BUFFALO_MILK') {
                    setRatePerLitre(58);
                    setFatPercentage(7.2);
                  } else {
                    setRatePerLitre(48);
                    setFatPercentage(4.5);
                  }
                }}
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs bg-stone-50"
              >
                <option value="BUFFALO_MILK">Buffalo Milk (भैंस का दूध)</option>
                <option value="COW_MILK">Cow Milk (गाय का दूध)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-800 pb-1">Intake Date</label>
              <input
                type="date"
                value={businessDate}
                onChange={(e) => setBusinessDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono"
                required
              />
            </div>
          </div>

          {/* Gross vs Accepted */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-stone-800 pb-1">Gross (Ltr)</label>
              <input
                type="number"
                step="0.5"
                value={grossLitres}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setGrossLitres(val);
                  setAcceptedLitres(val);
                }}
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono tabular-nums font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-emerald-900 pb-1">Accepted (Ltr)</label>
              <input
                type="number"
                step="0.5"
                value={acceptedLitres}
                onChange={(e) => setAcceptedLitres(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-emerald-400 bg-emerald-50 rounded-lg text-xs font-mono tabular-nums font-bold text-emerald-950"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-stone-600 pb-1">Rejected (Ltr)</label>
              <input
                type="number"
                value={rejectedLitres}
                readOnly
                className="w-full px-2.5 py-1.5 border border-stone-200 bg-stone-100 rounded-lg text-xs font-mono tabular-nums text-stone-600"
              />
            </div>
          </div>

          {/* Quality FAT & SNF & Rate */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
            <div>
              <label className="block font-bold text-stone-800 pb-1">FAT (%)</label>
              <input
                type="number"
                step="0.1"
                value={fatPercentage}
                onChange={(e) => setFatPercentage(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-800 pb-1">SNF (%)</label>
              <input
                type="number"
                step="0.1"
                value={snfPercentage}
                onChange={(e) => setSnfPercentage(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-800 pb-1">Rate / Ltr (₹)</label>
              <input
                type="number"
                step="0.5"
                value={ratePerLitre}
                onChange={(e) => setRatePerLitre(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono tabular-nums font-bold text-stone-900"
                required
              />
            </div>
          </div>

          {/* Total Cost Display */}
          <div className="flex items-center justify-between p-3 bg-[#142921] text-amber-100 rounded-xl">
            <span className="font-medium text-xs">Total Supplier Payout:</span>
            <span className="text-base font-bold font-mono tabular-nums">
              {formatINRExact(calculatedCost)}
            </span>
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
              {submitting ? 'Recording...' : 'Accept & Record Intake'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
