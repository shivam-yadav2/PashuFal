import React, { useState } from 'react';
import { Animal, Contact, Species, OwnershipType, ListingStatus } from '../../types/domain';

interface AddEditAnimalModalProps {
  animalToEdit?: Animal | null;
  contacts: Contact[];
  onClose: () => void;
  onSave: (animalData: Partial<Animal>) => Promise<void>;
}

export const AddEditAnimalModal: React.FC<AddEditAnimalModalProps> = ({
  animalToEdit,
  contacts,
  onClose,
  onSave,
}) => {
  const isEditing = !!animalToEdit;

  const [species, setSpecies] = useState<Species>(animalToEdit?.species || 'BUFFALO');
  const [breed, setBreed] = useState(animalToEdit?.breed || (species === 'BUFFALO' ? 'Murrah' : 'Sahiwal'));
  const [tagNumber, setTagNumber] = useState(animalToEdit?.tagNumber || `UP-GKP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [ageYears, setAgeYears] = useState(animalToEdit?.ageYears || 5);
  const [ageMonths, setAgeMonths] = useState(animalToEdit?.ageMonths || 0);
  const [lactationNumber, setLactationNumber] = useState(animalToEdit?.lactationNumber || 2);
  const [calvingDetails, setCalvingDetails] = useState(animalToEdit?.calvingDetails || 'Calved 20 days ago, female calf at foot');
  const [pregnancyStatus, setPregnancyStatus] = useState(animalToEdit?.pregnancyStatus || 'Open (Milking Peak)');
  const [reportedMilkYieldLpd, setReportedMilkYieldLpd] = useState(animalToEdit?.reportedMilkYieldLpd || 16.0);
  const [ownershipType, setOwnershipType] = useState<OwnershipType>(animalToEdit?.ownershipType || 'OWNED');
  const [sellerContactId, setSellerContactId] = useState(animalToEdit?.sellerContactId || '');
  const [brokerageCommission, setBrokerageCommission] = useState(animalToEdit?.brokerageCommission || 1500);

  const [title, setTitle] = useState(animalToEdit?.listing.title || '');
  const [description, setDescription] = useState(animalToEdit?.listing.description || '');
  const [priceMin, setPriceMin] = useState(animalToEdit?.listing.priceMin || 110000);
  const [priceMax, setPriceMax] = useState(animalToEdit?.listing.priceMax || 125000);
  const [status, setStatus] = useState<ListingStatus>(animalToEdit?.listing.status || 'AVAILABLE');
  const [location, setLocation] = useState(animalToEdit?.listing.location || 'Gorakhpur Farm, Deoria Road Bypass');
  const [healthNotes, setHealthNotes] = useState(animalToEdit?.healthNotes || 'Vaccinated for FMD & HS. Clear veterinary pass.');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Auto-generate title if empty
  const handleAutoTitle = () => {
    const generated = `${breed} ${species === 'BUFFALO' ? 'Buffalo' : 'Desi Cow'} (${reportedMilkYieldLpd} LPD, ${lactationNumber ? `${lactationNumber}nd Lactation` : 'Heifer'})`;
    setTitle(generated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (priceMin > priceMax) {
      setError('Minimum indicative price cannot be greater than maximum price.');
      return;
    }

    if (priceMin <= 0 || priceMax <= 0) {
      setError('Indicative prices must be positive numbers.');
      return;
    }

    if (!title.trim()) {
      setError('Listing title is required.');
      return;
    }

    if (ownershipType === 'BROKERAGE' && !sellerContactId) {
      setError('Please select a farmer/seller contact for brokerage animals.');
      return;
    }

    setSubmitting(true);
    try {
      const animalPayload: Partial<Animal> = {
        ...(animalToEdit || {}),
        id: animalToEdit?.id || `PDPK-${species.substring(0, 3)}-${Date.now().toString().slice(-4)}`,
        tagNumber,
        species,
        breed,
        gender: 'FEMALE',
        ageYears: Number(ageYears),
        ageMonths: Number(ageMonths),
        lactationNumber: Number(lactationNumber),
        calvingDetails,
        pregnancyStatus,
        reportedMilkYieldLpd: Number(reportedMilkYieldLpd),
        milkYieldUnit: 'LPD',
        ownershipType,
        sellerContactId: ownershipType === 'BROKERAGE' ? sellerContactId : undefined,
        brokerageCommission: ownershipType === 'BROKERAGE' ? Number(brokerageCommission) : undefined,
        healthNotes,
        updatedAt: new Date().toISOString(),
        version: (animalToEdit?.version || 0) + 1,
        listing: {
          title,
          description: description || `Healthy and high milk-yielding ${breed} ${species.toLowerCase()} available for inspection at Gorakhpur farm.`,
          priceMin: Number(priceMin),
          priceMax: Number(priceMax),
          currency: 'INR',
          status,
          location,
          publishedAt: animalToEdit?.listing.publishedAt || new Date().toISOString(),
          lastVerifiedAt: new Date().toISOString().split('T')[0],
        },
        images: animalToEdit?.images || [
          {
            id: `img-${Date.now()}`,
            animalId: animalToEdit?.id || '',
            url: '/assets/cattle_placeholder.jpg',
            displayOrder: 1,
            altText: `${breed} ${species}`,
            isPrimary: true
          }
        ]
      };

      await onSave(animalPayload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save animal record');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-2xl border border-stone-200 max-w-2xl w-full overflow-hidden shadow-2xl my-8 relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-[#FAF8F5] border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900">
              {isEditing ? `Edit Animal #${animalToEdit.id}` : 'Intake & List New Livestock'}
            </h3>
            <p className="text-xs text-stone-700">
              Register cattle into inventory or create public brokerage listing
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[75vh] text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 font-medium">
              {error}
            </div>
          )}

          {/* Species & Ownership Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-800 pb-1">Species</label>
              <select
                value={species}
                onChange={(e) => {
                  const s = e.target.value as Species;
                  setSpecies(s);
                  if (s === 'BUFFALO') setBreed('Murrah');
                  else setBreed('Sahiwal');
                }}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-stone-50 focus:bg-white"
              >
                <option value="BUFFALO">Buffalo (भैंस)</option>
                <option value="COW">Cow (गाय)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-800 pb-1">Ownership Model</label>
              <select
                value={ownershipType}
                onChange={(e) => setOwnershipType(e.target.value as OwnershipType)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-stone-50 focus:bg-white"
              >
                <option value="OWNED">Farm Owned Herd (स्वयं का)</option>
                <option value="BROKERAGE">Farmer Brokerage Listing (दलाली / मध्यस्थता)</option>
              </select>
            </div>
          </div>

          {/* If Brokerage: Select Farmer & Commission */}
          {ownershipType === 'BROKERAGE' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-amber-950 pb-1">Farmer / Seller Contact</label>
                <select
                  value={sellerContactId}
                  onChange={(e) => setSellerContactId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-amber-300 rounded-lg text-xs bg-white"
                  required
                >
                  <option value="">-- Select Registered Seller --</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.location}) - {c.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-amber-950 pb-1">Agreed Brokerage Fee (₹)</label>
                <input
                  type="number"
                  value={brokerageCommission}
                  onChange={(e) => setBrokerageCommission(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-amber-300 rounded-lg text-xs bg-white font-mono"
                  placeholder="1500"
                />
              </div>
            </div>
          )}

          {/* Breed, Tag, Age, Lactation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-stone-800 pb-1">Breed</label>
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-xs bg-stone-50"
              >
                {species === 'BUFFALO' ? (
                  <>
                    <option value="Murrah">Murrah (मुर्राह)</option>
                    <option value="Jaffarabadi Cross">Jaffarabadi Cross</option>
                    <option value="Nili Ravi">Nili Ravi</option>
                    <option value="Desi Buffalo">Local Desi Buffalo</option>
                  </>
                ) : (
                  <>
                    <option value="Sahiwal">Sahiwal (साहीवाल)</option>
                    <option value="Gir">Gir (गीर)</option>
                    <option value="Tharparkar">Tharparkar (थारपारकर)</option>
                    <option value="Rathi">Rathi (राठी)</option>
                    <option value="Holstein Friesian Cross">HF Cross Dairy</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-800 pb-1">Ear Tag / ID</label>
              <input
                type="text"
                value={tagNumber}
                onChange={(e) => setTagNumber(e.target.value)}
                className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-stone-800 pb-1">Age (Years)</label>
              <input
                type="number"
                step="0.5"
                value={ageYears}
                onChange={(e) => setAgeYears(Number(e.target.value))}
                className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-stone-800 pb-1">Lactation Stage</label>
              <select
                value={lactationNumber}
                onChange={(e) => setLactationNumber(Number(e.target.value))}
                className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-xs bg-stone-50"
              >
                <option value={1}>1st Calver (Heifer)</option>
                <option value={2}>2nd Lactation</option>
                <option value={3}>3rd Lactation</option>
                <option value={4}>4th Lactation</option>
              </select>
            </div>
          </div>

          {/* Reported Milk Yield & Calving */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-stone-800 pb-1">Verified Milk Yield (LPD)</label>
              <input
                type="number"
                step="0.5"
                value={reportedMilkYieldLpd}
                onChange={(e) => setReportedMilkYieldLpd(Number(e.target.value))}
                className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-800 pb-1">Calving History & Calf Details</label>
              <input
                type="text"
                value={calvingDetails}
                onChange={(e) => setCalvingDetails(e.target.value)}
                placeholder="e.g. Calved 15 days ago, female calf at foot"
                className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-stone-800">Public Listing Headline</label>
              <button
                type="button"
                onClick={handleAutoTitle}
                className="text-emerald-700 hover:underline text-[11px] font-semibold"
              >
                ⚡ Auto-Generate
              </button>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Prime 2nd Lactation Murrah Buffalo with Female Calf (17.5 LPD)"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-medium"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-stone-800 pb-1">Detailed Description & Temperament</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
              placeholder="Mention milk test, body structure, feeding habits, ease of milking..."
            />
          </div>

          {/* Pricing & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-stone-800 pb-1">Min Price (₹)</label>
              <input
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(Number(e.target.value))}
                className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-stone-800 pb-1">Max Price (₹)</label>
              <input
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-stone-800 pb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ListingStatus)}
                className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-xs bg-stone-50"
              >
                <option value="AVAILABLE">AVAILABLE (Public)</option>
                <option value="DRAFT">DRAFT (Internal)</option>
                <option value="RESERVED">RESERVED</option>
                <option value="SOLD">SOLD</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>

          {/* Health & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-800 pb-1">Veterinary / Health Status</label>
              <input
                type="text"
                value={healthNotes}
                onChange={(e) => setHealthNotes(e.target.value)}
                className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-800 pb-1">Inspection Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-stone-600 hover:bg-stone-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-[#142921] hover:bg-[#1E3A2F] text-amber-100 font-semibold shadow-xs"
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Listing' : 'Save & Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
