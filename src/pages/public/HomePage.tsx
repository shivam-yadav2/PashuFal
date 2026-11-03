import React, { useState, useEffect } from 'react';
import { Animal, Species } from '../../types/domain';
import { BUSINESS_CONFIG } from '../../config/business';
import { AnimalCard } from '../../components/livestock/AnimalCard';
import { useLanguage } from '../../context/LanguageContext';

interface HomePageProps {
  animals: Animal[];
  onSelectAnimal: (animal: Animal) => void;
  onNavigatePage: (page: string) => void;
  onFilterCategory?: (species: 'ALL' | Species, breed?: string) => void;
}

interface HeroSlide {
  id: string;
  eyebrowEn: string;
  eyebrowHi: string;
  headlineEn: string;
  headlineHi: string;
  subtextEn: string;
  subtextHi: string;
  bgImage: string;
  badge: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'murrah-breeding',
    eyebrowEn: 'PREMIUM MURRAH BREEDING',
    eyebrowHi: 'उत्कृष्ट मुर्राह नस्ल प्रजनन',
    headlineEn: 'SUPERIOR GENETICS. UNCOMPROMISED DAIRY YIELD.',
    headlineHi: 'श्रेष्ठ नस्ल सुधार। प्रमाणित उच्च दुग्ध उत्पादन।',
    subtextEn: 'Purebred, verified Murrah buffaloes with 14–22+ Litres daily milking capacity, certified veterinary clearance, and door-to-door transit across Deoria, Gorakhpur, and all Purvanchal.',
    subtextHi: 'दादी चम्पा के 25+ वर्ष के विश्वास के साथ 14 से 22+ लीटर दुग्ध क्षमता वाली शुद्ध मुर्राह भैंसें, दोहाई जांच व सुरक्षित वाहन डिलीवरी।',
    bgImage: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=2000&q=85',
    badge: '14–22+ LPD Yield',
  },
  {
    id: 'live-dohai',
    eyebrowEn: '100% TRANSPARENT DOHAI',
    eyebrowHi: 'शत-प्रतिशत पारदर्शी दोहाई',
    headlineEn: 'MILK TESTED IN FRONT OF YOUR EYES.',
    headlineHi: 'अपनी आंखों के सामने दो वक्त की दोहाई जांच।',
    subtextEn: 'Experience morning and evening live pail milking at our Khardaha Nilkanth, Lar farm before confirming your booking. Complete peace of mind guaranteed.',
    subtextHi: 'खरदहा नीलकंठ (लार, देवरिया) फार्म पर सुबह एवं शाम स्वयं बाल्टी में दूध नापें और पूर्ण संतुष्ट होने के बाद ही सौदा पक्का करें।',
    bgImage: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=2000&q=85',
    badge: '2-Time Dohai Test',
  },
  {
    id: 'safe-transit',
    eyebrowEn: 'DOORSTEP LIVESTOCK LOGISTICS',
    eyebrowHi: 'सुरक्षित पशु परिवहन सुविधा',
    headlineEn: 'SAFE DOORSTEP TRANSIT ACROSS UP & BIHAR.',
    headlineHi: 'देवरिया, गोरखपुर एवं पूरे पूर्वांचल में सुरक्षित डिलीवरी।',
    subtextEn: 'Specialized straw-bedded vehicles equipped with veterinary transit fitness certificates, experienced animal handlers, and water/fodder care.',
    subtextHi: 'सरकारी पशु अस्पताल फिटनेस प्रमाणपत्र, पुआल-युक्त सुरक्षित वाहन और अनुभवी सहायकों के साथ सीधे आपके खूंटे तक डिलीवरी।',
    bgImage: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=2000&q=85',
    badge: 'Doorstep Transit',
  },
];

