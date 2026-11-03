import React from 'react';
import { BUSINESS_CONFIG } from '../../config/business';
import { PublicPage } from './TopBar';
import { useLanguage } from '../../context/LanguageContext';

interface FooterProps {
  onNavigatePage?: (page: PublicPage) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigatePage }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#0F241A] text-slate-300 pt-12 pb-8 border-t border-emerald-950 text-xs">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-emerald-900/60">
          
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm">
                च
              </div>
              <span className="text-sm font-black text-white">
                {BUSINESS_CONFIG.brandName}
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              {t(
                'दादी चम्पा के आशीर्वाद से स्थापित। उच्च दुग्ध क्षमता वाली भैंस, गाय, बल्क डेयरी फार्म आपूर्ति एवं सुरक्षित वाहन परिवहन।',
                'High-milking buffaloes, dairy cows, commercial bulk supply, and doorstep transport in Deoria & Gorakhpur.'
              )}
            </p>
            <div className="text-[11px] text-amber-300 font-semibold">
              {t('प्रोपराइटर: परमेश्वर कुशवाहा', 'Proprietor: Parmeshwar Kushwaha')}
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-amber-300 uppercase tracking-wider text-[11px]">
              {t('महत्वपूर्ण लिंक', 'Quick Links')}
            </h4>
            <ul className="space-y-1.5 text-slate-300 text-xs">
              <li>
                <button onClick={() => onNavigatePage?.('HOME')} className="hover:text-amber-200 cursor-pointer">
                  {t('होम (Home)', 'Home')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigatePage?.('ANIMALS')} className="hover:text-amber-200 cursor-pointer">
                  {t('हमारे पशु (Our Animals)', 'Our Animals')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigatePage?.('BULK_ORDER')} className="hover:text-amber-200 cursor-pointer text-amber-300 font-bold">
                  {t('बल्क ऑर्डर (Bulk Order)', 'Bulk Order for Farms')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigatePage?.('TRANSPORT')} className="hover:text-amber-200 cursor-pointer">
                  {t('गाड़ी व ट्रांसपोर्ट (Transport)', 'Animal Transport')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigatePage?.('DASHBOARD')} className="hover:text-amber-200 cursor-pointer text-emerald-400 font-bold">
                  {t('माय डैशबोर्ड (Customer Portal)', 'My Dashboard')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-amber-300 uppercase tracking-wider text-[11px]">
              {t('स्थान एवं परिधि', 'Location & Service')}
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              <strong>{t('फार्म पता:', 'Farm Address:')}</strong><br />
              {BUSINESS_CONFIG.location.displayAddress} (पिन: 274502)<br /><br />
              <strong>{t('कवरेज क्षेत्र:', 'Coverage:')}</strong><br />
              {t('संपूर्ण देवरिया जिला, सलेमपुर, लार, गोरखपुर (GKP), कुशीनगर व बिहार सीमांत।', 'Whole Deoria District, Gorakhpur (GKP), Kushinagar & Bihar border.')}
            </p>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-amber-300 uppercase tracking-wider text-[11px]">
              {t('हेल्पलाइन व संपर्क', 'Helpline & Contact')}
            </h4>
            <a href={`tel:${BUSINESS_CONFIG.contacts.phone}`} className="font-mono text-lg font-black text-amber-300 block hover:text-white">
              {BUSINESS_CONFIG.contacts.phone}
            </a>
            <p className="text-slate-400 text-xs">
              {t('परमेश्वर कुशवाहा / अरुण भाई', 'Parmeshwar Kushwaha / Arun Bhai')}
            </p>
            <a
              href={`https://wa.me/${BUSINESS_CONFIG.contacts.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors mt-1"
            >
              <span>💬</span>
              <span>WhatsApp Chat</span>
            </a>
          </div>

        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>© {new Date().getFullYear()} {BUSINESS_CONFIG.brandName} · {t('सर्वाधिकार सुरक्षित', 'All Rights Reserved')}</p>
          <p className="font-mono">{t('लार, देवरिया (उ.प्र.) 274502', 'Lar, Deoria (UP) 274502')}</p>
        </div>
      </div>
    </footer>
  );
};
