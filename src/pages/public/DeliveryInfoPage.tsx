import React, { useState } from 'react';
import { BUSINESS_CONFIG } from '../../config/business';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

interface DeliveryInfoPageProps {
  onNavigateBulkOrder?: () => void;
}

export const DeliveryInfoPage: React.FC<DeliveryInfoPageProps> = ({ onNavigateBulkOrder }) => {
  const { t, language } = useLanguage();

  const [quoteForm, setQuoteForm] = useState({
    name: '',
    phone: '',
    fromLocation: 'Khardaha Nilkanth, Lar, Deoria (Farm Stables)',
    toLocation: '',
    pincode: '',
    animalCount: '2',
    vehicleType: 'BOLERO_MAXI',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // PIN Code Distance Estimator
  const [pinLookup, setPinLookup] = useState('');
  const [pinEstimate, setPinEstimate] = useState<{
    zone: string;
    distanceKm: number;
    approxDuration: string;
    pickupFare: number;
    eicherFare: number;
  } | null>(null);

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = pinLookup.trim();
    if (!pin) return;

    // Smart logic for UP/Bihar PIN codes
    if (pin.startsWith('274')) {
      // Deoria district
      setPinEstimate({
        zone: 'देवरिया जिला (Home Territory - Deoria)',
        distanceKm: 25,
        approxDuration: '1 - 2 घंटे (1-2 Hours)',
        pickupFare: 1500,
        eicherFare: 3500,
      });
    } else if (pin.startsWith('273')) {
      // Gorakhpur district
      setPinEstimate({
        zone: 'गोरखपुर महानगर व सीमांत (Gorakhpur District)',
        distanceKm: 65,
        approxDuration: '2 - 3 घंटे (2-3 Hours)',
        pickupFare: 3000,
        eicherFare: 6500,
      });
    } else if (pin.startsWith('2743') || pin.startsWith('2744')) {
      // Kushinagar
      setPinEstimate({
        zone: 'कुशीनगर (Kushinagar Region)',
        distanceKm: 55,
        approxDuration: '2 घंटे (2 Hours)',
        pickupFare: 2800,
        eicherFare: 6000,
      });
    } else if (pin.startsWith('841')) {
      // Siwan / Gopalganj (Bihar border)
      setPinEstimate({
        zone: 'बिहार सीमांत (Siwan / Gopalganj Border)',
        distanceKm: 45,
        approxDuration: '1.5 घंटे (1.5 Hours)',
        pickupFare: 2400,
        eicherFare: 5500,
      });
    } else {
      // General UP / Inter-state
      setPinEstimate({
        zone: 'पूर्वांचल व उत्तर प्रदेश (Regional Transit)',
        distanceKm: 180,
        approxDuration: '5 - 6 घंटे (5-6 Hours)',
        pickupFare: 6500,
        eicherFare: 14000,
      });
    }
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteForm.name || !quoteForm.phone || !quoteForm.toLocation) return;
    setLoading(true);
    try {
      await api.createEnquiry({
        customerName: quoteForm.name,
        phone: quoteForm.phone,
        enquiryType: 'TRANSPORT_INQUIRY',
        animalType: 'ANY',
        requestedQuantity: parseInt(quoteForm.animalCount, 10) || 1,
        deliveryLocation: `${quoteForm.toLocation} (PIN: ${quoteForm.pincode || '274502'})`,
        additionalInstructions: `गाड़ी भाड़ा पूछताछ: ${quoteForm.vehicleType} (${quoteForm.animalCount} पशु)। ${quoteForm.notes}`,
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF8F5] py-8 lg:py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Banner */}
        <div className="bg-[#0F241A] text-white rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-3">
            <span>🚚 {t('सुरक्षित पशु परिवहन सेवा', 'Safe Animal Transportation')}</span>
            <span>•</span>
            <span>{t('देवरिया, गोरखपुर एवं संपूर्ण उ.प्र.', 'Deoria, Gorakhpur & UP')}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            {t('Safe Animal Transportation', 'Safe Animal Transportation')}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
            {t(
              'दादी चम्पा फार्म (लार, देवरिया) से आपके द्वार तक सुरक्षित, तनावमुक्त यात्रा। पुआल की मोटी बिछाली, ताजा चारा-पानी, पशु चिकित्सक का फिटनेस प्रमाण पत्र (Form 88/89) एवं समर्पित ग्वाला-अटेंडेंट।',
              'Doorstep cattle transit with soft straw bedding, water breaks, certified livestock permits, and trained handlers.'
            )}
          </p>

          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-4 text-xs font-medium text-amber-200">
            <div className="flex items-center gap-1.5">
              <span>✓</span>
              <span>{t('विशेष बोलेरो, 14-ft केंटर व 22-ft कंटेनर', 'Bolero, 14-ft Eicher & 22-ft Container')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>✓</span>
              <span>{t('पशु परिवहन परमिट (पशु परिवहन पत्र CMVR 88/89)', 'Transit Permits & Form 88/89')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>✓</span>
              <span>{t('सरकारी पशु अस्पताल (लार) फिटनेस प्रमाण पत्र', 'Govt Vet Fitness Certificate')}</span>
            </div>
          </div>
        </div>

        {/* PIN Code Delivery & Fare Estimator */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {t('पिन कोड डिलीवरी व भाड़ा कैलकुलेटर', 'PIN Code Delivery & Freight Calculator')}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {t('अपने क्षेत्र का 6-अंकीय पिन कोड दर्ज कर अनुमानित समय व वाहन खर्च जानें', 'Enter your delivery PIN code to estimate transit duration and freight')}
              </p>
            </div>
            <span className="text-2xl">🗺️</span>
          </div>

          <form onSubmit={handleCheckPincode} className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              maxLength={6}
              value={pinLookup}
              onChange={(e) => setPinLookup(e.target.value)}
              placeholder={t('पिन कोड दर्ज करें (उदा. 274502 / 273001)', 'Enter PIN (e.g. 274502 / 273001)')}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-800 w-64"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#0F241A] hover:bg-[#1E3B2D] text-amber-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              {t('भाड़ा जांचें', 'Calculate Freight')}
            </button>
          </form>

          {pinEstimate && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs animate-in fade-in">
              <div>
                <span className="text-slate-500 text-[10px] block font-semibold">{t('क्षेत्रीय क्षेत्र (Zone):', 'Zone:')}</span>
                <strong className="text-slate-900 font-bold">{pinEstimate.zone}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block font-semibold">{t('अनुमानित दूरी व समय:', 'Distance & Time:')}</span>
                <strong className="text-emerald-950 font-bold">~{pinEstimate.distanceKm} km ({pinEstimate.approxDuration})</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block font-semibold">{t('पिकअप वाहन भाड़ा (1-2 पशु):', 'Pickup Fare (1-2 cattle):')}</span>
                <strong className="text-slate-900 font-mono font-black">₹{pinEstimate.pickupFare.toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block font-semibold">{t('14-ft केंटर भाड़ा (4-6 पशु):', '14ft Eicher (4-6 cattle):')}</span>
                <strong className="text-slate-900 font-mono font-black">₹{pinEstimate.eicherFare.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          )}
        </div>

        {/* 3 Vehicle Types Matching Collage */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {t('उपलब्ध परिवहन वाहन विकल्प (Vehicle Fleet)', 'Transport Vehicle Fleet')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Vehicle 1 */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xl mb-3">
                  🛻
                </div>
                <h3 className="font-black text-slate-900 text-base">
                  {t('बोलेरो पिकअप / मैक्सी ट्रक', 'Bolero Maxi Truck')}
                </h3>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md inline-block my-1.5">
                  {t('क्षमता: 1 से 2 पशु + बछिया', 'Capacity: 1 - 2 Head + Calf')}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t(
                    'लार, देवरिया, कुशीनगर एवं गोरखपुर नगर के लिए तीव्रतम एवं सुगम साधन। संकरी गलियों व ग्रामीण पगडंडियों में आसानी से प्रवेश।',
                    'Fast and flexible for local delivery in Deoria and Gorakhpur. Soft straw bedding and tailgate ramp.'
                  )}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{t('स्थानीय भाड़ा:', 'Local Fare:')}</span>
                <strong className="font-mono text-slate-900 font-bold">₹1,500 – ₹3,000</strong>
              </div>
            </div>

            {/* Vehicle 2 */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xl mb-3">
                  🚚
                </div>
                <h3 className="font-black text-slate-900 text-base">
                  {t('14-फीट केंटर (Eicher 14ft)', '14ft Eicher Container')}
                </h3>
                <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md inline-block my-1.5">
                  {t('क्षमता: 4 से 6 पशु', 'Capacity: 4 - 6 Head')}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t(
                    'मध्यम डेयरी फार्मों के लिए सबसे उपयुक्त। सुरक्षा विभाजन बल्लियां, पानी की बाल्टी व्यवस्था एवं छायादार तिरपाल।',
                    'Ideal for small commercial dairy expansions. Equipped with internal partition bars and ventilation.'
                  )}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{t('अनुमानित भाड़ा:', 'Est. Freight:')}</span>
                <strong className="font-mono text-slate-900 font-bold">₹3,500 – ₹6,500</strong>
              </div>
            </div>

            {/* Vehicle 3 */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xl mb-3">
                  🚛
                </div>
                <h3 className="font-black text-slate-900 text-base">
                  {t('22-फीट हेवी कंटेनर ट्रक', '22ft Heavy Cattle Container')}
                </h3>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md inline-block my-1.5">
                  {t('क्षमता: 8 से 12+ पशु (कमर्शियल)', 'Capacity: 8 - 12+ Head (Bulk)')}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t(
                    'बड़े डेयरी फार्मों के लिए लंबी दूरी का सुरक्षित साधन। रबर मैट फ्लोर, चारा ट्रॉली, पानी की टंकी एवं 2 अनुभवी ग्वाला सहायक।',
                    'Commercial long-distance carrier with rubber matting, water troughs, fodder storage, and transit permits.'
                  )}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{t('बल्क भाड़ा दर:', 'Wholesale Freight:')}</span>
                <strong className="font-mono text-slate-900 font-bold">₹40 – ₹45 / km</strong>
              </div>
            </div>

          </div>
        </div>

        {/* Quotation Request Form */}
        <div className="bg-gradient-to-r from-slate-950 via-[#0F241A] to-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-3">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                {t('गाड़ी भाड़ा कोटेशन अनुरोध', 'Freight Quote Request')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {t('अपने स्थान तक का वाहन खर्च तुरंत जानें', 'Get an Instant Transport Quotation')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t(
                  'लार फार्म से आपके गंतव्य तक की वास्तविक दूरी और टोल टैक्स के आधार पर सबसे वाजिब भाड़ा उपलब्ध कराया जाता है।',
                  'Fill your delivery location to receive an accurate, transparent freight estimate.'
                )}
              </p>

              <div className="space-y-1.5 text-xs text-slate-300 pt-2">
                <div>📞 डायरेक्ट फोन: <strong className="text-white font-mono">{BUSINESS_CONFIG.contacts.phone}</strong></div>
                <div>📍 प्रस्थान: <span className="text-amber-200">खरदहा नीलकंठ, लार (देवरिया)</span></div>
                <div>💬 WhatsApp पर तुरंत रूट चार्ट व गाड़ी नंबर प्राप्त करें</div>
              </div>
            </div>

            <div className="lg:col-span-6">
              {submitted ? (
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl mx-auto">
                    ✓
                  </div>
                  <h3 className="font-bold text-white text-base">{t('कोटेशन अनुरोध प्राप्त हुआ!', 'Quote Request Received!')}</h3>
                  <p className="text-xs text-slate-300">
                    {t(
                      `हमारे लॉजिस्टिक्स समन्वयक 30 मिनट में फोन नंबर ${quoteForm.phone} पर संपर्क कर वाहन भाड़ा बताएंगे।`,
                      `We will contact you shortly on ${quoteForm.phone} with vehicle details.`
                    )}
                  </p>
                  <a
                    href={`https://wa.me/${BUSINESS_CONFIG.contacts.whatsapp}?text=${encodeURIComponent(`नमस्ते! मैंने ${quoteForm.toLocation} के लिए गाड़ी भाड़ा पूछा है (${quoteForm.animalCount} पशु)। कृपया कोटेशन दें।`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    💬 WhatsApp पर चैट करें
                  </a>
                </div>
              ) : (
                <form onSubmit={handleQuoteSubmit} className="bg-white text-slate-900 rounded-2xl p-5 sm:p-6 shadow-xl space-y-3 text-xs">
                  <h3 className="font-black text-xs uppercase tracking-wider text-slate-800">
                    {t('त्वरित भाड़ा पूछताछ फॉर्म', 'Quick Freight Inquiry Form')}
                  </h3>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      {t('आपका नाम *', 'Your Name *')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. अमित कुमार"
                      value={quoteForm.name}
                      onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      {t('मोबाइल नंबर *', 'Mobile Number *')}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="97928XXXXX"
                      value={quoteForm.phone}
                      onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      {t('गंतव्य स्थान (गाँव/शहर, जिला) *', 'Destination Location *')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. रुद्रपुर (देवरिया) या बेतियाहाता (गोरखपुर)"
                      value={quoteForm.toLocation}
                      onChange={(e) => setQuoteForm({ ...quoteForm, toLocation: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        {t('पशु संख्या', 'Animal Count')}
                      </label>
                      <select
                        value={quoteForm.animalCount}
                        onChange={(e) => setQuoteForm({ ...quoteForm, animalCount: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-800 cursor-pointer"
                      >
                        <option value="1">1 पशु</option>
                        <option value="2">2 पशु (पिकअप)</option>
                        <option value="4">4-5 पशु (14-ft)</option>
                        <option value="10">8-12 पशु (बड़ा ट्रक)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        {t('पिन कोड (वैकल्पिक)', 'PIN Code')}
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="274502"
                        value={quoteForm.pincode}
                        onChange={(e) => setQuoteForm({ ...quoteForm, pincode: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-800"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#0F241A] hover:bg-[#1E3B2D] text-amber-300 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-60 mt-1"
                  >
                    {loading ? t('भेज रहे हैं...', 'Submitting...') : t('भाड़ा कोटेशन प्राप्त करें (Get Fare Quote)', 'Get Fare Quote')}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
