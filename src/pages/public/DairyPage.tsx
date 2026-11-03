import React from 'react';
import { BUSINESS_CONFIG } from '../../config/business';
import { formatINR } from '../../lib/currency';
import { useLanguage } from '../../context/LanguageContext';

export const DairyPage: React.FC = () => {
  const { t } = useLanguage();

  const handleOrderWhatsApp = (product: string) => {
    const text = encodeURIComponent(
      `नमस्ते चम्पा डेयरी (लार, देवरिया), मुझे ${product} की सप्लाई चाहिए। कृपया दर और डिलीवरी बताएं।`
    );
    window.open(`https://wa.me/${BUSINESS_CONFIG.contacts.whatsapp}?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
          📍 {t('लार, देवरिया · 📞 9792820684', 'Lar, Deoria · 📞 9792820684')}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          {t('ताजा दूध सप्लाई व परिवहन', 'Fresh Milk Supply & Transport')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium">
          {t(
            'संपूर्ण देवरिया जिला एवं गोरखपुर (GKP) में प्रतिदिन शुद्ध व ताजा दूध डिलीवरी।',
            'Daily doorstep delivery of farm-fresh milk across Deoria & Gorakhpur.'
          )}
        </p>
      </div>

      {/* Coverage Banner */}
      <div className="bg-[#0F241A] text-white p-4 rounded-2xl border border-emerald-900 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🚚</span>
          <div>
            <strong className="text-amber-300">
              {t('सप्लाई परिधि: ', 'Delivery Coverage: ')}
            </strong>
            <span className="text-slate-200">
              {t(
                'देवरिया (लार, सलेमपुर, भाटपार, सदर) एवं गोरखपुर (GKP) एक्सप्रेस सप्लाई।',
                'Deoria (Lar, Salempur, Bhatpar, Sadar) and Gorakhpur (GKP).'
              )}
            </span>
          </div>
        </div>
        <a
          href="tel:9792820684"
          className="px-3.5 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-xl whitespace-nowrap text-xs shadow-xs"
        >
          📞 9792820684
        </a>
      </div>

      {/* Two Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Buffalo Milk */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🥛</span>
              <span className="text-[11px] font-bold bg-amber-100 text-amber-950 px-2.5 py-0.5 rounded-md">
                {t('फैट 6.5% – 7.5% (फुल क्रीम)', 'Fat 6.5% - 7.5% (Full Cream)')}
              </span>
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900">
                {t('शुद्ध भैंस का दूध', 'Pure Buffalo Milk')}
              </h2>
              <div className="text-xl font-mono font-black text-emerald-950 mt-1">
                {formatINR(65)}
                <span className="text-xs text-slate-500 font-sans font-medium"> / {t('लीटर', 'Litre')}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              {t(
                'मुर्रा व देसी भैंसों का गाढ़ा मलाईदार दूध। चाय, खीर, खोया एवं मिठाई के लिए सर्वोत्तम।',
                'Rich full-cream milk from Murrah & Desi buffaloes. Perfect for tea, sweets, and paneer.'
              )}
            </p>
          </div>

          <button
            onClick={() => handleOrderWhatsApp(t('भैंस का दूध', 'Buffalo Milk'))}
            className="w-full py-2.5 rounded-xl bg-[#0F241A] hover:bg-[#1A3B2C] text-amber-300 font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>💬</span>
            <span>{t('दूध सप्लाई बुक करें', 'Book Milk Delivery')}</span>
          </button>
        </div>

        {/* Cow Milk */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🐄</span>
              <span className="text-[11px] font-bold bg-emerald-100 text-emerald-950 px-2.5 py-0.5 rounded-md">
                {t('फैट 4.0% – 4.5% (सुपाच्य)', 'Fat 4.0% - 4.5% (Easily Digestible)')}
              </span>
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900">
                {t('शुद्ध देसी गाय का दूध', 'Pure Desi Cow Milk')}
              </h2>
              <div className="text-xl font-mono font-black text-emerald-950 mt-1">
                {formatINR(52)}
                <span className="text-xs text-slate-500 font-sans font-medium"> / {t('लीटर', 'Litre')}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              {t(
                'बच्चों एवं बुजुर्गों के स्वास्थ्य हेतु हल्का व पाचक दूध। बिना किसी मिलावट के ताजा आपूर्ति।',
                'Light and nutritious milk for children and family health. Clean and unadulterated.'
              )}
            </p>
          </div>

          <button
            onClick={() => handleOrderWhatsApp(t('गाय का दूध', 'Cow Milk'))}
            className="w-full py-2.5 rounded-xl bg-[#0F241A] hover:bg-[#1A3B2C] text-amber-300 font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>💬</span>
            <span>{t('दूध सप्लाई बुक करें', 'Book Milk Delivery')}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
