import React, { useState, useMemo } from 'react';
import { Animal, Species } from '../../types/domain';
import { BUSINESS_CONFIG } from '../../config/business';
import { AnimalCard } from '../../components/livestock/AnimalCard';
import { useLanguage } from '../../context/LanguageContext';

interface CattleCatalogPageProps {
  animals: Animal[];
  onSelectAnimal: (animal: Animal) => void;
  onNavigatePage: (page: string) => void;
  initialSpecies?: 'ALL' | Species;
  initialBreed?: string;
}

export const CattleCatalogPage: React.FC<CattleCatalogPageProps> = ({
  animals,
  onSelectAnimal,
  onNavigatePage,
  initialSpecies = 'ALL',
  initialBreed,
}) => {
  const { t, language } = useLanguage();

  // Filter States matching collage left sidebar
  const [selectedSpecies, setSelectedSpecies] = useState<'ALL' | Species>(initialSpecies);
  const [selectedBreed, setSelectedBreed] = useState<string>(initialBreed || 'ALL');
  const [maxPrice, setMaxPrice] = useState<number>(200000);
  const [minMilkYield, setMinMilkYield] = useState<number>(0);
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'PRICE_LOW' | 'PRICE_HIGH' | 'MILK_HIGH'>('NEWEST');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique breeds
  const availableBreeds = useMemo(() => {
    const set = new Set<string>();
    animals.forEach((a) => {
      if (a.breed) set.add(a.breed);
    });
    return Array.from(set);
  }, [animals]);

  // Locations for dropdown
  const locations = [
    { id: 'ALL', label: language === 'HI' ? 'सभी स्थान (All Locations)' : 'All Locations' },
    { id: 'Lar', label: 'Khardaha Nilkanth, Lar (Deoria)' },
    { id: 'Deoria', label: 'Deoria District (देवरिया)' },
    { id: 'Gorakhpur', label: 'Gorakhpur (गोरखपुर)' },
    { id: 'Lucknow', label: 'Lucknow Region (लखनऊ)' },
  ];

  // Filter and sort animals
  const filteredAndSortedAnimals = useMemo(() => {
    let result = animals.filter((a) => {
      if (a.listing.status === 'ARCHIVED' || a.listing.status === 'DRAFT') return false;

      // Species
      if (selectedSpecies !== 'ALL' && a.species !== selectedSpecies) return false;

      // Breed
      if (selectedBreed !== 'ALL' && a.breed.toLowerCase() !== selectedBreed.toLowerCase()) return false;

      // Price slider
      if (a.listing.priceMin > maxPrice) return false;

      // Milk yield
      if (minMilkYield > 0 && (a.reportedMilkYieldLpd || 0) < minMilkYield) return false;

      // Location
      if (selectedLocation !== 'ALL' && !a.listing.location.toLowerCase().includes(selectedLocation.toLowerCase())) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          a.id.toLowerCase().includes(q) ||
          a.tagNumber.toLowerCase().includes(q) ||
          a.breed.toLowerCase().includes(q) ||
          a.listing.title.toLowerCase().includes(q) ||
          a.listing.location.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'PRICE_LOW') return a.listing.priceMin - b.listing.priceMin;
      if (sortBy === 'PRICE_HIGH') return b.listing.priceMin - a.listing.priceMin;
      if (sortBy === 'MILK_HIGH') return (b.reportedMilkYieldLpd || 0) - (a.reportedMilkYieldLpd || 0);
      return b.id.localeCompare(a.id);
    });

    return result;
  }, [animals, selectedSpecies, selectedBreed, maxPrice, minMilkYield, selectedLocation, sortBy, searchQuery]);

  const handleQuickWhatsApp = (animal: Animal) => {
    const text = encodeURIComponent(
      `नमस्ते परमेश्वर जी! मुझे चम्पा डेयरी (लार, देवरिया) के पशु #${animal.id} (${animal.breed}, ${animal.reportedMilkYieldLpd || '—'} L/day) की जानकारी चाहिए।`
    );
    window.open(`https://wa.me/${BUSINESS_CONFIG.contacts.whatsapp}?text=${text}`, '_blank');
  };

  const handleClearFilters = () => {
    setSelectedSpecies('ALL');
    setSelectedBreed('ALL');
    setMaxPrice(200000);
    setMinMilkYield(0);
    setSelectedLocation('ALL');
    setSearchQuery('');
  };

  return (
    <div className="bg-[#FAF8F5] py-8 lg:py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header Matching Collage: "Our Animals - Healthy · High Yield · Best Price" */}
        <div className="bg-gradient-to-r from-[#0F241A] via-[#153828] to-[#0F241A] text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-2">
              <span>🐃 {t('प्रमाणित दुधारू पशु कैटलॉग', 'Verified Livestock Showroom')}</span>
              <span>•</span>
              <span>{t('लार, देवरिया फार्म', 'Lar, Deoria Stables')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {t('Our Animals — Healthy · High Yield · Best Price', 'Our Animals — Healthy · High Yield · Best Price')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl">
              {t(
                'खरदहा नीलकंठ फार्म पर लाइव उपलब्ध मुर्रा भैंस एवं देशी साहीवाल गाय। 2-टाइम दोहाई संतुष्टि एवं सुरक्षित गाड़ी ट्रांसपोर्ट।',
                'Browse verified cattle with transparent milk yields, age, and health records.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={() => onNavigatePage('BULK_ORDER')}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              📋 {t('बल्क में चाहिए? (5-20+)', 'Bulk Order for Farms')}
            </button>
          </div>
        </div>

        {/* Main 2-Column Catalog: Left Filter Sidebar + Right Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================= */}
          {/* LEFT SIDEBAR: Filter Search (Matching Collage)            */}
          {/* ========================================================= */}
          <aside className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5 sticky top-24">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>⚡</span>
                <span>{t('फ़िल्टर सर्च (Filters)', 'Filter Search')}</span>
              </h2>
              <button
                onClick={handleClearFilters}
                className="text-[11px] text-emerald-800 font-bold hover:underline"
              >
                {t('रीसेट', 'Reset')}
              </button>
            </div>

            {/* Keyword Search */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t('खोजें (Search Keyword)', 'Search Keyword')}
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('टैग, नस्ल या स्थान...', 'Tag, breed, location...')}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
              />
            </div>

            {/* Animal Type (Checkboxes / Radio) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                {t('पशु का प्रकार (Animal Type)', 'Animal Type')}
              </label>
              <div className="space-y-2 text-xs font-semibold text-slate-800">
                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="speciesFilter"
                      checked={selectedSpecies === 'ALL'}
                      onChange={() => setSelectedSpecies('ALL')}
                      className="accent-[#0F241A]"
                    />
                    <span>{t('सभी पशु', 'All Animals')}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">({animals.length})</span>
                </label>

                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="speciesFilter"
                      checked={selectedSpecies === 'BUFFALO'}
                      onChange={() => setSelectedSpecies('BUFFALO')}
                      className="accent-[#0F241A]"
                    />
                    <span>🐃 {t('भैंस (Buffalo)', 'Buffalo')}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">600+</span>
                </label>

                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="speciesFilter"
                      checked={selectedSpecies === 'COW'}
                      onChange={() => setSelectedSpecies('COW')}
                      className="accent-[#0F241A]"
                    />
                    <span>🐄 {t('गाय (Cow)', 'Cow')}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">350+</span>
                </label>
              </div>
            </div>

            {/* Breed Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t('नस्ल (Breed)', 'Breed')}
              </label>
              <select
                value={selectedBreed}
                onChange={(e) => setSelectedBreed(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-800 cursor-pointer"
              >
                <option value="ALL">{t('सभी नस्लें (All Breeds)', 'All Breeds')}</option>
                {availableBreeds.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Price Range Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>{t('मूल्य सीमा (Price Range)', 'Price Range')}</span>
                <span className="font-mono text-emerald-800">₹0 – ₹{maxPrice.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={50000}
                max={200000}
                step={5000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-emerald-800 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>₹50,000</span>
                <span>₹2,00,000</span>
              </div>
            </div>

            {/* Milk Yield Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t('न्यूनतम दूध क्षमता (Min Milk Yield)', 'Milk Yield')}
              </label>
              <select
                value={minMilkYield}
                onChange={(e) => setMinMilkYield(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-800 cursor-pointer"
              >
                <option value={0}>{t('कोई भी (Any Yield)', 'Any Yield')}</option>
                <option value={12}>12+ {t('लीटर/दिन', 'L/Day')}</option>
                <option value={15}>15+ {t('लीटर/दिन', 'L/Day')}</option>
                <option value={18}>18+ {t('लीटर/दिन (उच्च दुधारू)', 'L/Day (Peak)')}</option>
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t('स्थान (Location)', 'Location')}
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-800 cursor-pointer"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.label}</option>
                ))}
              </select>
            </div>

            {/* Direct Owner Assistance Strip */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1">
              <span className="font-bold text-emerald-950 block">💡 {t('विशेष व्यवस्था:', 'Custom Request:')}</span>
              <p className="text-emerald-900 text-[11px] leading-relaxed">
                {t('मनपसंद ब्यात या दूध क्षमता का पशु चाहिए तो सीधे संपर्क करें — ग्राहक को जो चाहिए सब मिलेगा।', 'Need specific pedigree or lactation? We procure any requested cattle promptly.')}
              </p>
            </div>

          </aside>

          {/* ========================================================= */}
          {/* RIGHT CONTENT: Showing X of 950 animals + Cards Grid     */}
          {/* ========================================================= */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Top Toolbar matching collage */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-700">
                  {t(
                    `कुल 950 में से 1-${filteredAndSortedAnimals.length} पशु प्रदर्शित`,
                    `Showing 1-${filteredAndSortedAnimals.length} of 950 animals`
                  )}
                </span>
                <span className="text-[11px] text-emerald-800 font-semibold block mt-0.5">
                  ✓ {t('सभी पशु ऑन-फार्म दोहाई जांच के लिए उपलब्ध', 'All animals ready for live milking test')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">{t('क्रमबद्ध (Sort by):', 'Sort by:')}</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-800 cursor-pointer"
                >
                  <option value="NEWEST">{t('नवीनतम पहले (Newest First)', 'Newest First')}</option>
                  <option value="MILK_HIGH">{t('ज्यादा दूध पहले (Highest Milk)', 'Highest Milk')}</option>
                  <option value="PRICE_LOW">{t('कम कीमत पहले (Price: Low to High)', 'Price: Low to High')}</option>
                  <option value="PRICE_HIGH">{t('अधिक कीमत पहले (Price: High to Low)', 'Price: High to Low')}</option>
                </select>
              </div>
            </div>

            {/* Cattle Cards Grid */}
            {filteredAndSortedAnimals.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-2xs">
                <div className="text-4xl">🔍</div>
                <h3 className="text-base font-bold text-slate-800">
                  {t('कोई पशु रिकॉर्ड नहीं मिला', 'No cattle listings matched your criteria')}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {t('हमारे पास निरंतर नए पशु आते रहते हैं। अपनी पसंद बताने के लिए सीधे परमेश्वर जी को कॉल करें।', 'We regularly bring fresh milch cattle from trusted breeders. Call us directly for custom orders.')}
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-[#0F241A] text-amber-300 rounded-xl font-bold text-xs hover:bg-[#1C3B2D] transition-colors"
                >
                  {t('फ़िल्टर रीसेट करें', 'Reset Filters')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedAnimals.map((animal) => (
                  <AnimalCard
                    key={animal.id}
                    animal={animal}
                    onSelect={onSelectAnimal}
                    onQuickWhatsApp={handleQuickWhatsApp}
                  />
                ))}
              </div>
            )}

            {/* Bottom Guarantee Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-xl">🏆</span>
                <div>
                  <strong className="text-amber-950 font-bold block">
                    {t('दादी चम्पा फार्म की दूध गारंटी', 'Dadi Champa Farm Pail Verification Guarantee')}
                  </strong>
                  <span className="text-amber-900">
                    {t('सौदा पक्का करने से पहले दोनों वक्त अपनी आंखों के सामने दोहाई करें।', 'Verify morning and evening milk yield in clean stainless bucket before handover.')}
                  </span>
                </div>
              </div>

              <a
                href={`tel:${BUSINESS_CONFIG.contacts.phone}`}
                className="px-4 py-2 bg-[#0F241A] hover:bg-[#1E3B2D] text-amber-300 font-bold rounded-xl whitespace-nowrap shadow-xs transition-colors shrink-0"
              >
                📞 {t('हेल्पलाइन: 9792820684', 'Helpline: 9792820684')}
              </a>
            </div>

          </main>

        </div>

      </div>
    </div>
  );
};
