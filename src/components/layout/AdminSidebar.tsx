import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { BUSINESS_CONFIG } from '../../config/business';
import { 
  LayoutDashboard, 
  Warehouse, 
  MessageSquareText, 
  Truck, 
  Milk, 
  Send, 
  Wallet, 
  Users, 
  ScrollText, 
  Settings, 
  LogOut, 
  Globe,
  ChevronLeft,
  ChevronRight,
  Phone
} from 'lucide-react';

export type AdminViewPage = 
  | 'OVERVIEW'
  | 'LIVESTOCK'
  | 'ENQUIRIES'
  | 'ORDERS'
  | 'MILK_COLLECTION'
  | 'DELIVERIES'
  | 'FINANCE'
  | 'CONTACTS'
  | 'AUDIT'
  | 'SETTINGS';

interface AdminSidebarProps {
  currentPage: AdminViewPage;
  onSelectPage: (page: AdminViewPage) => void;
  onExitToStorefront: () => void;
  counts: {
    pendingEnquiries: number;
    activeOrders: number;
    availableCattle: number;
    pendingDeliveries: number;
  };
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentPage,
  onSelectPage,
  onExitToStorefront,
  counts,
  collapsed = false,
  onToggleCollapse,
}) => {
  const { currentUser, logout, isOwner } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();

  const navItems: {
    id: AdminViewPage;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'OVERVIEW',
      label: t('डैशबोर्ड', 'Overview'),
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'LIVESTOCK',
      label: t('पशु शेड सूची', 'Livestock Inventory'),
      icon: <Warehouse className="w-4 h-4 shrink-0" />,
      badge: counts.availableCattle,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    },
    {
      id: 'ENQUIRIES',
      label: t('पूछताछ व लीड्स', 'Direct Enquiries'),
      icon: <MessageSquareText className="w-4 h-4 shrink-0" />,
      badge: counts.pendingEnquiries,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'ORDERS',
      label: t('ऑर्डर व परिवहन', 'Orders & Logistics'),
      icon: <Truck className="w-4 h-4 shrink-0" />,
      badge: counts.activeOrders > 0 ? counts.activeOrders : undefined,
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    },
    {
      id: 'MILK_COLLECTION',
      label: t('दूध संकलन रजिस्टर', 'Milk Procurement'),
      icon: <Milk className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'DELIVERIES',
      label: t('दैनिक दूध वितरण', 'Daily Deliveries'),
      icon: <Send className="w-4 h-4 shrink-0" />,
      badge: counts.pendingDeliveries > 0 ? counts.pendingDeliveries : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    },
    {
      id: 'FINANCE',
      label: t('वित्तीय खाता', 'Financial Ledger'),
      icon: <Wallet className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'CONTACTS',
      label: t('ग्राहक व किसान', 'Directory & Contacts'),
      icon: <Users className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'AUDIT',
      label: t('ऑडिट लॉग्स', 'Audit Trail'),
      icon: <ScrollText className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'SETTINGS',
      label: t('मास्टर सेटिंग्स', 'Farm Settings'),
      icon: <Settings className="w-4 h-4 shrink-0" />,
    },
  ];

  return (
    <aside
      className={`bg-[#0F241A] text-slate-200 flex flex-col border-r border-emerald-950/80 transition-all duration-200 select-none ${
        collapsed ? 'w-20' : 'w-64'
      } shrink-0 min-h-screen z-30 font-sans`}
    >
      {/* 1. Brand Header */}
      <div className="p-4 border-b border-emerald-900/40 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-black text-lg flex items-center justify-center shrink-0 shadow-sm">
            च
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold text-white tracking-tight truncate">
                {BUSINESS_CONFIG.brandName}
              </h2>
              <p className="text-[10px] text-emerald-400 font-medium truncate">
                {BUSINESS_CONFIG.location.displayAddress}
              </p>
            </div>
          )}
        </div>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title={collapsed ? t('बड़ा करें', 'Expand sidebar') : t('छोटा करें', 'Collapse sidebar')}
            className="p-1.5 rounded-lg hover:bg-emerald-900/60 text-slate-400 hover:text-white transition-colors hidden lg:block cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* 2. Logged-in Staff & Language Quick Switcher */}
      <div className="p-3 border-b border-emerald-900/30 flex items-center justify-between gap-2">
        {!collapsed && currentUser && (
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold text-white truncate">
                {currentUser.name}
              </span>
            </div>
            <span className="text-[10px] text-amber-300 font-medium block">
              {currentUser.role === 'OWNER' ? t('मालिक', 'Proprietor') : t('मैनेजर', 'Manager')}
            </span>
          </div>
        )}

        {/* Language switch button */}
        <button
          onClick={toggleLanguage}
          title={t('भाषा बदलें', 'Switch language')}
          className="px-2.5 py-1 rounded-md bg-emerald-900/70 hover:bg-emerald-800 text-amber-300 text-xs font-bold transition-colors cursor-pointer border border-emerald-700/50 flex items-center gap-1.5 ml-auto"
        >
          <Globe className="w-3.5 h-3.5 text-amber-300" />
          <span>{language === 'HI' ? 'EN' : 'हिं'}</span>
        </button>
      </div>

      {/* 3. Navigation Links List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className={`px-2 py-1 text-[10px] font-bold text-emerald-500 uppercase tracking-wider ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? '•••' : t('मेन्यू', 'Menu')}
        </div>

        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:bg-emerald-900/40 hover:text-white font-medium text-xs'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className={isActive ? 'text-slate-950' : 'text-slate-400'}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="text-xs truncate tracking-tight">
                    {item.label}
                  </span>
                )}
              </div>

              {!collapsed && item.badge !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold shrink-0 ${
                    isActive ? 'bg-slate-950 text-amber-300' : item.badgeColor || 'bg-emerald-900 text-emerald-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Bottom Actions: Storefront & Logout */}
      <div className="p-3 border-t border-emerald-900/40 space-y-2">
        <button
          onClick={onExitToStorefront}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-900/50 hover:bg-emerald-800/60 text-slate-200 text-xs font-semibold transition-colors border border-emerald-800/50 cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5" />
          {!collapsed && <span>{t('स्टोर देखें', 'View Storefront')}</span>}
        </button>

        <div className="flex items-center justify-between gap-2 pt-1">
          {!collapsed && (
            <a
              href={`tel:${BUSINESS_CONFIG.contacts.phone}`}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              <span>{BUSINESS_CONFIG.contacts.phone}</span>
            </a>
          )}
          <button
            onClick={logout}
            title={t('लॉगआउट', 'Sign Out')}
            className="p-1.5 rounded-lg hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer ml-auto"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