export const HomePage: React.FC<HomePageProps> = ({
  animals,
  onSelectAnimal,
  onNavigatePage,
  onFilterCategory,
}) => {
  const { t, language } = useLanguage();

  // Carousel State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Auto-advance carousel slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const currentSlide = HERO_SLIDES[currentSlideIndex];

  // Search Bar State
  const [searchQuery, setSearchQuery] = useState('');

  // Hero Quick Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRequirement, setFormRequirement] = useState<'BUFFALO' | 'COW' | 'BULK'>('BUFFALO');
  const [formArea, setFormArea] = useState('देवरिया (Deoria)');
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);

  const handleHeroFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPhone.trim()) return;

    const reqLabel = formRequirement === 'BUFFALO'
      ? (language === 'HI' ? 'उच्च दुधारू मुर्राह भैंस' : 'High Milking Murrah Buffalo')
      : formRequirement === 'COW'
      ? (language === 'HI' ? 'दुधारू देशी/साहीवाल गाय' : 'Milch Dairy Cow')
      : (language === 'HI' ? 'डेयरी फार्म बल्क ऑर्डर (5-20+ पशु)' : 'Bulk Farm Order (5-20+ animals)');

    const text = encodeURIComponent(
      `नमस्ते परमेश्वर कुशवाहा जी (चम्पा डेयरी एवं पशु केंद्र, लार, देवरिया)!\n` +
      `मेरा नाम: ${formName || 'ग्राहक'}\n` +
      `फोन: ${formPhone}\n` +
      `जरूरत: ${reqLabel}\n` +
      `डिलीवरी क्षेत्र: ${formArea}\n\n` +
      `कृपया वर्तमान में उपलब्ध पशुओं के फोटो, वीडियो और दोहाई रिपोर्ट भेजें।`
    );

    window.open(`https://wa.me/${BUSINESS_CONFIG.contacts.whatsapp}?text=${text}`, '_blank');
    setShowEnquiryModal(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigatePage('ANIMALS');
  };

  const openWhatsAppHelp = () => {
    const text = encodeURIComponent(
      `नमस्ते! मुझे चम्पा डेयरी (लार, देवरिया) से उपलब्ध मुर्राह भैंस और गाय की सूची चाहिए।`
    );
    window.open(`https://wa.me/${BUSINESS_CONFIG.contacts.whatsapp}?text=${text}`, '_blank');
  };

  const handleQuickWhatsApp = (animal: Animal) => {
    const text = encodeURIComponent(
      `नमस्ते! मुझे पशु #${animal.id} (${animal.breed}, ${animal.reportedMilkYieldLpd || '—'} L/day) की जानकारी चाहिए।`
    );
    window.open(`https://wa.me/${BUSINESS_CONFIG.contacts.whatsapp}?text=${text}`, '_blank');
  };

  // Top featured animals (up to 4)
  const featuredAnimals = animals.slice(0, 4);

  return (
    <div className="space-y-12 lg:space-y-16 pb-16">
      
      {/* ========================================================================= */}
      {/* 1. CINEMATIC HERO SECTION: Inspired by Dairy Farm Reference Image         */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-[#0A1A12] text-white">
        
        {/* Carousel Background Image Layer with Gradient Overlays */}
        <div className="absolute inset-0 z-0">
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentSlideIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.bgImage}
                alt={slide.headlineEn}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-10000 ease-out"
              />
              {/* Deep emerald cinematic multi-stop darkening scrim for ultra-crisp typography */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#061B12]/95 via-[#0A2619]/80 to-[#0A2619]/40 sm:to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A12] via-transparent to-black/30" />
            </div>
          ))}
        </div>

        {/* Carousel Navigation Arrow: Left (<) */}
        <button
          onClick={handlePrevSlide}
          aria-label="Previous slide"
          className="absolute left-3 sm:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full border border-white/30 bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg group cursor-pointer"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:text-amber-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Carousel Navigation Arrow: Right (>) */}
        <button
          onClick={handleNextSlide}
          aria-label="Next slide"
          className="absolute right-3 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full border border-white/30 bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg group cursor-pointer"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:text-amber-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Hero Content Container */}
        <div className="max-w-7xl mx-auto relative z-10 px-6 sm:px-12 lg:px-16 pt-16 sm:pt-24 lg:pt-28 pb-28 sm:pb-36 lg:pb-40">
          <div className="max-w-2xl lg:max-w-3xl space-y-5 sm:space-y-6">
            
            {/* Eyebrow Tagline in Amber-300 */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-amber-300/40 backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-300 text-xs sm:text-sm font-extrabold tracking-widest uppercase">
                {language === 'HI' ? currentSlide.eyebrowHi : currentSlide.eyebrowEn}
              </span>
            </div>

            {/* Bold Single-Sentence Value Proposition */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-[1.1] text-white drop-shadow-md">
              {language === 'HI' ? currentSlide.headlineHi : currentSlide.headlineEn}
            </h1>

            {/* Subtitle / Concise Descriptive Value */}
            <p className="text-slate-200 text-sm sm:text-base lg:text-lg font-medium leading-relaxed max-w-2xl drop-shadow-sm">
              {language === 'HI' ? currentSlide.subtextHi : currentSlide.subtextEn}
            </p>

            {/* Call To Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              
              {/* Prominent CTA: Browse Cattle (Theme: emerald-900 & amber-300) */}
              <button
                onClick={() => onNavigatePage('ANIMALS')}
                className="bg-amber-300 hover:bg-amber-400 text-emerald-950 font-black px-7 sm:px-9 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 text-sm sm:text-base flex items-center gap-2.5 group cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>{t('पशु कैटलॉग देखें (Browse Cattle)', 'Browse Cattle')}</span>
                <svg
                  className="w-5 h-5 text-emerald-950 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              {/* Secondary CTA: Quick Farm Enquiry */}
              <button
                onClick={() => setShowEnquiryModal(true)}
                className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border border-white/25 backdrop-blur-md transition-all duration-200 text-sm sm:text-base flex items-center gap-2 cursor-pointer"
              >
                <span>💬</span>
                <span>{t('त्वरित पूछताछ (Quick Enquiry)', 'Quick Enquiry')}</span>
              </button>

              {/* Direct Owner Phone Badge */}
              <a
                href={`tel:${BUSINESS_CONFIG.contacts.phone}`}
                className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-amber-200/90 hover:text-white px-3 py-2 rounded-xl bg-black/30 backdrop-blur-xs border border-white/10 transition-colors"
              >
                <span>📞</span>
                <span>{BUSINESS_CONFIG.contacts.phone}</span>
              </a>

            </div>

            {/* Carousel Slide Dots Indicator */}
            <div className="flex items-center gap-2 pt-4">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentSlideIndex
                      ? 'w-8 bg-amber-300 shadow-xs'
                      : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* Organic Flowing Milk Splash / Wave Divider (Matches Reference Image)      */}
        {/* ========================================================================= */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none overflow-hidden leading-none">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-16 sm:h-24 lg:h-32 text-slate-50 preserve-3d"
            preserveAspectRatio="none"
          >
            {/* Splash Droplets / Drops left & right */}
            <path
              d="M70,55 C65,40 85,25 90,45 C95,65 75,70 70,55 Z"
              fill="#ffffff"
              opacity="0.85"
            />
            <path
              d="M1380,45 C1375,30 1395,20 1400,40 C1405,60 1385,60 1380,45 Z"
              fill="#ffffff"
              opacity="0.85"
            />
            <path
              d="M1420,60 C1415,50 1430,40 1435,55 C1440,70 1425,70 1420,60 Z"
              fill="#ffffff"
              opacity="0.75"
            />

            {/* Back Wave (Milky Cream Foam) */}
            <path
              d="M0,60 C180,95 380,35 560,75 C740,115 920,45 1100,85 C1260,115 1370,50 1440,65 L1440,120 L0,120 Z"
              fill="#f1f5f9"
              opacity="0.7"
            />

            {/* Front Crisp Milk Wave */}
            <path
              d="M0,75 C160,105 340,45 520,80 C700,115 880,50 1060,90 C1220,120 1340,65 1440,75 L1440,120 L0,120 Z"
              fill="#f8fafc"
            />
          </svg>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 2. FLOATING 3-CARD HIGHLIGHT BAR: Over the Milk Wave (Matches Reference)   */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 lg:-mt-24 relative z-20">
        <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-emerald-950 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 shadow-2xl border-2 border-amber-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 divide-y md:divide-y-0 md:divide-x divide-emerald-950/15">
            
            {/* Highlight 1: Certified Murrah Breeding */}
            <div className="flex items-center gap-4 pt-2 md:pt-0">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-emerald-950 text-amber-300 flex items-center justify-center shrink-0 shadow-md">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-black tracking-tight text-emerald-950">
                  {t('100% प्रमाणित मुर्राह नस्ल', 'Certified Murrah Genetics')}
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-emerald-900/85 leading-snug">
                  {t('शुद्ध रिंग सींग, भारी कद-काठी एवं वंशावली जांच', 'Pure pedigree, curled horns & 14-22+ LPD verified')}
                </p>
              </div>
            </div>

            {/* Highlight 2: 2-Time Live Dohai */}
            <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-6">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-emerald-950 text-amber-300 flex items-center justify-center shrink-0 shadow-md">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-black tracking-tight text-emerald-950">
                  {t('2-टाइम ऑन-फार्म दोहाई', '2-Time Live Dohai')}
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-emerald-900/85 leading-snug">
                  {t('सुबह व शाम अपनी आंखों के सामने बाल्टी में नापें', 'Morning & evening pail milking before token')}
                </p>
              </div>
            </div>

            {/* Highlight 3: Safe Cattle Transit */}
            <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-6">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-emerald-950 text-amber-300 flex items-center justify-center shrink-0 shadow-md">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-black tracking-tight text-emerald-950">
                  {t('सुरक्षित पशु परिवहन', 'Safe Doorstep Transit')}
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-emerald-900/85 leading-snug">
                  {t('पुआल-युक्त वाहन व सरकारी डॉक्टर फिटनेस पर्चा', 'Straw-bedded carrier across Deoria, GKP & UP')}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. QUICK SEARCH & FARM DIRECT CONTACT BAR                                 */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Integrated Search Bar */}
          <form onSubmit={handleSearchSubmit} className="w-full md:max-w-xl">
            <div className="bg-slate-50 rounded-2xl p-1.5 flex items-center gap-2 border border-slate-300 focus-within:border-emerald-700 transition-colors">
              <span className="text-slate-400 pl-3">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('मुर्राह भैंस, साहीवाल गाय, दूध क्षमता या बजट से खोजें...', 'Search Murrah buffalo, Sahiwal cow, milk yield or budget...')}
                className="flex-1 bg-transparent text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none py-2"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-900 hover:bg-emerald-950 text-amber-300 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
              >
                {t('खोजें', 'Search')}
              </button>
            </div>
          </form>

          {/* Quick Direct Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={() => setShowEnquiryModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-bold text-xs border border-emerald-200 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>📝</span>
              <span>{t('कस्टम मांग दर्ज करें', 'Request Specific Cattle')}</span>
            </button>
            <button
              onClick={openWhatsAppHelp}
              className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>💬</span>
              <span>WhatsApp</span>
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CATEGORY CARDS (Browse by Breed)                                       */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t('प्रमुख नस्लें व श्रेणियां', 'Browse by Cattle Category')}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {t('दादी चम्पा फार्म की सर्वाधिक मांग वाली दुधारू नस्लें', 'Top milking breeds verified at our Lar, Deoria stables')}
            </p>
          </div>
          <button
            onClick={() => onNavigatePage('ANIMALS')}
            className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{t('सभी पशु देखें', 'View All Animals')}</span>
            <span>→</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 sm:gap-4">
          
          {/* 1. Murrah Buffalo (Featured First) */}
          <div
            onClick={() => {
              if (onFilterCategory) onFilterCategory('BUFFALO');
              onNavigatePage('ANIMALS');
            }}
            className="bg-white p-4 rounded-2xl border-2 border-emerald-900/30 hover:border-emerald-700 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 bg-amber-400 text-emerald-950 text-[9px] font-black px-1.5 py-0.5 rounded">
              TOP PICK
            </div>
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 text-amber-300 flex items-center justify-center font-bold text-lg mb-2">
                🐃
              </div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-emerald-900">
                {t('मुर्राह / भारी भैंस', 'Murrah Buffalo')}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">600+ Available</p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-800">
              <span>{t('देखें', 'View All')}</span>
              <span>→</span>
            </div>
          </div>

          {/* 2. Desi Cow */}
          <div
            onClick={() => {
              if (onFilterCategory) onFilterCategory('COW', 'Desi');
              onNavigatePage('ANIMALS');
            }}
            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-700 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-950 flex items-center justify-center font-bold text-lg mb-2">
                🐄
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-900">
                {t('देशी गाय (Desi Cow)', 'Desi Cow')}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">450+ Available</p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-800">
              <span>{t('देखें', 'View All')}</span>
              <span>→</span>
            </div>
          </div>

          {/* 3. HF Cow */}
          <div
            onClick={() => {
              if (onFilterCategory) onFilterCategory('COW', 'HF');
              onNavigatePage('ANIMALS');
            }}
            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-700 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-950 flex items-center justify-center font-bold text-lg mb-2">
                🥛
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-900">
                {t('HF क्रॉस गाय (HF Cow)', 'HF Cow')}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">300+ Available</p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-800">
              <span>{t('देखें', 'View All')}</span>
              <span>→</span>
            </div>
          </div>

          {/* 4. Sahiwal Cow */}
          <div
            onClick={() => {
              if (onFilterCategory) onFilterCategory('COW', 'Sahiwal');
              onNavigatePage('ANIMALS');
            }}
            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-700 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-950 flex items-center justify-center font-bold text-lg mb-2">
                ⭐
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-900">
                {t('साहीवाल गाय (Sahiwal)', 'Sahiwal Cow')}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">200+ Available</p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-800">
              <span>{t('देखें', 'View All')}</span>
              <span>→</span>
            </div>
          </div>

          {/* 5. Bulk Order for Dairy Farms */}
          <div
            onClick={() => onNavigatePage('BULK_ORDER')}
            className="col-span-2 md:col-span-1 bg-gradient-to-br from-[#0F241A] to-[#1E3F30] text-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-lg mb-2">
                🏢
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-amber-300">
                {t('बल्क डेयरी ऑर्डर', 'Bulk Order')}
              </h3>
              <p className="text-[11px] text-slate-200 font-medium">5, 10, 20+ पशु एक साथ</p>
            </div>
            <div className="pt-3 mt-3 border-t border-white/20 flex items-center justify-between text-[11px] font-bold text-amber-300">
              <span>{t('कोटेशन लें', 'Contact Now')}</span>
              <span>→</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FEATURED LIVE CATTLE CARDS                                             */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              {t('ताजा ब्यांत व दुधारू पशु', 'Fresh Peak Lactation Stock')}
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {t('प्रमाणित पशु कैटलॉग (Featured Animals)', 'Featured Animals')}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {t('दोहाई जांच व पशु चिकित्सक फिटनेस सहित लार फार्म पर तैयार', 'Two-time Dohai pail tested at Lar, Deoria farm')}
            </p>
          </div>
          <button
            onClick={() => onNavigatePage('ANIMALS')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            {t('सभी 950 पशु देखें →', 'View All 950 Animals →')}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredAnimals.map((animal) => (
            <AnimalCard
              key={animal.id}
              animal={animal}
              onSelect={onSelectAnimal}
              onQuickWhatsApp={handleQuickWhatsApp}
            />
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. HOW IT WORKS (4-Step Transparent Protocol)                             */}
      {/* ========================================================================= */}
      <section className="bg-white border-y border-slate-200 py-12 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              {t('पारदर्शी खरीद प्रक्रिया', 'How It Works')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {t('पशु निरीक्षण एवं दोहाई जांच प्रक्रिया', 'Live Inspection & 2-Time Dohai Protocol')}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {t('पारदर्शिता और विश्वास के 4 चरण — कोई छुपा खर्च नहीं', '4 transparent steps developed over 25 years in Purvanchal')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-8 h-8 rounded-full bg-[#0F241A] text-amber-300 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                {t('ऑनलाइन पसंद करें', 'Online Discovery')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('वेबसाइट पर पशु की उम्र, ब्यात, दूध क्षमता व फोटो देखें और WhatsApp पर वीडियो कॉल करें।', 'Browse verified milk records and request live video tour on WhatsApp.')}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-8 h-8 rounded-full bg-[#0F241A] text-amber-300 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                {t('फार्म विजिट व पहचान', 'Farm Physical Visit')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('खरदहा नीलकंठ (लार, देवरिया) फार्म पर पधारें। पशु के पैर, थन व चाल-ढाल की जांच करें।', 'Visit our Lar stables to physically inspect udder symmetry, teeth age and gait.')}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-8 h-8 rounded-full bg-[#0F241A] text-amber-300 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                {t('2-टाइम दोहाई जांच', 'Two-Time Dohai Test')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('सुबह व शाम दोनों वक्त अपनी आंखों के सामने साफ बाल्टी में दूध नापकर संतुष्ट हों।', 'Measure actual milk yield with pail test in morning and evening before paying balance.')}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-8 h-8 rounded-full bg-[#0F241A] text-amber-300 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                {t('फिटनेस व सुरक्षित डिलीवरी', 'Vet Transit & Handover')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('सरकारी पशु अस्पताल (लार) का फिटनेस पर्चा, पुआल वाली गाड़ी और घर तक सुरक्षित डिलीवरी।', 'Govt vet fitness clearance, straw-bedded vehicle, and delivery to your doorstep.')}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. COMMERCIAL BULK ORDER CALLOUT BANNER                                   */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="bg-gradient-to-r from-[#0F241A] via-[#143324] to-[#0F241A] text-white rounded-3xl p-8 lg:p-12 shadow-xl border border-emerald-950 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
              {t('कमर्शियल डेयरी फार्म विशेष सेवा', 'Commercial Dairy Supply')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {t('5, 10, 20 या 50+ दुधारू पशुओं की एकमुश्त आपूर्ति', 'Bulk Cattle Supply for Modern Dairy Farms')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
              {t(
                'पूरे उत्तर प्रदेश और बिहार के डेयरी फार्मों के लिए विशेष रियायती दर, 14-ft अथवा 22-ft कंटेनर ट्रांसपोर्ट, और पशुपालक के साथ अनुबंध सुविधा।',
                'Volume pricing tiers, specialized container transport with water troughs, and repeat order facilities.'
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={() => onNavigatePage('BULK_ORDER')}
              className="px-6 py-3.5 bg-amber-300 hover:bg-amber-400 text-emerald-950 font-black text-xs rounded-xl shadow-md transition-colors text-center cursor-pointer"
            >
              📋 {t('बल्क आर्डर फॉर्म भरें', 'Open Bulk Order Form')}
            </button>
            <button
              onClick={openWhatsAppHelp}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors text-center cursor-pointer"
            >
              💬 {t('व्हाट्सएप पर बात करें', 'Direct WhatsApp')}
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* QUICK ENQUIRY MODAL: Accessible from Hero & Quick Bar                     */}
      {/* ========================================================================= */}
      {showEnquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {t('त्वरित पशु व दूध पूछताछ', 'Quick Livestock Enquiry')}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {t('सीधे परमेश्वर कुशवाहा से WhatsApp पर जुड़ें', 'Direct connection with farm owner')}
                </p>
              </div>
              <button
                onClick={() => setShowEnquiryModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleHeroFormSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {t('आपका नाम (Your Name) *', 'Your Name *')}
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={t('उदा. अरुण कुमार', 'e.g. Arun Kumar')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {t('मोबाइल नंबर (WhatsApp Number) *', 'Mobile Number *')}
                </label>
                <input
                  type="tel"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="97928XXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {t('पशु का प्रकार (Requirement)', 'Requirement')}
                </label>
                <div className="grid grid-cols-3 gap-1.5 font-bold">
                  <button
                    type="button"
                    onClick={() => setFormRequirement('BUFFALO')}
                    className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                      formRequirement === 'BUFFALO'
                        ? 'bg-emerald-950 text-amber-300 border-emerald-950 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {t('भैंस (Buffalo)', 'Buffalo')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormRequirement('COW')}
                    className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                      formRequirement === 'COW'
                        ? 'bg-emerald-950 text-amber-300 border-emerald-950 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {t('गाय (Cow)', 'Cow')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormRequirement('BULK')}
                    className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                      formRequirement === 'BULK'
                        ? 'bg-emerald-950 text-amber-300 border-emerald-950 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {t('बल्क (5-20+)', 'Bulk')}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {t('डिलीवरी क्षेत्र (Delivery Location)', 'Delivery Area')}
                </label>
                <select
                  value={formArea}
                  onChange={(e) => setFormArea(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-800 cursor-pointer"
                >
                  <option value="लार व सलेमपुर (Lar / Salempur)">लार व सलेमपुर (Lar / Salempur)</option>
                  <option value="संपूर्ण देवरिया जिला (Whole Deoria)">संपूर्ण देवरिया जिला (Whole Deoria)</option>
                  <option value="गोरखपुर महानगर (Gorakhpur)">गोरखपुर महानगर (Gorakhpur)</option>
                  <option value="कुशीनगर व अन्य पूर्वांचल">कुशीनगर व अन्य पूर्वांचल (East UP)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-amber-300 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                <span>💬</span>
                <span>{t('व्हाट्सएप पर फोटो व कीमत मंगवाएं', 'Send Enquiry on WhatsApp')}</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
