import React, { useState } from 'react';
import { BUSINESS_CONFIG } from '../../config/business';
import { useLanguage } from '../../context/LanguageContext';

export const ContactPage: React.FC = () => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    const text = encodeURIComponent(
      `नमस्ते परमेश्वर कुशवाहा जी (चम्पा डेयरी एवं पशु केंद्र, लार, देवरिया)!\n` +
      `मेरा नाम: ${name || 'ग्राहक'}\n` +
      `फोन: ${phone}\n` +
      `संदेश: ${message || 'पशु एवं दूध सप्लाई के बारे में जानकारी चाहिए।'}`
    );

    setSubmitted(true);
    setTimeout(() => {
      window.open(`https://wa.me/${BUSINESS_CONFIG.contacts.whatsapp}?text=${text}`, '_blank');
    }, 200);
  };

  return (
    <div className="bg-[#FAF8F5] py-10 lg:py-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Contact Section Matching Collage */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left 6 Cols: Contact Info Matching Collage */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                  {t('सीधा संपर्क', 'Get in Touch')}
                </span>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  {t('Contact Us', 'Contact Us')}
                </h1>
                <p className="text-emerald-800 text-base font-bold mt-1">
                  {t('We are here to help you (हम आपकी सेवा में उपस्थित हैं)', 'We are here to help you')}
                </p>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {t(
                    'चाहे आप उच्च दुधारू भैंस या गाय खरीदना चाहते हों, फार्म विजिट कर दोहाई जांचना चाहते हों, या दैनिक शुद्ध दूध सप्लाई चाहते हों — हमारा द्वार हमेशा खुला है।',
                    'Visit our farm in Khardaha Nilkanth, Lar (Deoria) or call directly.'
                  )}
                </p>
              </div>

              {/* Direct Details with Icons matching collage */}
              <div className="space-y-4 text-xs">
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg shrink-0">
                    📞
                  </div>
                  <div>
                    <strong className="block text-slate-900 text-sm font-black font-mono">
                      +91-9792820684
                    </strong>
                    <span className="text-slate-500 text-[11px]">
                      (9 AM – 9 PM) · {t('24x7 इमरजेंसी हेल्पलाइन उपलब्ध', 'Emergency Support Available')}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-lg shrink-0">
                    ✉
                  </div>
                  <div>
                    <strong className="block text-slate-900 text-sm font-bold">
                      info@purvanchaldairy.in
                    </strong>
                    <span className="text-slate-500 text-[11px]">
                      {t('आधिकारिक ईमेल पत्राचार', 'Official Email Support')}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-lg shrink-0">
                    📍
                  </div>
                  <div>
                    <strong className="block text-slate-900 text-sm font-bold">
                      Khardaha Nilkanth, Lar, Deoria
                    </strong>
                    <span className="text-slate-500 text-[11px]">
                      Purvanchal, Uttar Pradesh — 274502 (नीलकंठ महादेव मंदिर के पास)
                    </span>
                  </div>
                </div>

              </div>

              {/* Social Channels Matching Collage */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  {t('सोशल मीडिया पर जुड़ें:', 'Connect with us:')}
                </span>
                <div className="flex items-center gap-2 text-sm">
                  <a
                    href={`https://wa.me/${BUSINESS_CONFIG.contacts.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold hover:scale-105 transition-transform"
                    title="WhatsApp"
                  >
                    💬
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold hover:scale-105 transition-transform"
                    title="Facebook"
                  >
                    f
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold hover:scale-105 transition-transform"
                    title="YouTube"
                  >
                    ▶
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-xl bg-pink-600 text-white flex items-center justify-center font-bold hover:scale-105 transition-transform"
                    title="Instagram"
                  >
                    📷
                  </a>
                </div>
              </div>

            </div>

            {/* Right 6 Cols: Contact Form Matching Collage */}
            <div className="lg:col-span-6 bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200">
              {submitted ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 font-bold text-2xl flex items-center justify-center mx-auto">
                    ✓
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {t('संदेश भेजा गया!', 'Message Sent!')}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {t('परमेश्वर कुशवाहा जी से WhatsApp पर चैट विंडो खुल गई है।', 'Chat initiated on WhatsApp with Parmeshwar Kushwaha.')}
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-3 text-xs font-bold text-emerald-800 underline cursor-pointer"
                  >
                    {t('दूसरा संदेश भेजें', 'Send another message')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {t('Your Name *', 'Your Name *')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t('अपना नाम दर्ज करें', 'Enter your name')}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {t('Mobile Number *', 'Mobile Number *')}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="97928XXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      {t('Your Message *', 'Your Message *')}
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder={t('अपनी आवश्यकता या सवाल यहाँ लिखें...', 'Write your inquiry or question here...')}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{t('Send Message →', 'Send Message →')}</span>
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
