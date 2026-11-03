import React, { useState } from 'react';
import { 
  Animal, 
  Contact, 
  LivestockTransaction, 
  MilkCollectionEntry, 
  MilkProductionEntry, 
  DeliverySubscription, 
  MilkDelivery, 
  PaymentRecord, 
  AuditEvent,
  Enquiry,
  EnquiryStatus,
  LivestockOrder
} from '../../types/domain';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatINR, formatINRExact, formatLitres } from '../../lib/currency';
import { getTodayBusinessDate, formatDateTime } from '../../lib/dates';
import { BUSINESS_CONFIG } from '../../config/business';
import { AdminSidebar, AdminViewPage } from '../../components/layout/AdminSidebar';
import { AddEditAnimalModal } from '../../components/livestock/AddEditAnimalModal';
import { ReservationModal } from '../../components/livestock/ReservationModal';
import { CompleteSaleModal } from '../../components/livestock/CompleteSaleModal';
import { MilkCollectionModal } from '../../components/dairy/MilkCollectionModal';
import { OwnProductionModal } from '../../components/dairy/OwnProductionModal';
import { NewContactModal } from '../../components/contacts/NewContactModal';
import { AnimalDetailModal } from '../../components/livestock/AnimalDetailModal';
import { 
  RefreshCw, 
  Globe, 
  Plus, 
  Search, 
  Download, 
  Eye, 
  Edit3, 
  CheckCircle2, 
  Phone, 
  MessageSquare, 
  ExternalLink,
  Truck,
  Filter,
  Milk,
  Wallet
} from 'lucide-react';

