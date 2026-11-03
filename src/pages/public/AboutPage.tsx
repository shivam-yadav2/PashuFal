import React from 'react';
import { BUSINESS_CONFIG } from '../../config/business';
import { useLanguage } from '../../context/LanguageContext';

export const AboutPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-[#FAF8F5] py-10 lg:py-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main About Section Matching Collage */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left 7 Cols: Tradition, Trust & Quality */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <span>📍 {BUSINESS_CONFIG.location.displayAddress}</span>
                <span>•</span>
                <span>25+ Years of Trust</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {t('About Us', 'About Us')}
                <span className="block text-emerald-800 text-2xl sm:text-3xl mt-1 font-extrabold">
                  {t('Tradition, Trust & Quality', 'Tradition, Trust & Quality')}
                </span>
              </h1>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                {t(
                  'पूर्वांचल डेयरी पशु केंद्र (दादी चम्पा के आशीर्वाद से स्थापित) उच्च दुधारू भैंस एवं उन्नत देशी नस्ल की गायों का प्रमुख केंद्र है। हमारे प्रबंध निदेशक परमेश्वर कुशवाहा के 25 वर्षों के व्यावहारिक अनुभव के साथ, हम किसान भाइयों एवं कमर्शियल डेयरी फार्मों को प्रामाणिक दोहाई जांच, सरकारी पशु चिकित्सक फिटनेस प्रमाण पत्र एवं सुरक्षित परिवहन के साथ पशु उपलब्ध कराते हैं।',
                  'Purvanchal Dairy Pashu Kendra is a trusted name in the field of dairy livestock. With years of experience, we provide healthy, high-yield cows and buffaloes to our valued customers. Our mission is to support dairy farmers and livestock buyers with the best quality animals, transparent deals, and reliable service.'
                )}
              </p>

              <div className="pt-2">
                <a
                  href={`https://wa.me/${BUSINESS_CONFIG.contacts.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  <span>{t('Know More →', 'Know More →')}</span>
                </a>
              </div>
            </div>

            {/* Right 5 Cols: Authentic Farm Steward Card Matching Collage */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#0F241A] to-[#1A3E2D] text-white p-7 rounded-3xl shadow-lg border border-emerald-950 text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-amber-400 text-slate-950 font-black text-3xl mx-auto flex items-center justify-center shadow-md">
                च
              </div>

              <div>
                <h3 className="font-black text-lg text-white">
                  {BUSINESS_CONFIG.ownerName}
                </h3>
                <p className="text-xs text-amber-300 font-semibold">
                  {t('संस्थापक एवं मुख्य संचालक', 'Founder & Managing Proprietor')}
                </p>
                <p className="text-[11px] text-slate-300 mt-1">
                  दादी चम्पा के नाम से समर्पित · लार, देवरिया (उ.प्र.)
                </p>
              </div>

              <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-xs text-slate-200 italic leading-relaxed">
                "{t(
                  'हमारे यहां ग्राहक की मांग सर्वोपरि है — ग्राहक को जो चाहिए सब मिलेगा। दोहाई जांच अपनी आंखों से करें और संतुष्ट होकर पशु ले जाएं।',
                  'Customer satisfaction is our highest commitment. Every animal is backed by transparent two-time physical milking tests.'
                )}"
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-4 text-xs font-mono text-amber-200">
                <span>📞 9792820684</span>
                <span>•</span>
                <span>24x7 Available</span>
              </div>
            </div>

          </div>
        </div>

        {/* 3 Pillars Underneath */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
            <span className="text-2xl">🏆</span>
            <h3 className="font-bold text-slate-900 text-sm">
              {t('Best Quality Animals', 'Best Quality Animals')}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('मुर्रा व साहीवाल की प्रमाणित दुधारू वंशावली, शांत स्वभाव एवं स्वस्थ थन संरचना।', 'Carefully selected dairy animals with proven milking genetics and docile nature.')}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
            <span className="text-2xl">🤝</span>
            <h3 className="font-bold text-slate-900 text-sm">
              {t('Transparent Deal', 'Transparent Deal')}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('फार्म पर दोनों वक्त दोहाई जांच की खुली अनुमति। कोई झूठे दावे या छुपे शुल्क नहीं।', 'Two-time physical milking verification right in front of the buyer before finalizing.')}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
            <span className="text-2xl">🚚</span>
            <h3 className="font-bold text-slate-900 text-sm">
              {t('Safe Delivery', 'Safe Delivery')}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('पुआल वाली विशेष पिकअप एवं कंटेनर वाहन द्वारा संपूर्ण देवरिया व गोरखपुर में सुरक्षित डिलीवरी।', 'Stress-free doorstep livestock transport with straw bedding and transit permits.')}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
