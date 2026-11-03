import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { BUSINESS_CONFIG } from '../../config/business';
import { Lock, User, ArrowLeft, ArrowRight, Eye, EyeOff, Globe, ShieldCheck } from 'lucide-react';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onBackToStorefront: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onBackToStorefront,
}) => {
  const { login } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError(t('कृपया यूज़रनेम और पासवर्ड दोनों दर्ज करें', 'Please enter both username and password'));
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = login(username, password);
      setLoading(false);
      if (res.success) {
        onLoginSuccess();
      } else {
        setError(res.error || t('गलत क्रेडेंशियल्स', 'Invalid credentials'));
      }
    }, 300);
  };

  const handleQuickFill = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Top brand & language toggle */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onBackToStorefront}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('स्टोर पर वापस जाएं', 'Back to Store')}</span>
          </button>

          <button
            onClick={toggleLanguage}
            className="px-2.5 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'HI' ? 'English' : 'हिंदी'}</span>
          </button>
        </div>

        {/* Card */}
        <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl border border-slate-200/90 shadow-sm">
          
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0F241A] text-amber-300 font-bold text-2xl shadow-sm mb-3">
              च
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {BUSINESS_CONFIG.brandName}
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {t('प्रशासन एवं फार्म प्रबंधन पोर्टल', 'Admin & Operations Portal')}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <span className="shrink-0 font-bold">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t('यूज़रनेम', 'Username')}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="parmeshwar / manager"
                  autoComplete="username"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F241A] focus:border-transparent text-sm text-slate-900 font-medium bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t('पासवर्ड', 'Password')}
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>{t('छुपाएं', 'Hide')}</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>{t('दिखाएं', 'Show')}</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F241A] focus:border-transparent text-sm text-slate-900 font-medium bg-slate-50/50 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl font-bold text-sm text-amber-300 bg-[#0F241A] hover:bg-[#1a382e] active:scale-[0.99] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
                  <span>{t('जाँच हो रही है...', 'Signing in...')}</span>
                </>
              ) : (
                <>
                  <span>{t('लॉगिन करें', 'Sign In')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
              {t('त्वरित डेमो लॉगिन', 'Quick Demo Access')}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('parmeshwar', 'admin123')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>{t('मालिक', 'Owner')}</span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1 py-0.2 rounded font-mono font-medium">demo</span>
                </div>
                <div className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
                  Parmeshwar Kushwaha
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('manager', 'lar2026')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>{t('मैनेजर', 'Manager')}</span>
                  <span className="text-[10px] text-slate-700 bg-slate-200 px-1 py-0.2 rounded font-mono font-medium">demo</span>
                </div>
                <div className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
                  Arun / Manager
                </div>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('सुरक्षित आंतरिक पोर्टल', 'Secure internal portal')}</span>
          </div>
        </div>

        {/* Footer address */}
        <p className="mt-6 text-center text-xs text-slate-500">
          {BUSINESS_CONFIG.location.displayAddress} · Helpline: {BUSINESS_CONFIG.contacts.phone}
        </p>
      </div>
    </div>
  );
};
