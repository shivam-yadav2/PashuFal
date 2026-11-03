import React, { useState } from 'react';
import { Animal } from '../../types/domain';
import { formatINR } from '../../lib/currency';
import { BUSINESS_CONFIG } from '../../config/business';
import { useLanguage } from '../../context/LanguageContext';
import { RealisticCattlePhoto } from '../ui/RealisticCattlePhoto';

interface AnimalDetailModalProps {
  animal: Animal | null;
  onClose: () => void;
  onOpenReserve?: (animal: Animal) => void;
  onOpenSale?: (animal: Animal) => void;
  isStaff?: boolean;
}

export const AnimalDetailModal: React.FC<AnimalDetailModalProps> = ({
  animal,
  onClose,
  onOpenReserve,
  onOpenSale,
  isStaff = false,
}) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'DESC' | 'HEALTH' | 'SELLER' | 'TRANSPORT'>('DESC');
  const [showInspectionSuccess, setShowInspectionSuccess] = useState(false);

  if (!animal) return null;

  const { listing } = animal;
  const isAvailable = listing.status === 'AVAILABLE';
  const isReserved = listing.status === 'RESERVED';

  const sendWhatsAppEnquiry = () => {
    const text = encodeURIComponent(
      `नमस्ते परमेश्वर जी! मुझे चम्पा डेयरी (लार, देवरिया) के पशु #${animal.id} (${animal.breed}, ${animal.reportedMilkYieldLpd || '—'} L/day) के बारे में जानकारी चाहिए। क्या यह फार्म पर दोहाई जांच के लिए उपलब्ध है?`
    );
    window.open(`https://wa.me/${BUSINESS_CONFIG.contacts.whatsapp}?text=${text}`, '_blank');
  };

  const callSeller = () => {
    window.location.href = `tel:${BUSINESS_CONFIG.contacts.rawPhone}`;
  };

  const handleRequestInspection = () => {
    const text = encodeURIComponent(
      `नमस्ते! मैं पशु #${animal.id} (${animal.breed}, ${animal.reportedMilkYieldLpd || '—'} L/day) की दोहाई व स्वास्थ्य जांच के लिए फार्म विजिट बुक करना चाहता हूँ। स्थान: लार, देवरिया।`
    );
    window.open(`https://wa.me/${BUSINESS_CONFIG.contacts.whatsapp}?text=${text}`, '_blank');
    setShowInspectionSuccess(true);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl border border-slate-200 max-w-4xl w-full overflow-hidden shadow-2xl my-8 relative flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header & Breadcrumbs matching collage */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>{t('होम', 'Home')}</span>
            <span>&gt;</span>
            <span>{t('हमारे पशु', 'Our Animals')}</span>
            <span>&gt;</span>
            <span className="font-bold text-slate-900">{animal.breed}</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 ml-1">
              #{animal.id}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          
          {/* Main 2-Column Section Matching Collage */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Left 6 Cols: Photo Gallery + Video Badge */}
            <div className="md:col-span-6 space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <RealisticCattlePhoto
                  species={animal.species}
                  breed={animal.breed}
                  tagNumber={animal.tagNumber}
                  imageUrl={animal.images[0]?.url}
                  alt={listing.title}
                  className="w-full h-72 object-cover"
                />

                {/* Video icon overlay badge */}
                <div 
                  onClick={sendWhatsAppEnquiry}
                  className="absolute bottom-3 right-3 bg-black/75 hover:bg-black text-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs cursor-pointer shadow-md transition-colors"
                >
                  <span>▶</span>
                  <span>{t('वीडियो देखें (WhatsApp)', 'Watch Video')}</span>
                </div>
              </div>

              {/* Thumbnail Strip */}
              <div className="flex items-center gap-2">
                <div className="w-16 h-14 rounded-xl border-2 border-emerald-600 overflow-hidden bg-slate-100 shrink-0">
                  <RealisticCattlePhoto
                    species={animal.species}
                    breed={animal.breed}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-16 h-14 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 opacity-75 shrink-0">
                  <RealisticCattlePhoto
                    species={animal.species}
                    breed={animal.breed}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-16 h-14 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 opacity-75 shrink-0">
                  <RealisticCattlePhoto
                    species={animal.species}
                    breed={animal.breed}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Right 6 Cols: Animal Specs + Enquiry CTA */}
            <div className="md:col-span-6 space-y-4">
              
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {animal.breed} {animal.species === 'BUFFALO' ? t('भैंस', 'Buffalo') : t('गाय', 'Cow')}
                  </h1>
                  {isAvailable && (
                    <span className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      {t('Available', 'Available')}
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-1">
                  <div className="text-amber-400 text-xs">★★★★★</div>
                  <span className="text-xs font-bold text-slate-800">4.8</span>
                  <span className="text-xs text-slate-500 font-medium">(25 Reviews)</span>
                </div>

                {/* Price */}
                <div className="mt-2.5">
                  <span className="text-2xl font-black font-mono text-emerald-950">
                    {formatINR(listing.priceMin)}
                  </span>
                  <span className="text-xs text-slate-500 ml-2 font-medium">
                    {formatINR(listing.priceMax)} ({t('अधिकतम सीमा', 'negotiable range')})
                  </span>
                </div>
              </div>

              {/* Spec Attributes matching collage */}
              <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-500 font-semibold">🎂 {t('Age:', 'Age:')}</span>
                  <strong className="text-slate-900 font-bold">{animal.ageYears} {t('वर्ष', 'Years')}</strong>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-500 font-semibold">🥛 {t('Milk Yield:', 'Milk Yield:')}</span>
                  <strong className="text-emerald-800 font-bold">{animal.reportedMilkYieldLpd || '16'} {t('Ltr/Day', 'Ltr/Day')}</strong>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-500 font-semibold">🏷 {t('Breed:', 'Breed:')}</span>
                  <strong className="text-slate-900 font-bold">{animal.breed}</strong>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-500 font-semibold">👶 {t('Calving:', 'Calving:')}</span>
                  <strong className="text-slate-900 font-bold">{animal.lactationNumber ? `${animal.lactationNumber} Times` : '2 Times'}</strong>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-slate-500 font-semibold">📍 {t('Location:', 'Location:')}</span>
                  <strong className="text-slate-900 font-bold truncate">{listing.location || 'Khardaha Nilkanth, Lar (Deoria)'}</strong>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
                  <span>✓</span>
                  <span>{t('Verified by Vet (सरकारी पशु चिकित्सक जांच पूर्ण)', 'Verified by Vet')}</span>
                </div>
              </div>

              {/* Right Action CTA Strip matching collage */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={sendWhatsAppEnquiry}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>💬</span>
                  <span>{t('WhatsApp Enquiry', 'WhatsApp Enquiry')}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={callSeller}
                    className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>📞</span>
                    <span>{t('Call Seller', 'Call Seller')}</span>
                  </button>

                  <button
                    onClick={handleRequestInspection}
                    className="py-2.5 px-3 rounded-xl bg-[#0F241A] hover:bg-[#1A3B2C] text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>📋</span>
                    <span>{t('Request Inspection', 'Request Inspection')}</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* 4 Tabs Section Matching Collage */}
          <div className="border-t border-slate-200 pt-5 space-y-4">
            
            {/* Tab Buttons */}
            <div className="flex border-b border-slate-200 text-xs font-bold">
              <button
                onClick={() => setActiveTab('DESC')}
                className={`pb-2.5 px-4 cursor-pointer transition-colors ${
                  activeTab === 'DESC'
                    ? 'border-b-2 border-emerald-800 text-emerald-950 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t('विवरण (Description)', 'Description')}
              </button>

              <button
                onClick={() => setActiveTab('HEALTH')}
                className={`pb-2.5 px-4 cursor-pointer transition-colors ${
                  activeTab === 'HEALTH'
                    ? 'border-b-2 border-emerald-800 text-emerald-950 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t('स्वास्थ्य रिकॉर्ड (Health Records)', 'Health Records')}
              </button>

              <button
                onClick={() => setActiveTab('SELLER')}
                className={`pb-2.5 px-4 cursor-pointer transition-colors ${
                  activeTab === 'SELLER'
                    ? 'border-b-2 border-emerald-800 text-emerald-950 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t('विक्रेता जानकारी (Seller Info)', 'Seller Info')}
              </button>

              <button
                onClick={() => setActiveTab('TRANSPORT')}
                className={`pb-2.5 px-4 cursor-pointer transition-colors ${
                  activeTab === 'TRANSPORT'
                    ? 'border-b-2 border-emerald-800 text-emerald-950 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t('परिवहन विवरण (Transport Info)', 'Transport Info')}
              </button>
            </div>

            {/* Tab Contents */}
            <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
              
              {activeTab === 'DESC' && (
                <div className="space-y-2">
                  <p>{listing.description}</p>
                  <p className="font-semibold text-slate-900 pt-1">
                    {t(
                      'शांत स्वभाव, दोनों समय आसानी से दोहने योग्य। फार्म पर लाइव दोहनी टेस्ट की पूर्ण स्वतंत्रता।',
                      'Docile temperament, easy hand and machine milking. Live pail milking test welcomed at farm.'
                    )}
                  </p>
                </div>
              )}

              {activeTab === 'HEALTH' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-semibold">{t('कान का टैग (INAPH Tag)', 'Ear Tag')}</span>
                      <strong className="text-slate-900 font-mono">{animal.tagNumber}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-semibold">{t('टीकाकरण स्थिति', 'Vaccination')}</span>
                      <strong className="text-emerald-800">FMD + HS Completed</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-semibold">{t('फिटनेस प्रमाण पत्र', 'Vet Certificate')}</span>
                      <strong className="text-emerald-800">Govt Vet Hospital, Lar</strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 pt-1">
                    {animal.healthNotes || 'पशु पूरी तरह स्वस्थ है। खुर व थन में कोई विकार नहीं है।'}
                  </p>
                </div>
              )}

              {activeTab === 'SELLER' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0F241A] text-amber-300 font-bold flex items-center justify-center">
                      च
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-bold">{BUSINESS_CONFIG.brandName}</strong>
                      <span className="text-slate-600 text-[11px]">{BUSINESS_CONFIG.ownerName} · {BUSINESS_CONFIG.location.displayAddress}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 pt-1">
                    {t('25 वर्षों से पूर्वांचल में ईमानदार पशु व्यापार व उच्च दुधारू नस्ल संरक्षण।', 'Serving dairy farmers with integrity for over 25 years.')}
                  </p>
                </div>
              )}

              {activeTab === 'TRANSPORT' && (
                <div className="space-y-2">
                  <p>
                    {t(
                      'संपूर्ण देवरिया एवं गोरखपुर में पिकअप व केंटर वाहन की व्यवस्था। पुआल की बिछाली, ताजा चारा-पानी व पशु परिवहन परमिट (Form 88 & 89) साथ में दिया जाता है।',
                      'Dedicated transport arrangements across Deoria and Gorakhpur with soft straw bedding, water breaks, and legal transit permits.'
                    )}
                  </p>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