interface AdminDashboardProps {
  animals: Animal[];
  contacts: Contact[];
  transactions: LivestockTransaction[];
  productionEntries: MilkProductionEntry[];
  collectionEntries: MilkCollectionEntry[];
  subscriptions: DeliverySubscription[];
  deliveries: MilkDelivery[];
  payments: PaymentRecord[];
  auditLogs: AuditEvent[];
  reconciliation: any;
  financialSummary: any;
  enquiries?: Enquiry[];
  orders?: LivestockOrder[];
  onRefresh: () => Promise<void>;
  onExitToStorefront?: () => void;
  onSaveAnimal: (data: Partial<Animal>) => Promise<void>;
  onReserveAnimal: (id: string, deposit: number, contactId: string) => Promise<void>;
  onReleaseReservation: (id: string) => Promise<void>;
  onCompleteSale: (id: string, buyerContactId: string, agreedPrice: number, notes?: string) => Promise<void>;
  onAddCollection: (entry: Partial<MilkCollectionEntry>) => Promise<void>;
  onAddProduction: (entry: Partial<MilkProductionEntry>) => Promise<void>;
  onAddContact: (contact: Partial<Contact>) => Promise<void>;
  onGenerateDeliveries: (date: string, shift: 'MORNING' | 'EVENING') => Promise<void>;
  onUpdateDeliveryStatus: (id: string, status: string, actualLitres?: number, skipReason?: string) => Promise<void>;
  onUpdateEnquiryStatus?: (id: string, status: EnquiryStatus, notes?: string, quotationAmount?: number, transportQuotation?: number, assignedStaff?: string) => Promise<void>;
  onUpdateOrderStatus?: (id: string, status: EnquiryStatus, deliveryStatus?: any, transporterDetails?: string) => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  animals,
  contacts,
  transactions,
  productionEntries,
  collectionEntries,
  subscriptions,
  deliveries,
  payments,
  auditLogs,
  reconciliation,
  financialSummary,
  enquiries = [],
  orders = [],
  onRefresh,
  onExitToStorefront,
  onSaveAnimal,
  onReserveAnimal,
  onReleaseReservation,
  onCompleteSale,
  onAddCollection,
  onAddProduction,
  onAddContact,
  onGenerateDeliveries,
  onUpdateDeliveryStatus,
  onUpdateEnquiryStatus,
  onUpdateOrderStatus,
}) => {
  const { role, currentUser } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const [currentPage, setCurrentPage] = useState<AdminViewPage>('OVERVIEW');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayBusinessDate());
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [showAddAnimal, setShowAddAnimal] = useState(false);
  const [animalToEdit, setAnimalToEdit] = useState<Animal | null>(null);
  const [animalToInspect, setAnimalToInspect] = useState<Animal | null>(null);
  const [animalToReserve, setAnimalToReserve] = useState<Animal | null>(null);
  const [animalToSell, setAnimalToSell] = useState<Animal | null>(null);
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [showAddProduction, setShowAddProduction] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);

  // Filters
  const [livestockSearch, setLivestockSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<'ALL' | 'COW' | 'BUFFALO'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Enquiry Modal
  const [selectedEnquiryForAction, setSelectedEnquiryForAction] = useState<Enquiry | null>(null);
  const [actionStatus, setActionStatus] = useState<EnquiryStatus>('QUOTATION_SENT');
  const [actionQuotationAmount, setActionQuotationAmount] = useState('');
  const [actionTransportQuote, setActionTransportQuote] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [actionStaff, setActionStaff] = useState('Parmeshwar Kushwaha (Owner)');
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState<string>('ALL');

  // Order Logistics Modal
  const [selectedOrderForAction, setSelectedOrderForAction] = useState<LivestockOrder | null>(null);
  const [orderDeliveryStatus, setOrderDeliveryStatus] = useState<'PENDING_VET' | 'VET_PASSED' | 'TRANSPORT_ASSIGNED' | 'DISPATCHED' | 'DELIVERED'>('TRANSPORT_ASSIGNED');
  const [orderTransporterNotes, setOrderTransporterNotes] = useState('');

  // Delivery
  const [deliveryShift, setDeliveryShift] = useState<'MORNING' | 'EVENING'>('MORNING');

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setRefreshing(false), 300);
    }
  };

  const handleExportLivestockCSV = () => {
    const headers = ['Tag ID', 'Species', 'Breed', 'Status', 'Daily Milk (L)', 'Price Min', 'Price Max'];
    const rows = animals.map(a => [
      a.id,
      a.species,
      a.breed,
      a.listing.status,
      a.reportedMilkYieldLpd || '',
      a.listing.priceMin,
      a.listing.priceMax,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `champa_livestock_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered livestock
  const filteredLivestock = animals.filter((a) => {
    if (livestockSearch.trim()) {
      const q = livestockSearch.toLowerCase();
      const matchId = a.id.toLowerCase().includes(q);
      const matchBreed = a.breed.toLowerCase().includes(q);
      const matchDesc = a.listing.description?.toLowerCase().includes(q);
      if (!matchId && !matchBreed && !matchDesc) return false;
    }
    if (speciesFilter !== 'ALL' && a.species !== speciesFilter) return false;
    if (statusFilter !== 'ALL' && a.listing.status !== statusFilter) return false;
    return true;
  });

  // Filtered enquiries
  const filteredEnquiries = enquiries.filter(e => {
    if (enquiryStatusFilter !== 'ALL' && e.status !== enquiryStatusFilter) return false;
    return true;
  });

  // Computed counts
  const availableAnimals = animals.filter(a => a.listing.status === 'AVAILABLE');
  const reservedAnimals = animals.filter(a => a.listing.status === 'RESERVED');
  const soldAnimals = animals.filter(a => a.listing.status === 'SOLD');

  const pendingEnquiriesCount = enquiries.filter(e => 
    e.status === 'NEW_ENQUIRY' || e.status === 'CONTACTED' || e.status === 'REQUIREMENT_CONFIRMED' || e.status === 'QUOTATION_SENT'
  ).length;

  const activeOrdersCount = orders.filter(o => 
    o.deliveryStatus === 'TRANSPORT_ASSIGNED' || o.deliveryStatus === 'DISPATCHED'
  ).length;

  const todayDeliveries = deliveries.filter(d => d.businessDate === selectedDate);
  const pendingDeliveriesCount = todayDeliveries.filter(d => d.status === 'PLANNED' || d.status === 'PREPARED').length;
  const deliveredLitres = todayDeliveries
    .filter(d => d.status === 'DELIVERED' || d.status === 'PARTIALLY_DELIVERED')
    .reduce((sum, d) => sum + d.actualDeliveredLitres, 0);
  const scheduledLitres = todayDeliveries.reduce((sum, d) => sum + d.scheduledQuantityLitres, 0);

  const totalOwnMilkToday = productionEntries
    .filter(p => p.businessDate === selectedDate)
    .reduce((sum, p) => sum + p.quantityLitres, 0);

  const totalProcuredMilkToday = collectionEntries
    .filter(c => c.businessDate === selectedDate)
    .reduce((sum, c) => sum + c.acceptedLitres, 0);

  const totalFarmerPayableToday = collectionEntries
    .filter(c => c.businessDate === selectedDate)
    .reduce((sum, c) => sum + c.totalCost, 0);

  const pageTitleMap: Record<AdminViewPage, { hi: string; en: string }> = {
    OVERVIEW: { hi: 'डैशबोर्ड', en: 'Dashboard' },
    LIVESTOCK: { hi: 'पशु इन्वेंट्री', en: 'Livestock Inventory' },
    ENQUIRIES: { hi: 'पूछताछ व लीड्स', en: 'Customer Enquiries' },
    ORDERS: { hi: 'ऑर्डर व वाहन लॉजिस्टिक्स', en: 'Orders & Transport' },
    MILK_COLLECTION: { hi: 'दूध संकलन रजिस्टर', en: 'Milk Procurement' },
    DELIVERIES: { hi: 'दैनिक दूध वितरण', en: 'Daily Deliveries' },
    FINANCE: { hi: 'वित्तीय खाता', en: 'Financial Ledger' },
    CONTACTS: { hi: 'ग्राहक व किसान निर्देशिका', en: 'Directory & Contacts' },
    AUDIT: { hi: 'ऑडिट लॉग्स', en: 'Audit Trail' },
    SETTINGS: { hi: 'मास्टर सेटिंग्स', en: 'Farm Settings' },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-x-hidden text-slate-900 font-sans">
      
      {/* Sidebar */}
      <AdminSidebar
        currentPage={currentPage}
        onSelectPage={(page) => setCurrentPage(page)}
        onExitToStorefront={() => onExitToStorefront ? onExitToStorefront() : window.location.reload()}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        counts={{
          pendingEnquiries: pendingEnquiriesCount,
          activeOrders: activeOrdersCount,
          availableCattle: availableAnimals.length,
          pendingDeliveries: pendingDeliveriesCount,
        }}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Clean Header Bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                  {role === 'OWNER' ? t('मालिक कंसोल', 'Owner Console') : t('मैनेजर', 'Manager')}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {currentUser?.name}
                </span>
              </div>
              <h1 className="text-lg lg:text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                {t(pageTitleMap[currentPage].hi, pageTitleMap[currentPage].en)}
              </h1>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            {/* Date Picker */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-slate-500 text-[11px] font-medium">{t('दिनांक', 'Date')}:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent font-mono font-bold text-slate-900 border-none outline-none text-xs cursor-pointer"
              />
            </div>

            {/* Refresh */}
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              title={t('रिफ्रेश करें', 'Refresh data')}
              className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer text-xs flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              title={t('भाषा बदलें', 'Switch language')}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{language === 'HI' ? 'EN' : 'हिं'}</span>
            </button>

            {/* Primary Action Button Based on Page */}
            {currentPage === 'LIVESTOCK' && (
              <button
                onClick={() => {
                  setAnimalToEdit(null);
                  setShowAddAnimal(true);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#0F241A] hover:bg-[#1a382e] text-amber-300 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('नया पशु जोड़ें', 'Add Animal')}</span>
              </button>
            )}

            {currentPage === 'MILK_COLLECTION' && (
              <button
                onClick={() => setShowAddCollection(true)}
                className="px-3.5 py-1.5 rounded-lg bg-[#0F241A] hover:bg-[#1a382e] text-amber-300 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('दूध खरीद दर्ज करें', 'Add Procurement')}</span>
              </button>
            )}

            {currentPage === 'CONTACTS' && (
              <button
                onClick={() => setShowAddContact(true)}
                className="px-3.5 py-1.5 rounded-lg bg-[#0F241A] hover:bg-[#1a382e] text-amber-300 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('नया संपर्क', 'New Contact')}</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 lg:p-6 space-y-6 max-w-7xl">
          
          {/* ========================================================= */}
          {/* 1. OVERVIEW                                               */}
          {/* ========================================================= */}
          {currentPage === 'OVERVIEW' && (
            <div className="space-y-6">
              
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Available animals */}
                <div 
                  onClick={() => setCurrentPage('LIVESTOCK')}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-emerald-600 transition-all cursor-pointer shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {t('उपलब्ध पशु', 'Available Animals')}
                    </span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold">
                      {t('स्टॉक', 'In Stock')}
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {availableAnimals.length}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      / {animals.length} {t('कुल', 'Total')}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-600 flex items-center justify-between border-t border-slate-100 pt-2 font-medium">
                    <span>{t('आरक्षित', 'Reserved')}: {reservedAnimals.length}</span>
                    <span>{t('बिक्री', 'Sold')}: {soldAnimals.length}</span>
                  </div>
                </div>

                {/* Enquiries */}
                <div 
                  onClick={() => setCurrentPage('ENQUIRIES')}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-amber-600 transition-all cursor-pointer shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {t('पूछताछ व लीड्स', 'Direct Enquiries')}
                    </span>
                    <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-xs font-bold">
                      {t('सक्रिय', 'Active')}
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {pendingEnquiriesCount}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {t('ओपन लीड्स', 'Open Leads')}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-600 flex items-center justify-between border-t border-slate-100 pt-2 font-medium">
                    <span>{t('ऑर्डर्स', 'Orders')}: {orders.length}</span>
                    <span className="text-emerald-700 font-semibold">{t('देखें →', 'View →')}</span>
                  </div>
                </div>

                {/* Daily Milk */}
                <div 
                  onClick={() => setCurrentPage('MILK_COLLECTION')}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-blue-600 transition-all cursor-pointer shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {t('आज दूध उपलब्धता', "Today's Milk")}
                    </span>
                    <span className="text-blue-800 bg-blue-50 px-2 py-0.5 rounded text-xs font-bold">
                      {t('लीटर', 'Litres')}
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {formatLitres(totalOwnMilkToday + totalProcuredMilkToday)}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-600 flex items-center justify-between border-t border-slate-100 pt-2 font-medium">
                    <span>{t('फार्म', 'Farm')}: {formatLitres(totalOwnMilkToday)}</span>
                    <span>{t('खरीद', 'Purchased')}: {formatLitres(totalProcuredMilkToday)}</span>
                  </div>
                </div>

                {/* Deliveries */}
                <div 
                  onClick={() => setCurrentPage('DELIVERIES')}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-purple-600 transition-all cursor-pointer shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {t('आज दूध वितरण', 'Deliveries')}
                    </span>
                    <span className="text-purple-800 bg-purple-50 px-2 py-0.5 rounded text-xs font-bold">
                      {t('स्टेटस', 'Status')}
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {formatLitres(deliveredLitres)}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      / {formatLitres(scheduledLitres)}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-600 flex items-center justify-between border-t border-slate-100 pt-2 font-medium">
                    <span>{t('लंबित', 'Pending')}: {pendingDeliveriesCount}</span>
                    <span className="text-purple-700 font-semibold">{t('रूट देखें →', 'Routes →')}</span>
                  </div>
                </div>

              </div>

              {/* Milk Balance Sheet */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      {t('दैनिक दूध स्टॉक मिलान', 'Daily Milk Stock & Flow')}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {t('फार्म उत्पादन, खरीद व वितरण का ऑडिट', 'Audit of production, procurement, and distribution')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAddProduction(true)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer"
                    >
                      + {t('स्वयं दुहाई', 'Farm Milking')}
                    </button>
                    <button
                      onClick={() => setShowAddCollection(true)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#0F241A] text-amber-300 hover:bg-[#1a382e] transition-colors cursor-pointer"
                    >
                      + {t('दूध खरीद', 'Procure Milk')}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      {t('ओपनिंग स्टॉक', 'Opening Stock')}
                    </span>
                    <span className="text-lg font-bold font-mono text-slate-900 block mt-1">
                      {formatLitres(reconciliation?.openingStock || 0)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      {t('कुल आवक', 'Total Inflow')}
                    </span>
                    <span className="text-lg font-bold font-mono text-emerald-950 block mt-1">
                      {formatLitres((reconciliation?.ownProduction || 0) + (reconciliation?.purchasedAccepted || 0))}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                      {t('कुल उपलब्ध', 'Available')}
                    </span>
                    <span className="text-lg font-bold font-mono text-blue-950 block mt-1">
                      {formatLitres(reconciliation?.totalAvailable || 0)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200">
                    <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
                      {t('कुल वितरित', 'Distributed')}
                    </span>
                    <span className="text-lg font-bold font-mono text-purple-950 block mt-1">
                      {formatLitres(reconciliation?.soldQuantity || 0)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 col-span-2 md:col-span-1">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                      {t('क्लोजिंग स्टॉक', 'Closing Stock')}
                    </span>
                    <span className="text-lg font-bold font-mono text-amber-950 block mt-1">
                      {formatLitres(reconciliation?.closingStock || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Enquiries & Active Orders Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Enquiries */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      {t('प्राथमिकता पूछताछ', 'Priority Leads')}
                    </h3>
                    <button
                      onClick={() => setCurrentPage('ENQUIRIES')}
                      className="text-xs text-[#0F241A] font-bold hover:underline"
                    >
                      {t('सभी देखें →', 'View all →')}
                    </button>
                  </div>

                  {enquiries.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      {t('कोई नई पूछताछ नहीं है', 'No enquiries yet')}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {enquiries.slice(0, 4).map(enq => (
                        <div key={enq.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">{enq.customerName}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{enq.phone}</span>
                            </div>
                            <p className="text-xs text-slate-600 truncate mt-0.5">
                              {enq.additionalInstructions || `${enq.requestedQuantity || 1} पशु`} · {enq.deliveryLocation || 'देवरिया'}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <a
                              href={`https://wa.me/91${enq.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`नमस्ते ${enq.customerName} जी, आपके चम्पा डेयरी एवं पशु केंद्र के अनुरोध के संबंध में:`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                              title="WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => {
                                setSelectedEnquiryForAction(enq);
                                setActionStatus(enq.status);
                                setActionNotes(enq.quotationNotes || '');
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold"
                            >
                              {t('कोट', 'Quote')}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Orders */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      {t('सक्रिय पशु ट्रांसपोर्ट', 'Active Transport Orders')}
                    </h3>
                    <button
                      onClick={() => setCurrentPage('ORDERS')}
                      className="text-xs text-[#0F241A] font-bold hover:underline"
                    >
                      {t('सभी देखें →', 'View all →')}
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      {t('कोई सक्रिय ऑर्डर नहीं है', 'No active orders')}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {orders.slice(0, 4).map(ord => (
                        <div key={ord.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">{ord.customerName}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                                {ord.deliveryStatus}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 truncate mt-0.5">
                              {ord.deliveryAddress} · {ord.animalIds.length} {t('पशु', 'Cattle')}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedOrderForAction(ord);
                              setOrderDeliveryStatus(ord.deliveryStatus);
                              setOrderTransporterNotes(ord.transporterDetails || '');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold shrink-0"
                          >
                            {t('ट्रैकिंग', 'Track')}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* 2. LIVESTOCK MANAGEMENT                                   */}
          {/* ========================================================= */}
          {currentPage === 'LIVESTOCK' && (
            <div className="space-y-4">
              
              {/* Toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={livestockSearch}
                    onChange={(e) => setLivestockSearch(e.target.value)}
                    placeholder={t('टैग, नस्ल या विवरण खोजें...', 'Search tag, breed, description...')}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#0F241A]"
                  />
                </div>

                {/* Filter Controls */}
                <div className="flex items-center gap-2">
                  <select
                    value={speciesFilter}
                    onChange={(e: any) => setSpeciesFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white text-slate-700"
                  >
                    <option value="ALL">{t('सभी नस्लें (All)', 'All Species')}</option>
                    <option value="BUFFALO">{t('भैंस (Buffalo)', 'Buffalo')}</option>
                    <option value="COW">{t('गाय (Cow)', 'Cow')}</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white text-slate-700"
                  >
                    <option value="ALL">{t('सभी स्टेटस (All)', 'All Statuses')}</option>
                    <option value="AVAILABLE">{t('उपलब्ध (Available)', 'Available')}</option>
                    <option value="RESERVED">{t('आरक्षित (Reserved)', 'Reserved')}</option>
                    <option value="SOLD">{t('बिक्री हो चुकी (Sold)', 'Sold')}</option>
                  </select>

                  <button
                    onClick={handleExportLivestockCSV}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">CSV</span>
                  </button>
                </div>

              </div>

              {/* Livestock Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4">{t('टैग / फोटो', 'Tag / Photo')}</th>
                        <th className="py-3 px-4">{t('प्रजाति व नस्ल', 'Species & Breed')}</th>
                        <th className="py-3 px-4">{t('दूध क्षमता', 'Milk Yield')}</th>
                        <th className="py-3 px-4">{t('कीमत (₹)', 'Price Range')}</th>
                        <th className="py-3 px-4">{t('स्टेटस', 'Status')}</th>
                        <th className="py-3 px-4 text-right">{t('कार्रवाई', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLivestock.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            {t('कोई पशु नहीं मिला', 'No animals found')}
                          </td>
                        </tr>
                      ) : (
                        filteredLivestock.map((animal) => (
                          <tr key={animal.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                {animal.images?.[0]?.url ? (
                                  <img
                                    src={animal.images[0].url}
                                    alt={animal.breed}
                                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                    🐃
                                  </div>
                                )}
                                <div>
                                  <span className="font-mono font-bold text-slate-900 block">
                                    {animal.id}
                                  </span>
                                  <span className="text-[10px] text-slate-500">
                                    {animal.species === 'BUFFALO' ? t('भैंस', 'Buffalo') : t('गाय', 'Cow')}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900 block">
                                {animal.breed}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {animal.lactationNumber ? `${animal.lactationNumber}th ${t('ब्यात', 'Calving')}` : t('ताजा ब्यांत', 'Fresh')}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900 block">
                                {animal.reportedMilkYieldLpd ? `${animal.reportedMilkYieldLpd} L/${t('दिन', 'day')}` : '—'}
                              </span>
                              <span className="text-[10px] text-emerald-700 font-medium">
                                {t('दैनिक क्षमता', 'Daily Capacity')}
                              </span>
                            </td>

                            <td className="py-3 px-4 font-mono font-bold text-slate-900">
                              {formatINR(animal.listing.priceMin)} - {formatINR(animal.listing.priceMax)}
                            </td>

                            <td className="py-3 px-4">
                              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                                animal.listing.status === 'AVAILABLE' 
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                                  : animal.listing.status === 'RESERVED'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-slate-100 text-slate-600 border border-slate-300'
                              }`}>
                                {animal.listing.status === 'AVAILABLE' ? t('उपलब्ध', 'Available') : animal.listing.status === 'RESERVED' ? t('आरक्षित', 'Reserved') : t('बिक्री', 'Sold')}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => setAnimalToInspect(animal)}
                                  title={t('देखें', 'View')}
                                  className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setAnimalToEdit(animal);
                                    setShowAddAnimal(true);
                                  }}
                                  title={t('संपादित करें', 'Edit')}
                                  className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                {animal.listing.status === 'AVAILABLE' && (
                                  <>
                                    <button
                                      onClick={() => setAnimalToReserve(animal)}
                                      className="px-2 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] cursor-pointer"
                                    >
                                      {t('टोकन', 'Token')}
                                    </button>
                                    <button
                                      onClick={() => setAnimalToSell(animal)}
                                      className="px-2 py-1 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[11px] cursor-pointer"
                                    >
                                      {t('बिक्री', 'Sell')}
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* 3. ENQUIRIES                                              */}
          {/* ========================================================= */}
          {currentPage === 'ENQUIRIES' && (
            <div className="space-y-4">
              
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
                <span className="text-xs font-bold text-slate-700">
                  {enquiries.length} {t('कुल पूछताछ', 'Total Enquiries')}
                </span>
                <select
                  value={enquiryStatusFilter}
                  onChange={(e) => setEnquiryStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white text-slate-700"
                >
                  <option value="ALL">{t('सभी स्टेटस', 'All Statuses')}</option>
                  <option value="NEW_ENQUIRY">{t('नई पूछताछ (New)', 'New')}</option>
                  <option value="CONTACTED">{t('बातचीत जारी (Contacted)', 'Contacted')}</option>
                  <option value="QUOTATION_SENT">{t('कोटेशन भेजा (Quoted)', 'Quoted')}</option>
                  <option value="DELIVERED">{t('पूर्ण (Completed)', 'Completed')}</option>
                </select>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4">{t('तारीख', 'Date')}</th>
                        <th className="py-3 px-4">{t('ग्राहक का नाम', 'Customer')}</th>
                        <th className="py-3 px-4">{t('स्थान / गंतव्य', 'Location')}</th>
                        <th className="py-3 px-4">{t('आवश्यकता', 'Requirement')}</th>
                        <th className="py-3 px-4">{t('स्टेटस', 'Status')}</th>
                        <th className="py-3 px-4 text-right">{t('कार्रवाई', 'Action')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredEnquiries.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            {t('कोई पूछताछ नहीं मिली', 'No enquiries found')}
                          </td>
                        </tr>
                      ) : (
                        filteredEnquiries.map(enq => (
                          <tr key={enq.id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4 font-mono text-slate-500">
                              {enq.createdAt.split('T')[0]}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900 block">{enq.customerName}</span>
                              <a href={`tel:${enq.phone}`} className="text-slate-500 font-mono hover:text-slate-900 text-[11px]">
                                {enq.phone}
                              </a>
                            </td>
                            <td className="py-3 px-4 text-slate-700">
                              {enq.deliveryLocation || '—'}
                            </td>
                            <td className="py-3 px-4 text-slate-700">
                              {enq.additionalInstructions || `${enq.requestedQuantity || 1} पशु`}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                {enq.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <a
                                  href={`https://wa.me/91${enq.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  onClick={() => {
                                    setSelectedEnquiryForAction(enq);
                                    setActionStatus(enq.status);
                                    setActionNotes(enq.quotationNotes || '');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-[#0F241A] text-amber-300 text-xs font-bold hover:bg-[#1a382e]"
                                >
                                  {t('अपडेट', 'Update')}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* 4. ORDERS & TRANSPORT                                     */}
          {/* ========================================================= */}
          {currentPage === 'ORDERS' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4">{t('ऑर्डर ID', 'Order ID')}</th>
                        <th className="py-3 px-4">{t('खरीदार', 'Buyer')}</th>
                        <th className="py-3 px-4">{t('पशु संख्या', 'Cattle')}</th>
                        <th className="py-3 px-4">{t('गंतव्य', 'Destination')}</th>
                        <th className="py-3 px-4">{t('परिवहन स्थिति', 'Transport Status')}</th>
                        <th className="py-3 px-4 text-right">{t('अपडेट', 'Update')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            {t('कोई सक्रिय ऑर्डर नहीं है', 'No active orders')}
                          </td>
                        </tr>
                      ) : (
                        orders.map(ord => (
                          <tr key={ord.id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4 font-mono font-bold text-slate-900">
                              #{ord.id}
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-900">
                              {ord.customerName}
                            </td>
                            <td className="py-3 px-4 text-slate-700">
                              {ord.animalIds.length} {t('पशु', 'animals')}
                            </td>
                            <td className="py-3 px-4 text-slate-700">
                              {ord.deliveryAddress}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-900">
                                {ord.deliveryStatus}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => {
                                  setSelectedOrderForAction(ord);
                                  setOrderDeliveryStatus(ord.deliveryStatus);
                                  setOrderTransporterNotes(ord.transporterDetails || '');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#0F241A] text-amber-300 text-xs font-bold hover:bg-[#1a382e]"
                              >
                                {t('स्थिति बदलें', 'Change Status')}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. MILK COLLECTION REGISTER                               */}
          {/* ========================================================= */}
          {currentPage === 'MILK_COLLECTION' && (
            <div className="space-y-4">
              
              {/* Daily totals header */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase">{t('कुल खरीद आज', "Today's Collection")}</span>
                  <span className="text-2xl font-bold font-mono text-slate-900 block mt-1">
                    {formatLitres(totalProcuredMilkToday)}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase">{t('किसान भुगतान देय', 'Total Cost')}</span>
                  <span className="text-2xl font-bold font-mono text-emerald-950 block mt-1">
                    {formatINRExact(totalFarmerPayableToday)}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase">{t('एंट्री संख्या', 'Total Records')}</span>
                    <span className="text-2xl font-bold font-mono text-slate-900 block mt-1">
                      {collectionEntries.filter(c => c.businessDate === selectedDate).length}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowAddCollection(true)}
                    className="px-3 py-1.5 rounded-lg bg-[#0F241A] text-amber-300 font-bold text-xs"
                  >
                    + {t('नई खरीद', 'Add Entry')}
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4">{t('तारीख व समय', 'Timestamp')}</th>
                        <th className="py-3 px-4">{t('किसान / आपूर्तिकर्ता', 'Farmer')}</th>
                        <th className="py-3 px-4">{t('स्वीकृत दूध (L)', 'Litres')}</th>
                        <th className="py-3 px-4">{t('फैट %', 'Fat %')}</th>
                        <th className="py-3 px-4">{t('दर (₹/L)', 'Rate')}</th>
                        <th className="py-3 px-4">{t('कुल राशि (₹)', 'Total Amount')}</th>
                        <th className="py-3 px-4">{t('स्थिति', 'Status')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {collectionEntries.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            {t('कोई दूध खरीद रिकॉर्ड नहीं है', 'No procurement records')}
                          </td>
                        </tr>
                      ) : (
                        collectionEntries.map(c => {
                          const supplier = contacts.find(co => co.id === c.supplierContactId);
                          return (
                            <tr key={c.id} className="hover:bg-slate-50/70">
                              <td className="py-3 px-4 font-mono text-slate-500">
                                {c.businessDate} {c.shift}
                              </td>
                              <td className="py-3 px-4 font-bold text-slate-900">
                                {supplier?.name || c.supplierContactId}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                {c.acceptedLitres} L
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-700">
                                {c.fatPercentage || '—'}%
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-700">
                                ₹{c.purchaseRatePerLitre}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-emerald-950">
                                {formatINRExact(c.totalCost)}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  c.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                                }`}>
                                  {c.paymentStatus}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* 6. DAILY DELIVERIES                                       */}
          {/* ========================================================= */}
          {currentPage === 'DELIVERIES' && (
            <div className="space-y-4">
              
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDeliveryShift('MORNING')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      deliveryShift === 'MORNING' ? 'bg-[#0F241A] text-amber-300' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    🌅 {t('सुबह शिफ्ट', 'Morning Shift')}
                  </button>
                  <button
                    onClick={() => setDeliveryShift('EVENING')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      deliveryShift === 'EVENING' ? 'bg-[#0F241A] text-amber-300' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    🌇 {t('शाम शिफ्ट', 'Evening Shift')}
                  </button>
                </div>

                <button
                  onClick={() => onGenerateDeliveries(selectedDate, deliveryShift)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-900 cursor-pointer"
                >
                  ⚡ {t('डिलीवरी लिस्ट बनाएं', 'Generate Run')}
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4">{t('ग्राहक', 'Customer')}</th>
                        <th className="py-3 px-4">{t('रूट / पता', 'Address / Route')}</th>
                        <th className="py-3 px-4">{t('मात्रा (L)', 'Scheduled')}</th>
                        <th className="py-3 px-4">{t('वास्तविक मात्रा', 'Actual Delivered')}</th>
                        <th className="py-3 px-4">{t('स्थिति', 'Status')}</th>
                        <th className="py-3 px-4 text-right">{t('मार्क करें', 'Quick Action')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {todayDeliveries.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            {t('आज के लिए कोई डिलीवरी शेड्यूल नहीं है', 'No deliveries for selected date')}
                          </td>
                        </tr>
                      ) : (
                        todayDeliveries.map(d => {
                          const cust = contacts.find(c => c.id === d.customerContactId);
                          return (
                            <tr key={d.id} className="hover:bg-slate-50/70">
                              <td className="py-3 px-4">
                                <span className="font-bold text-slate-900 block">{cust?.name || d.customerContactId}</span>
                                <span className="text-[11px] text-slate-500 font-mono">{cust?.phone}</span>
                              </td>
                              <td className="py-3 px-4 text-slate-700">
                                {cust?.location || 'लार, देवरिया'}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                {d.scheduledQuantityLitres} L
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-700">
                                {d.actualDeliveredLitres} L
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  d.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {d.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                {d.status !== 'DELIVERED' && (
                                  <button
                                    onClick={() => onUpdateDeliveryStatus(d.id, 'DELIVERED', d.scheduledQuantityLitres)}
                                    className="px-2.5 py-1 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                                  >
                                    ✓ {t('वितरित', 'Delivered')}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* 7. FINANCIAL LEDGER                                       */}
          {/* ========================================================= */}
          {currentPage === 'FINANCE' && (
            <div className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase">{t('कुल पशु बिक्री राशि', 'Livestock Revenue')}</span>
                  <span className="text-2xl font-bold font-mono text-emerald-950 block mt-1">
                    {formatINR(transactions.reduce((s, t) => s + t.agreedPrice, 0))}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase">{t('किसान खरीद देय', 'Milk Cost')}</span>
                  <span className="text-2xl font-bold font-mono text-slate-900 block mt-1">
                    {formatINR(collectionEntries.reduce((s, c) => s + c.totalCost, 0))}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase">{t('कुल प्राप्त रसीदें', 'Payments Received')}</span>
                  <span className="text-2xl font-bold font-mono text-blue-950 block mt-1">
                    {formatINR(payments.reduce((s, p) => s + p.amount, 0))}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-900">
                  {t('हाल के लेनदेन रिकॉर्ड', 'Recent Payment Transactions')}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4">{t('तारीख', 'Date')}</th>
                        <th className="py-3 px-4">{t('संपर्क', 'Contact')}</th>
                        <th className="py-3 px-4">{t('प्रकार', 'Direction')}</th>
                        <th className="py-3 px-4">{t('राशि (₹)', 'Amount')}</th>
                        <th className="py-3 px-4">{t('माध्यम', 'Method')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payments.slice(0, 10).map(p => {
                        const contact = contacts.find(c => c.id === p.contactId);
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4 font-mono text-slate-500">{p.transactionDate}</td>
                            <td className="py-3 px-4 font-bold text-slate-900">{contact?.name || p.contactId}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.direction === 'CUSTOMER_RECEIPT' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                              }`}>
                                {p.direction}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-slate-900">{formatINR(p.amount)}</td>
                            <td className="py-3 px-4 text-slate-700">{p.paymentMethod}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* 8. CONTACTS DIRECTORY                                     */}
          {/* ========================================================= */}
          {currentPage === 'CONTACTS' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4">{t('नाम', 'Name')}</th>
                        <th className="py-3 px-4">{t('फोन नंबर', 'Phone')}</th>
                        <th className="py-3 px-4">{t('भूमिका', 'Roles')}</th>
                        <th className="py-3 px-4">{t('पता', 'Address')}</th>
                        <th className="py-3 px-4 text-right">{t('संपर्क करें', 'Contact')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {contacts.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                          <td className="py-3 px-4 font-mono text-slate-600">{c.phone}</td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {c.roles.map(r => (
                                <span key={r} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                                  {r}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{c.location || '—'}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <a href={`tel:${c.phone}`} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700">
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={`https://wa.me/91${c.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 9. AUDIT LOGS                                             */}
          {/* ========================================================= */}
          {currentPage === 'AUDIT' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4">{t('समय', 'Timestamp')}</th>
                        <th className="py-3 px-4">{t('कार्रवाई', 'Action')}</th>
                        <th className="py-3 px-4">{t('इकाई', 'Entity')}</th>
                        <th className="py-3 px-4">{t('स्टाफ', 'Actor')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditLogs.slice(0, 20).map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-mono text-slate-500">{formatDateTime(log.timestamp)}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{log.action}</td>
                          <td className="py-3 px-4 text-slate-700">{log.entityType} ({log.entityId})</td>
                          <td className="py-3 px-4 text-slate-600">{log.actor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 10. SETTINGS                                              */}
          {/* ========================================================= */}
          {currentPage === 'SETTINGS' && (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 max-w-2xl">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                  {t('फार्म एवं संपर्क विवरण', 'Farm Master Configuration')}
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">{t('फर्म का नाम', 'Brand Name')}:</label>
                    <span className="font-bold text-slate-900 text-sm">{BUSINESS_CONFIG.brandName}</span>
                  </div>
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">{t('मालिक का नाम', 'Proprietor')}:</label>
                    <span className="font-bold text-slate-900 text-sm">{BUSINESS_CONFIG.ownerName}</span>
                  </div>
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">{t('हेल्पलाइन फोन', 'Direct Phone')}:</label>
                    <span className="font-mono font-bold text-slate-900">{BUSINESS_CONFIG.contacts.phone}</span>
                  </div>
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">{t('फार्म का पता', 'Address')}:</label>
                    <span className="text-slate-800">{BUSINESS_CONFIG.location.displayAddress}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODALS */}
      {showAddAnimal && (
        <AddEditAnimalModal
          animalToEdit={animalToEdit}
          contacts={contacts}
          onClose={() => {
            setShowAddAnimal(false);
            setAnimalToEdit(null);
          }}
          onSave={async (data) => {
            await onSaveAnimal(data);
            setShowAddAnimal(false);
            setAnimalToEdit(null);
          }}
        />
      )}

      {animalToInspect && (
        <AnimalDetailModal
          animal={animalToInspect}
          onClose={() => setAnimalToInspect(null)}
          onOpenReserve={(a) => {
            setAnimalToInspect(null);
            setAnimalToReserve(a);
          }}
          onOpenSale={(a) => {
            setAnimalToInspect(null);
            setAnimalToSell(a);
          }}
          isStaff={true}
        />
      )}

      {animalToReserve && (
        <ReservationModal
          animal={animalToReserve}
          contacts={contacts}
          onClose={() => setAnimalToReserve(null)}
          onConfirm={async (deposit: number, contactId: string) => { await onReserveAnimal(animalToReserve.id, deposit, contactId); setAnimalToReserve(null); }}
        />
      )}

      {animalToSell && (
        <CompleteSaleModal
          animal={animalToSell}
          contacts={contacts}
          onClose={() => setAnimalToSell(null)}
          onConfirm={async (price: number, buyerContactId: string, notes?: string) => { await onCompleteSale(animalToSell.id, buyerContactId, price, notes); setAnimalToSell(null); }}
        />
      )}

      {showAddCollection && (
        <MilkCollectionModal
          suppliers={contacts.filter(c => c.roles.includes('MILK_SUPPLIER'))}
          onClose={() => setShowAddCollection(false)}
          onSave={async (entry) => {
            await onAddCollection(entry);
            setShowAddCollection(false);
          }}
        />
      )}

      {showAddProduction && (
        <OwnProductionModal
          onClose={() => setShowAddProduction(false)}
          onSave={async (entry) => {
            await onAddProduction(entry);
            setShowAddProduction(false);
          }}
        />
      )}

      {showAddContact && (
        <NewContactModal
          onClose={() => setShowAddContact(false)}
          onSave={async (contact) => {
            await onAddContact(contact);
            setShowAddContact(false);
          }}
        />
      )}

      {/* Enquiry Update Modal */}
      {selectedEnquiryForAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {t('पूछताछ अपडेट', 'Update Enquiry')}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedEnquiryForAction.customerName} · {selectedEnquiryForAction.phone}
                </p>
              </div>
              <button
                onClick={() => setSelectedEnquiryForAction(null)}
                className="text-slate-400 hover:text-slate-800 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('स्थिति', 'Status')}:</label>
                <select
                  value={actionStatus}
                  onChange={(e: any) => setActionStatus(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 font-bold"
                >
                  <option value="NEW_ENQUIRY">{t('नई पूछताछ (New)', 'New Enquiry')}</option>
                  <option value="CONTACTED">{t('बातचीत जारी (Contacted)', 'Contacted')}</option>
                  <option value="QUOTATION_SENT">{t('कोटेशन भेजा गया (Quoted)', 'Quotation Sent')}</option>
                  <option value="DELIVERED">{t('ऑर्डर पूर्ण (Delivered)', 'Completed')}</option>
                  <option value="CANCELLED">{t('रद्द (Cancelled)', 'Cancelled')}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('पशु कोटेशन कुल (₹)', 'Cattle Quote (₹)')}:</label>
                  <input
                    type="number"
                    value={actionQuotationAmount}
                    onChange={(e) => setActionQuotationAmount(e.target.value)}
                    placeholder="450000"
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t('वाहन भाड़ा (₹)', 'Transport (₹)')}:</label>
                  <input
                    type="number"
                    value={actionTransportQuote}
                    onChange={(e) => setActionTransportQuote(e.target.value)}
                    placeholder="8500"
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('नोट्स / विवरण', 'Notes')}:</label>
                <textarea
                  rows={3}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder={t('बातचीत का ब्यौरा दर्ज करें...', 'Enter conversation notes...')}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedEnquiryForAction(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {t('रद्द करें', 'Cancel')}
              </button>
              <button
                onClick={async () => {
                  if (onUpdateEnquiryStatus) {
                    await onUpdateEnquiryStatus(
                      selectedEnquiryForAction.id,
                      actionStatus,
                      actionNotes,
                      actionQuotationAmount ? parseFloat(actionQuotationAmount) : undefined,
                      actionTransportQuote ? parseFloat(actionTransportQuote) : undefined,
                      actionStaff
                    );
                  }
                  setSelectedEnquiryForAction(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#0F241A] text-amber-300 text-xs font-bold hover:bg-[#1a382e] cursor-pointer"
              >
                {t('सेव करें', 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Logistics Update Modal */}
      {selectedOrderForAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {t('लॉजिस्टिक्स अपडेट', 'Logistics Update')}: #{selectedOrderForAction.id}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedOrderForAction.customerName} · {selectedOrderForAction.animalIds.length} {t('पशु', 'cattle')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForAction(null)}
                className="text-slate-400 hover:text-slate-800 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t('डिलीवरी स्थिति', 'Transport Status')}:
                </label>
                <select
                  value={orderDeliveryStatus}
                  onChange={(e: any) => setOrderDeliveryStatus(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 font-bold"
                >
                  <option value="TRANSPORT_ASSIGNED">{t('वाहन चालक तय', 'Transport Assigned')}</option>
                  <option value="DISPATCHED">{t('रास्ते में है / रवाना', 'Dispatched')}</option>
                  <option value="DELIVERED">{t('पहुंच गया', 'Delivered')}</option>
                  <option value="VET_PASSED">{t('स्वास्थ्य जांच पास', 'Vet Passed')}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {t('वाहन व चालक विवरण', 'Transporter & Driver Details')}:
                </label>
                <textarea
                  rows={3}
                  value={orderTransporterNotes}
                  onChange={(e) => setOrderTransporterNotes(e.target.value)}
                  placeholder="उदा. बोलेरो पिकअप UP 52 T 8492, चालक: सुरेश यादव 9838000000"
                  className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedOrderForAction(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {t('रद्द करें', 'Cancel')}
              </button>
              <button
                onClick={async () => {
                  if (onUpdateOrderStatus) {
                    await onUpdateOrderStatus(
                      selectedOrderForAction.id,
                      selectedOrderForAction.orderStatus,
                      orderDeliveryStatus,
                      orderTransporterNotes
                    );
                  }
                  setSelectedOrderForAction(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#0F241A] text-amber-300 text-xs font-bold hover:bg-[#1a382e] cursor-pointer"
              >
                {t('अपडेट सेव करें', 'Save Update')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
