import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppLanguage = 'HI' | 'EN';

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  toggleLanguage: () => void;
  t: (hiText: string, enText: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANG_STORAGE_KEY = 'champa_app_lang';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'EN' || saved === 'HI') return saved;
    } catch {
      // ignore
    }
    return 'HI'; // Default to Hindi as per user context
  });

  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, language);
    } catch {
      // ignore
    }
  }, [language]);

  const setLanguage = (lang: AppLanguage) => setLanguageState(lang);
  const toggleLanguage = () => setLanguageState(l => l === 'HI' ? 'EN' : 'HI');

  // Simple bilingual translation helper
  const t = (hiText: string, enText: string): string => {
    return language === 'HI' ? hiText : enText;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
