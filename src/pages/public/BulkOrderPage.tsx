import React, { useState } from 'react';
import { api } from '../../services/api';
import { BUSINESS_CONFIG } from '../../config/business';
import { Enquiry } from '../../types/domain';
import { useLanguage } from '../../context/LanguageContext';

interface BulkOrderPageProps {
  onEnquiryCreated?: (enquiry: Enquiry) => void;
  onNavigateHome?: () => void;
}

export const BulkOrderPage: React.FC<BulkOrderPageProps> = ({ onEnquiryCreated, onNavigateHome }) => {
  const { t, language } = useLanguage();

  const [formData, setFormData] = useState({
    farmName: '',
    contactPerson: '',
    phone: '',
    email: '',
    farmLocation: 'Deoria District, UP',
    animalType: 'BUFFALO' as 'BUFFALO' | 'COW' | 'ANY',
    breedPreference: 'High Milking Buffalo (मुर्रा / भारी नस्ल)',
    quantity: 5,
    customQuantity: '',
    milkYield: '16-18 LPD',
    budgetPerAnimal: '85000',
    deliveryPincode: '274502',
    expectedDeliveryDate: '',
    additionalNotes: '',
    counterOfferAmount: '',
  });

  const [loading, setLoading] = useState(false);
  const [submittedEnquiry, setSubmittedEnquiry] = useState<Enquiry | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showNegotiation, setShowNegotiation] = useState(false);

  // Volume pricing calculation
  const effectiveQty = formData.customQuantity ? parseInt(formData.customQuantity, 10) : formData.quantity;
  const unitBudget = parseInt(formData.budgetPerAnimal, 10) || 85000;
  const estimatedTotal = effectiveQty * unitBudget;
  const volumeDiscount = effectiveQty >= 20 ? 0.08 : effectiveQty >= 10 ? 0.05 : 0.02;
  const discountedTotal = Math.round(estimatedTotal * (1 - volumeDiscount));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.farmName.trim()) {
      setErrorMessage(language === 'HI' ? 'कृपया फार्म या व्यवसाय का नाम दर्ज करें।' : 'Please enter Farm / Business Name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setErrorMessage(language === 'HI' ? 'कृपया मान्य 10 अंकों का फोन नंबर दर्ज करें।' : 'Valid 10-digit mobile number required.');
      return;
    }

    setLoading(true);
    try {
      const created = await api.createEnquiry({
        customerName: formData.farmName,
        contactPerson: formData.contactPerson || formData.farmName,
        phone: formData.phone,
        email: formData.email || undefined,
        enquiryType: 'BULK_COMMERCIAL',
        animalType: formData.animalType,
        preferredBreed: formData.breedPreference,
        requestedQuantity: effectiveQty,
        preferredMilkYield: formData.milkYield,
        budgetPerAnimal: unitBudget,
        totalBudget: discountedTotal,
        deliveryLocation: `${formData.farmLocation} (PIN: ${formData.deliveryPincode})`,
        requiredDeliveryDate: formData.expectedDeliveryDate || undefined,
        additionalInstructions: `${formData.additionalNotes} ${formData.counterOfferAmount ? `[काउंटर ऑफर: ₹${formData.counterOfferAmount}]` : ''}`,
      });

      setSubmittedEnquiry(created);
      if (onEnquiryCreated) onEnquiryCreated(created);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating bulk enquiry');
    } finally {
      setLoading(false);
    }
  };

  const openWhatsAppConfirmation = () => {
    if (!submittedEnquiry) return;
    const msg = encodeURIComponent(
      `नमस्ते परमेश्वर कुशवाहा जी (चम्पा डेयरी एवं पशु केंद्र, लार, देवरिया)!\n` +
      `मैंने बल्क आर्डर अनुरोध भेजा है:\n` +
      `रिफरेंस कोड: ${submittedEnquiry.id}\n` +
      `फार्म: ${submittedEnquiry.customerName}\n` +
      `फोन: ${submittedEnquiry.phone}\n` +
      `मात्रा: ${effectiveQty}x ${formData.animalType === 'BUFFALO' ? 'भैंस' : 'गाय'}\n` +
      `दूध क्षमता: ${formData.milkYield}\n` +
      `अनुमानित कोटेशन: ₹${discountedTotal.toLocaleString('en-IN')}\n\n` +
      `कृपया दोहाई तारीख व गाड़ी भाड़ा बताएं।`
    );
    window.open(`https://wa.me/${BUSINESS_CONFIG.contacts.whatsapp}?text=${msg}`, '_blank');
  };

  return (
    <div className="bg-[#FAF8F5] py-8 lg:py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Banner matching collage */}
        <div className="bg-gradient-to-r from-[#0F241A] via-[#163829] to-[#0F241A] text-white rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-2">
                <span>🏢 {t('कमर्शियल डेयरी डेस्क', 'Commercial Dairy Desk')}</span>
                <span>•</span>
                <span>{t('देवरिया, गोरखपुर व संपूर्ण उ.प्र.', 'Deoria, Gorakhpur & UP')}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {t('Bulk Order for Dairy Farms', 'Bulk Order for Dairy Farms')}
              </h1>
              <p className="text-amber-300 text-sm font-bold mt-1">
                {t('5, 10, 20+ Pashu Ek Sath Kharide', '5, 10, 20+ Pashu Ek Sath Kharide')}
              </p>
              <p className="text-slate-300 text-xs mt-1 max-w-xl">
                {t(
                  'विशेष नीति: "ग्राहक को जो चाहिए सब मिलेगा" — किसी भी नस्ल, ब्यात व दूध क्षमता का पशु आपके ऑर्डर पर उपलब्ध कराया जाता है।',
                  'Custom cattle selection, on-farm two-time milking verification, and container transport.'
                )}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 text-center md:text-right shrink-0">
              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                {t('सीधी हेल्पलाइन', 'Direct Helpline')}
              </span>
              <a href={`tel:${BUSINESS_CONFIG.contacts.phone}`} className="text-lg font-black text-white hover:text-amber-300">
                📞 {BUSINESS_CONFIG.contacts.phone}
              </a>
              <span className="text-[11px] text-slate-300 block">{BUSINESS_CONFIG.location.displayAddress}</span>
            </div>
          </div>
        </div>

        {submittedEnquiry ? (
          /* Success Screen with Unique Reference Code */
          <div className="bg-white border-2 border-emerald-600 rounded-3xl p-8 sm:p-12 shadow-sm text-center space-y-6 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
              ✓
            </div>
            
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {t('बल्क अनुरोध सफलतापूर्वक पंजीकृत', 'Bulk Enquiry Successfully Registered')}
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-3">
                {t('धन्यवाद', 'Thank you')}, {submittedEnquiry.customerName}!
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                {t('आपका अनुरोध सीधे परमेश्वर कुशवाहा (लार, देवरिया) के पास दर्ज हो गया है।', 'Your request is recorded at our Lar, Deoria desk.')}
              </p>
            </div>

            {/* Unique Reference Number */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-2.5">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-xs text-slate-500 font-bold">{t('यूनिक संदर्भ संख्या (Unique Enquiry ID):', 'Unique Enquiry ID:')}</span>
                <span className="text-base font-mono font-black text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-300">
                  {submittedEnquiry.id}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">{t('पशु संख्या:', 'Quantity:')}</span>
                <span className="font-bold text-slate-900">{effectiveQty} {formData.animalType}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">{t('अपेक्षित दूध:', 'Milk Yield:')}</span>
                <span className="font-bold text-slate-900">{formData.milkYield}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">{t('अनुमानित बल्क कोटेशन:', 'Estimated Quote:')}</span>
                <span className="font-bold font-mono text-emerald-900">₹{discountedTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={openWhatsAppConfirmation}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>💬</span>
                <span>{t('WhatsApp पर तुरंत कोटेशन पाएं', 'Chat on WhatsApp')}</span>
              </button>
              <a
                href={`tel:${BUSINESS_CONFIG.contacts.phone}`}
                className="w-full sm:w-auto px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl transition-colors text-center"
              >
                📞 9792820684
              </a>
            </div>
          </div>
        ) : (
          /* Main 2-Column Form Layout Matching Collage */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 8 Cols: Bulk Order Form */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  {t('Your Requirements (अपनी आवश्यकता बताएं)', 'Your Requirements')}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {t('सभी आवश्यक विवरण भरें — हमारा दल 2 घंटे में संपर्क करेगा', 'Fill your cattle preferences for an instant wholesale quotation')}
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold">
                  ⚠️ {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                
                {/* Row 1: Name and Animal Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {t('Your Name / Farm Name *', 'Your Name / Farm Name *')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t('उदा. कृष्णा डेयरी फार्म / रमेश यादव', 'e.g. Krishna Dairy Farm')}
                      value={formData.farmName}
                      onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {t('Animal Type *', 'Animal Type *')}
                    </label>
                    <select
                      value={formData.animalType}
                      onChange={(e: any) => setFormData({ ...formData, animalType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-800 cursor-pointer"
                    >
                      <option value="BUFFALO">{t('भैंस (Buffalo - उच्च दुधारू)', 'Buffalo (High Milking)')}</option>
                      <option value="COW">{t('गाय (Dairy Cow - देशी/साहीवाल)', 'Dairy Cow')}</option>
                      <option value="ANY">{t('भैंस एवं गाय दोनों (Mixed Cattle)', 'Both Buffalo & Cow')}</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Mobile Number and Quantity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {t('Mobile Number *', 'Mobile Number *')}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="97928XXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {t('Quantity (मात्रा) *', 'Quantity *')}
                    </label>
                    <div className="grid grid-cols-4 gap-1.5 font-bold">
                      {[5, 10, 20, 50].map((qty) => (
                        <button
                          type="button"
                          key={qty}
                          onClick={() => setFormData({ ...formData, quantity: qty, customQuantity: '' })}
                          className={`py-2 rounded-xl border text-center transition-all cursor-pointer ${
                            formData.quantity === qty && !formData.customQuantity
                              ? 'bg-[#0F241A] text-amber-300 border-[#0F241A] shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {qty}+
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Row 3: Farm Location and Milk Yield Preference */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {t('Farm Location (स्थान) *', 'Farm Location *')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t('उदा. सलेमपुर, देवरिया (उ.प्र.)', 'e.g. Salempur, Deoria (UP)')}
                      value={formData.farmLocation}
                      onChange={(e) => setFormData({ ...formData, farmLocation: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {t('Milk Yield Preference (दूध क्षमता)', 'Milk Yield Preference')}
                    </label>
                    <select
                      value={formData.milkYield}
                      onChange={(e) => setFormData({ ...formData, milkYield: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-800 cursor-pointer"
                    >
                      <option value="12-14 LPD">12 - 14 Ltr/Day (Standard)</option>
                      <option value="14-16 LPD">14 - 16 Ltr/Day (Commercial Good)</option>
                      <option value="16-18 LPD">16 - 18 Ltr/Day (High Milking Best)</option>
                      <option value="18-22+ LPD">18 - 22+ Ltr/Day (Peak Pedigree)</option>
                    </select>
                  </div>
                </div>

                {/* Row 4: Budget & Expected Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {t('प्रति पशु बजट (Approx Budget/Animal)', 'Budget per Animal')}
                    </label>
                    <select
                      value={formData.budgetPerAnimal}
                      onChange={(e) => setFormData({ ...formData, budgetPerAnimal: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-800 cursor-pointer"
                    >
                      <option value="75000">₹70,000 – ₹80,000</option>
                      <option value="85000">₹80,000 – ₹95,000 (मानक)</option>
                      <option value="110000">₹1,00,000 – ₹1,25,000 (उच्च श्रेणी)</option>
                      <option value="145000">₹1,30,000 – ₹1,60,000 (सर्वोत्तम मुर्रा)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {t('कब तक डिलीवरी चाहिए? (Expected Delivery)', 'Expected Delivery Date')}
                    </label>
                    <input
                      type="date"
                      value={formData.expectedDeliveryDate}
                      onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-800 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Additional Message */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {t('Additional Message / Custom Requirements', 'Additional Message')}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                    placeholder={t('उदा. 2nd ब्यात के पशु, बछिया साथ में, लाइव दोहाई टेस्ट करेंगे...', 'e.g. 2nd calving, with female calves...')}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                </div>

                {/* Negotiation / Counter-offer toggle */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNegotiation(!showNegotiation)}
                    className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
                  >
                    <span>🤝</span>
                    <span>{showNegotiation ? t('काउंटर ऑफर छुपाएं', 'Hide negotiation') : t('+ अपना काउंटर ऑफर / विशेष बजट प्रस्ताव जोड़ें', '+ Add Counter-offer / Negotiation')}</span>
                  </button>

                  {showNegotiation && (
                    <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                      <label className="block text-[11px] font-bold text-amber-950">
                        {t('आपका प्रस्तावित कुल बजट (Counter-Offer Total Amount in ₹)', 'Your Proposed Total Budget in ₹')}
                      </label>
                      <input
                        type="number"
                        placeholder="उदा. 400000"
                        value={formData.counterOfferAmount}
                        onChange={(e) => setFormData({ ...formData, counterOfferAmount: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs font-mono font-bold"
                      />
                      <span className="text-[10px] text-amber-800 block">
                        हम आपके बजट प्रस्ताव पर विचार कर सबसे अनुकूल कोटेशन प्रदान करेंगे।
                      </span>
                    </div>
                  )}
                </div>

                {/* Submit Request Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <span>📋</span>
                    <span>{loading ? t('अनुरोध दर्ज हो रहा है...', 'Submitting...') : t('Submit Request →', 'Submit Request →')}</span>
                  </button>
                </div>

              </form>

            </div>

            {/* Right 4 Cols: "Our Promise" Card Matching Collage */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Our Promise Panel matching collage */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>⭐</span>
                  <span>{t('Our Promise', 'Our Promise')}</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                      ✓
                    </span>
                    <div>
                      <strong className="block text-slate-900 font-bold">{t('Best Quality Animals', 'Best Quality Animals')}</strong>
                      <span className="text-slate-500 text-[11px]">{t('मुर्रा व साहीवाल की शीर्ष वंशावली', 'Top genetic lineages verified on farm')}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                      ✓
                    </span>
                    <div>
                      <strong className="block text-slate-900 font-bold">{t('Transparent Deal', 'Transparent Deal')}</strong>
                      <span className="text-slate-500 text-[11px]">{t('दोहाई परीक्षण अपनी आंखों के सामने', 'Two-time pail milking inspection before sale')}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                      ✓
                    </span>
                    <div>
                      <strong className="block text-slate-900 font-bold">{t('Safe Delivery', 'Safe Delivery')}</strong>
                      <span className="text-slate-500 text-[11px]">{t('पुआल वाली विशेष 14-ft व 22-ft गाड़ी', 'Dedicated cattle container with attendant')}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                      ✓
                    </span>
                    <div>
                      <strong className="block text-slate-900 font-bold">{t('Expert Support', 'Expert Support')}</strong>
                      <span className="text-slate-500 text-[11px]">{t('पशु चिकित्सक जांच व 24x7 मार्गदर्शन', 'Govt veterinary clearance & direct support')}</span>
                    </div>
                  </div>
                </div>

                {/* Instant Bulk Quotation Estimator Box */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    {t('अनुमानित बल्क कोटेशन (Instant Estimator):', 'Instant Quotation Preview:')}
                  </span>
                  
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">{effectiveQty}x पशु @ ₹{unitBudget.toLocaleString('en-IN')}:</span>
                      <span className="font-mono font-bold">₹{estimatedTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-xs text-emerald-700 font-bold">
                      <span>{t('बल्क छूट (Volume Discount):', 'Wholesale Tier:')}</span>
                      <span>- {(volumeDiscount * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between text-xs border-t border-slate-200 pt-1 font-bold text-slate-900">
                      <span>{t('अनुमानित शुद्ध मूल्य:', 'Estimated Total:')}</span>
                      <span className="text-emerald-950 font-mono font-black text-sm">
                        ₹{discountedTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 block italic text-center">
                    * वाहन भाड़ा व टोल गंतव्य के अनुसार पृथक रहेगा।
                  </span>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
