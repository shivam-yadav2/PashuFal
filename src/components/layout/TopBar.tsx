import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { BUSINESS_CONFIG } from '../../config/business';

export type PublicPage = 'HOME' | 'ANIMALS' | 'BULK_ORDER' | 'TRANSPORT' | 'DASHBOARD' | 'ABOUT' | 'CONTACT';

interface TopBarProps {
  activeView: 'PUBLIC' | 'ADMIN' | 'LOGIN';
  setActiveView: (view: 'PUBLIC' | 'ADMIN' | 'LOGIN') => void;
  publicPage: PublicPage;
  setPublicPage: (page: PublicPage) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  setActiveView,
  publicPage,
  setPublicPage,
}) => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openWhatsApp = () => {
    const text = encodeURIComponent(
      language === 'HI'
        ? `नमस्ते! मुझे चम्पा डेयरी (लार, देवरिया) से उपलब्ध भैंस और गाय या दूध सप्लाई के बारे में जानकारी चाहिए।`
        : `Hello, I want enquiry regarding buffalo, cow, or fresh milk from Champa Dairy (Lar, Deoria).`
    );
    window.open(`https://wa.me/${BUSINESS_CONFIG.contacts.whatsapp}?text=${text}`, '_blank');
  };

  const navLinks: { id: PublicPage; labelHi: string; labelEn: string }[] = [
    { id: 'HOME', labelHi: 'होम', labelEn: 'Home' },
    { id: 'ANIMALS', labelHi: 'हमारे पशु', labelEn: 'Our Animals' },
    { id: 'BULK_ORDER', labelHi: 'बल्क ऑर्डर', labelEn: 'Bulk Order' },
    { id: 'TRANSPORT', labelHi: 'ट्रांसपोर्ट', labelEn: 'Transport' },
    { id: 'ABOUT', labelHi: 'हमारे बारे में', labelEn: 'About Us' },
    { id: 'CONTACT', labelHi: 'संपर्क करें', labelEn: 'Contact Us' },
  ];

  const handleNavClick = (page: PublicPage) => {
    setActiveView('PUBLIC');
    setPublicPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-slate-200">
      
      {/* 1. TOP GREEN BAR MATCHING COLLAGE */}
      <div className="bg-[#0F241A] text-slate-200 text-xs py-2 px-4 lg:px-8 border-b border-emerald-950 font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Left Contact Info */}
          <div className="flex items-center gap-4 sm:gap-6 text-[11px] sm:text-xs">
            <a
              href={`tel:${BUSINESS_CONFIG.contacts.phone}`}
              className="flex items-center gap-1.5 hover:text-amber-300 transition-colors"
            >
              <span className="text-emerald-400">📞</span>
              <span className="font-mono font-bold text-white">{BUSINESS_CONFIG.contacts.phone}</span>
            </a>
            <span className="text-emerald-800 hidden xs:inline">|</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-stone-300">
              <span className="text-emerald-400">✉</span>
              <span>info@purvanchaldairy.in</span>
            </span>
            <span className="text-emerald-800 hidden md:inline">|</span>
            <span className="hidden md:inline-flex items-center gap-1 text-amber-300 font-semibold text-[11px]">
              <span>📍</span>
              <span>{t('लार, देवरिया (उ.प्र.)', 'Lar, Deoria (UP)')}</span>
            </span>
          </div>

          {/* Right Action Tools: Language + Dashboard + Login */}
          <div className="flex items-center gap-3 text-[11px] sm:text-xs">
            
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              title={language === 'HI' ? 'Switch to English' : 'हिंदी में बदलें'}
              className="flex items-center gap-1 hover:text-amber-300 transition-colors cursor-pointer text-slate-300"
            >
              <span>🌐</span>
              <span className="font-bold">{language === 'HI' ? 'English' : 'हिंदी'}</span>
            </button>

            <span className="text-emerald-800">|</span>

            {/* Customer Dashboard Link */}
            <button
              onClick={() => handleNavClick('DASHBOARD')}
              className={`hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1 font-bold ${
                publicPage === 'DASHBOARD' ? 'text-amber-300' : 'text-slate-300'
              }`}
            >
              <span>👤</span>
              <span className="hidden xs:inline">{t('माय डैशबोर्ड', 'My Dashboard')}</span>
              <span className="xs:hidden">{t('डैशबोर्ड', 'Portal')}</span>
            </button>

            <span className="text-emerald-800">|</span>

            {/* Authentic Staff/Admin Portal */}
            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-1.5 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                <button
                  onClick={() => setActiveView(activeView === 'ADMIN' ? 'PUBLIC' : 'ADMIN')}
                  className="font-bold text-amber-300 hover:text-amber-200 cursor-pointer"
                >
                  {activeView === 'ADMIN' ? t('← स्टोर', '← Store') : t('⚙️ एडमिन', '⚙️ Admin')}
                </button>
                <button
                  onClick={logout}
                  title={t('लॉगआउट', 'Sign Out')}
                  className="text-stone-400 hover:text-rose-300 cursor-pointer text-[10px]"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveView('LOGIN')}
                className="hover:text-amber-300 transition-colors font-bold text-slate-300 cursor-pointer flex items-center gap-1"
              >
                <span>🔒</span>
                <span>{t('स्टाफ लॉगिन', 'Staff Login')}</span>
              </button>
            )}

          </div>

        </div>
      </div>

      {/* 2. MAIN NAVIGATION BAR MATCHING COLLAGE */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        
        {/* Brand Wordmark & Cow Emblem */}
        <button
          onClick={() => handleNavClick('HOME')}
          className="flex items-center gap-3 text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#0F241A] text-amber-300 flex items-center justify-center font-black text-xl shadow-xs group-hover:scale-105 transition-transform shrink-0 border border-emerald-800">
            च
          </div>
          <div>
            <span className="text-sm sm:text-base font-black text-[#0F241A] tracking-tight block leading-tight">
              {t('Purvanchal Dairy Pashu Kendra', 'Purvanchal Dairy Pashu Kendra')}
            </span>
            <span className="text-[11px] font-semibold text-emerald-800 block leading-tight">
              {t('दादी चम्पा फार्म · लार, देवरिया (उ.प्र.)', 'Quality Cows & Buffaloes at Your Doorstep')}
            </span>
          </div>
        </button>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-700">
          {navLinks.map((link) => {
            const isActive = activeView === 'PUBLIC' && publicPage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`transition-all py-1 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-[#0F241A] font-black border-b-2 border-[#0F241A]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t(link.labelHi, link.labelEn)}
              </button>
            );
          })}
        </nav>

        {/* Right CTA: Glowing WhatsApp Button matching collage */}
        <div className="flex items-center gap-3">
          <button
            onClick={openWhatsApp}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <span>💬</span>
            <span>{t('Chat on WhatsApp', 'Chat on WhatsApp')}</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
            aria-label="Toggle navigation"
          >
            ☰
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-2 shadow-lg">
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                  activeView === 'PUBLIC' && publicPage === link.id
                    ? 'bg-[#0F241A] text-amber-300 font-black'
                    : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
                }`}
              >
                {t(link.labelHi, link.labelEn)}
              </button>
            ))}
            <button
              onClick={() => handleNavClick('DASHBOARD')}
              className={`p-2.5 rounded-xl text-left transition-colors cursor-pointer col-span-2 ${
                activeView === 'PUBLIC' && publicPage === 'DASHBOARD'
                  ? 'bg-[#0F241A] text-amber-300 font-black'
                  : 'bg-emerald-50 text-emerald-950 hover:bg-emerald-100'
              }`}
            >
              👤 {t('माय डैशबोर्ड (Customer Portal)', 'My Dashboard')}
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={openWhatsApp}
              className="text-emerald-800 font-bold text-xs flex items-center gap-1.5"
            >
              <span>💬</span>
              <span>WhatsApp: 9792820684</span>
            </button>
            <button
              onClick={toggleLanguage}
              className="text-xs font-bold text-slate-700 underline"
            >
              {language === 'HI' ? 'Switch to English' : 'हिंदी'}
            </button>
          </div>
        </div>
      )}

    </header>
  );
};
