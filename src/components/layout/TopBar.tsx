import React, { useEffect, useState } from 'react';
import { Phone, Mail, Clock, Languages, Menu, X, LogIn, LayoutDashboard, LogOut, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { BUSINESS_CONFIG } from '../../config/business';
import { BrandMark } from './BrandMark';

export type PublicPage = 'HOME' | 'ANIMALS' | 'BULK_ORDER' | 'TRANSPORT' | 'DASHBOARD' | 'ABOUT' | 'CONTACT';

interface TopBarProps {
  activeView: 'PUBLIC' | 'ADMIN' | 'LOGIN';
  setActiveView: (view: 'PUBLIC' | 'ADMIN' | 'LOGIN') => void;
  publicPage: PublicPage;
  setPublicPage: (page: PublicPage) => void;
}

const NAV_LINKS: { id: PublicPage; labelHi: string; labelEn: string }[] = [
  { id: 'HOME', labelHi: 'होम', labelEn: 'Home' },
  { id: 'ANIMALS', labelHi: 'पशु', labelEn: 'Animals' },
  { id: 'BULK_ORDER', labelHi: 'बल्क ऑर्डर', labelEn: 'Bulk Orders' },
  { id: 'TRANSPORT', labelHi: 'ट्रांसपोर्ट', labelEn: 'Transport' },
  { id: 'ABOUT', labelHi: 'हमारे बारे में', labelEn: 'About' },
  { id: 'CONTACT', labelHi: 'संपर्क', labelEn: 'Contact' },
];

export function whatsappLink(message?: string): string {
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${BUSINESS_CONFIG.contacts.whatsapp}${text}`;
}

export const TopBar: React.FC<TopBarProps> = ({ activeView, setActiveView, publicPage, setPublicPage }) => {
  const { isAuthenticated, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { contacts, content } = BUSINESS_CONFIG;
  const announcement = t(content.announcementHi || content.announcementEn, content.announcementEn || content.announcementHi);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const go = (page: PublicPage) => {
    setActiveView('PUBLIC');
    setPublicPage(page);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const enquiryMessage = t(
    `नमस्ते, मुझे ${BUSINESS_CONFIG.hindiBrandName} से पशु / दूध के बारे में जानकारी चाहिए।`,
    `Hello, I'd like to enquire about animals / milk from ${BUSINESS_CONFIG.brandName}.`
  );

  return (
    <header className="sticky top-0 z-40">
      {announcement && (
        <div className="bg-accent-400 text-stone-900 text-center text-sm font-medium px-4 py-2">{announcement}</div>
      )}

      <div className="hidden md:block bg-brand-900 text-brand-100 text-[13px]">
        <div className="container-page flex h-9 items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <a href={`tel:${contacts.rawPhone || contacts.phone}`} className="inline-flex items-center gap-1.5 hover:text-white">
              <Phone className="w-3.5 h-3.5" aria-hidden />
              {contacts.phone}
            </a>
            {contacts.email && (
              <a href={`mailto:${contacts.email}`} className="inline-flex items-center gap-1.5 hover:text-white">
                <Mail className="w-3.5 h-3.5" aria-hidden />
                {contacts.email}
              </a>
            )}
            {contacts.workingHours && (
              <span className="hidden lg:inline-flex items-center gap-1.5 text-brand-100/80">
                <Clock className="w-3.5 h-3.5" aria-hidden />
                {contacts.workingHours}
              </span>
            )}
          </div>
          <div className="flex items-center gap-5">
            <button onClick={toggleLanguage} className="inline-flex items-center gap-1.5 hover:text-white">
              <Languages className="w-3.5 h-3.5" aria-hidden />
              {language === 'HI' ? 'English' : 'हिंदी'}
            </button>
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setActiveView(activeView === 'ADMIN' ? 'PUBLIC' : 'ADMIN')}
                  className="inline-flex items-center gap-1.5 hover:text-white"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" aria-hidden />
                  {activeView === 'ADMIN' ? t('वेबसाइट देखें', 'View website') : t('एडमिन पैनल', 'Admin panel')}
                </button>
                <button onClick={logout} className="inline-flex items-center gap-1.5 hover:text-white">
                  <LogOut className="w-3.5 h-3.5" aria-hidden />
                  {t('लॉग आउट', 'Sign out')}
                </button>
              </>
            ) : (
              <button onClick={() => setActiveView('LOGIN')} className="inline-flex items-center gap-1.5 hover:text-white">
                <LogIn className="w-3.5 h-3.5" aria-hidden />
                {t('स्टाफ लॉगिन', 'Staff login')}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur border-b border-stone-200">
        <div className="container-page flex h-16 items-center justify-between gap-6">
          <button onClick={() => go('HOME')} className="flex items-center gap-3 text-left min-w-0">
            <BrandMark />
            <span className="min-w-0">
              <span className="block truncate font-semibold text-stone-900 leading-tight">
                {t(BUSINESS_CONFIG.hindiBrandName, BUSINESS_CONFIG.brandName)}
              </span>
              <span className="block truncate text-xs text-stone-500 leading-tight">
                {t(BUSINESS_CONFIG.location.displayAddress, BUSINESS_CONFIG.location.addressSummary)}
              </span>
            </span>
          </button>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Main">
            {NAV_LINKS.map((link) => {
              const active = activeView === 'PUBLIC' && publicPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => go(link.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    active ? 'bg-brand-50 text-brand-800' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  {t(link.labelHi, link.labelEn)}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <a href={whatsappLink(enquiryMessage)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp hidden sm:inline-flex">
              <MessageCircle className="w-4 h-4" aria-hidden />
              WhatsApp
            </a>
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden rounded-md p-2 text-stone-700 hover:bg-stone-100"
              aria-label={t('मेन्यू खोलें', 'Open menu')}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-stone-900/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 h-16 border-b border-stone-200">
              <span className="font-semibold text-stone-900">{t('मेन्यू', 'Menu')}</span>
              <button onClick={() => setMobileOpen(false)} className="rounded-md p-2 hover:bg-stone-100" aria-label={t('बंद करें', 'Close menu')}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3" aria-label="Mobile">
              {[...NAV_LINKS, { id: 'DASHBOARD' as PublicPage, labelHi: 'मेरा डैशबोर्ड', labelEn: 'My dashboard' }].map((link) => {
                const active = activeView === 'PUBLIC' && publicPage === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => go(link.id)}
                    className={`block w-full rounded-lg px-4 py-3 text-left text-base font-medium ${
                      active ? 'bg-brand-50 text-brand-800' : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {t(link.labelHi, link.labelEn)}
                  </button>
                );
              })}
            </nav>
            <div className="border-t border-stone-200 p-5 space-y-3">
              <a href={whatsappLink(enquiryMessage)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
              <a href={`tel:${contacts.rawPhone || contacts.phone}`} className="btn-secondary w-full">
                <Phone className="w-4 h-4" /> {contacts.phone}
              </a>
              <div className="flex items-center justify-between pt-1 text-sm">
                <button onClick={toggleLanguage} className="inline-flex items-center gap-1.5 text-stone-600">
                  <Languages className="w-4 h-4" /> {language === 'HI' ? 'English' : 'हिंदी'}
                </button>
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      setActiveView('ADMIN');
                      setMobileOpen(false);
                    }}
                    className="text-stone-600"
                  >
                    {t('एडमिन पैनल', 'Admin panel')}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setActiveView('LOGIN');
                      setMobileOpen(false);
                    }}
                    className="text-stone-600"
                  >
                    {t('स्टाफ लॉगिन', 'Staff login')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
