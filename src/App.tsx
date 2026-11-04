import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { TopBar, PublicPage } from './components/layout/TopBar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/public/HomePage';
import { CattleCatalogPage } from './pages/public/CattleCatalogPage';
import { BulkOrderPage } from './pages/public/BulkOrderPage';
import { DeliveryInfoPage } from './pages/public/DeliveryInfoPage';
import { CustomerDashboardPage } from './pages/public/CustomerDashboardPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AnimalDetailModal } from './components/livestock/AnimalDetailModal';
import { api } from './services/api';
import { BrandMark } from './components/layout/BrandMark';
import { BUSINESS_CONFIG } from './config/business';
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
  LivestockOrder,
  Species
} from './types/domain';

function MainApplication() {
  const { showToast } = useNotification();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState<'PUBLIC' | 'ADMIN' | 'LOGIN'>('PUBLIC');
  const [publicPage, setPublicPage] = useState<PublicPage>('HOME');
  const [selectedAnimalForDetail, setSelectedAnimalForDetail] = useState<Animal | null>(null);

  // Category filter state passed from Home to Catalog
  const [catalogSpeciesFilter, setCatalogSpeciesFilter] = useState<'ALL' | Species>('ALL');
  const [catalogBreedFilter, setCatalogBreedFilter] = useState<string | undefined>(undefined);

  // Core application data state
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [transactions, setTransactions] = useState<LivestockTransaction[]>([]);
  const [productionEntries, setProductionEntries] = useState<MilkProductionEntry[]>([]);
  const [collectionEntries, setCollectionEntries] = useState<MilkCollectionEntry[]>([]);
  const [subscriptions, setSubscriptions] = useState<DeliverySubscription[]>([]);
  const [deliveries, setDeliveries] = useState<MilkDelivery[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [orders, setOrders] = useState<LivestockOrder[]>([]);
  const [reconciliation, setReconciliation] = useState<any>(null);
  const [financialSummary, setFinancialSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      // Public visitors only ever get the public animal list. Contacts,
      // payments, audit logs etc. are fetched only for signed-in staff.
      if (!isAuthenticated) {
        setAnimals((await api.getPublicLivestock()) || []);
        return;
      }
      const [
        livestockData,
        contactsData,
        txnsData,
        prodData,
        colData,
        subsData,
        delData,
        payData,
        auditData,
        reconData,
        finData,
        enqData,
        ordData,
      ] = await Promise.all([
        api.getLivestock(),
        api.getContacts(),
        api.getTransactions(),
        api.getProduction(),
        api.getCollections(),
        api.getSubscriptions(),
        api.getDeliveries(),
        api.getPayments(),
        api.getAuditLogs(),
        api.getReconciliation(),
        api.getFinancialSummary(),
        api.getEnquiries(),
        api.getOrders(),
      ]);

      setAnimals(livestockData || []);
      setContacts(contactsData || []);
      setTransactions(txnsData || []);
      setProductionEntries(prodData || []);
      setCollectionEntries(colData || []);
      setSubscriptions(subsData || []);
      setDeliveries(delData || []);
      setPayments(payData || []);
      setAuditLogs(auditData || []);
      setReconciliation(reconData || null);
      setFinancialSummary(finData || null);
      setEnquiries(enqData || []);
      setOrders(ordData || []);
    } catch (err: any) {
      console.error('Failed to load application data:', err);
      showToast('Error syncing data with backend server', 'ERROR');
    } finally {
      setLoading(false);
    }
  }, [showToast, isAuthenticated]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- LIVESTOCK MUTATIONS ---
  const handleSaveAnimal = async (animalData: Partial<Animal>) => {
    try {
      if (animalData.id && animals.some(a => a.id === animalData.id)) {
        await api.updateAnimal(animalData.id, animalData, 'Parmeshwar Kushwaha (Owner)');
        showToast(`Updated cattle listing #${animalData.id}`, 'SUCCESS');
      } else {
        await api.createAnimal(animalData, 'Parmeshwar Kushwaha (Owner)');
        showToast(`Intake completed: New ${animalData.breed} registered`, 'SUCCESS');
      }
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save animal record', 'ERROR');
      throw err;
    }
  };

  const handleReserveAnimal = async (id: string, deposit: number, contactId: string) => {
    try {
      await api.reserveAnimal(id, deposit, contactId, 'Parmeshwar Kushwaha (Owner)');
      showToast(`Listing #${id} marked as RESERVED (₹${deposit.toLocaleString('en-IN')} token held)`, 'SUCCESS');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to reserve animal', 'ERROR');
      throw err;
    }
  };

  const handleReleaseReservation = async (id: string) => {
    try {
      await api.releaseReservation(id, 'Parmeshwar Kushwaha (Owner)');
      showToast(`Reservation released for #${id}. Listing returned to AVAILABLE.`, 'INFO');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to release reservation', 'ERROR');
      throw err;
    }
  };

  const handleCompleteSale = async (id: string, buyerContactId: string, agreedPrice: number, notes?: string) => {
    try {
      await api.completeSale(id, buyerContactId, agreedPrice, notes, 'Parmeshwar Kushwaha (Owner)');
      showToast(`Sale finalized for #${id} at ₹${agreedPrice.toLocaleString('en-IN')}`, 'SUCCESS');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to finalize sale', 'ERROR');
      throw err;
    }
  };

  // --- DAIRY MUTATIONS ---
  const handleAddCollection = async (entry: Partial<MilkCollectionEntry>) => {
    try {
      await api.addCollection(entry);
      showToast(`Milk intake recorded: ${entry.acceptedLitres}L accepted`, 'SUCCESS');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to record collection', 'ERROR');
      throw err;
    }
  };

  const handleAddProduction = async (entry: Partial<MilkProductionEntry>) => {
    try {
      await api.addProduction(entry);
      showToast(`Own herd milking recorded: ${entry.quantityLitres}L (${entry.shift})`, 'SUCCESS');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to record production', 'ERROR');
      throw err;
    }
  };

  const handleAddContact = async (contact: Partial<Contact>) => {
    try {
      await api.createContact(contact);
      showToast(`Contact '${contact.name}' added to directory`, 'SUCCESS');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to add contact', 'ERROR');
      throw err;
    }
  };

  const handleGenerateDeliveries = async (date: string, shift: 'MORNING' | 'EVENING') => {
    try {
      const generated = await api.generateDeliveries(date, shift, 'Manager');
      showToast(`Generated daily delivery run (${generated.length} deliveries prepared)`, 'SUCCESS');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to generate deliveries', 'ERROR');
      throw err;
    }
  };

  const handleUpdateDeliveryStatus = async (id: string, status: string, actualLitres?: number, skipReason?: string) => {
    try {
      await api.updateDeliveryStatus(id, status, actualLitres, skipReason, 'Delivery Staff');
      showToast(`Delivery status updated: ${status}`, 'SUCCESS');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update delivery status', 'ERROR');
      throw err;
    }
  };

  const handleUpdateEnquiryStatus = async (
    id: string, 
    status: EnquiryStatus, 
    notes?: string, 
    quotationAmount?: number, 
    transportQuotation?: number,
    assignedStaff?: string
  ) => {
    try {
      await api.updateEnquiryStatus(id, status, notes, quotationAmount, transportQuotation, assignedStaff);
      showToast(`Enquiry #${id} updated: ${status}`, 'SUCCESS');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update enquiry status', 'ERROR');
      throw err;
    }
  };

  const handleUpdateOrderStatus = async (
    id: string, 
    status: EnquiryStatus, 
    deliveryStatus?: any, 
    transporterDetails?: string
  ) => {
    try {
      await api.updateOrderStatus(id, status, deliveryStatus, transporterDetails);
      showToast(`Order #${id} logistics updated: ${deliveryStatus || status}`, 'SUCCESS');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status', 'ERROR');
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <BrandMark />
          <div className="text-sm font-medium text-stone-700">{BUSINESS_CONFIG.brandName}</div>
        </div>
      </div>
    );
  }

  // --- VIEW 1: AUTHENTIC ADMIN LOGIN PAGE ---
  if (activeView === 'LOGIN' || (activeView === 'ADMIN' && !isAuthenticated)) {
    return (
      <AdminLoginPage
        onLoginSuccess={() => {
          showToast('सफलतापूर्वक लॉगिन किया गया (Signed in successfully)', 'SUCCESS');
          setActiveView('ADMIN');
        }}
        onBackToStorefront={() => setActiveView('PUBLIC')}
      />
    );
  }

  // --- VIEW 2: FULL-SCREEN ADMIN WORKSPACE (SIDEBAR DRIVEN) ---
  if (activeView === 'ADMIN' && isAuthenticated) {
    return (
      <AdminDashboard
        animals={animals}
        contacts={contacts}
        transactions={transactions}
        productionEntries={productionEntries}
        collectionEntries={collectionEntries}
        subscriptions={subscriptions}
        deliveries={deliveries}
        payments={payments}
        auditLogs={auditLogs}
        reconciliation={reconciliation}
        financialSummary={financialSummary}
        enquiries={enquiries}
        orders={orders}
        onRefresh={loadData}
        onExitToStorefront={() => setActiveView('PUBLIC')}
        onSaveAnimal={handleSaveAnimal}
        onReserveAnimal={handleReserveAnimal}
        onReleaseReservation={handleReleaseReservation}
        onCompleteSale={handleCompleteSale}
        onAddCollection={handleAddCollection}
        onAddProduction={handleAddProduction}
        onAddContact={handleAddContact}
        onGenerateDeliveries={handleGenerateDeliveries}
        onUpdateDeliveryStatus={handleUpdateDeliveryStatus}
        onUpdateEnquiryStatus={handleUpdateEnquiryStatus}
        onUpdateOrderStatus={handleUpdateOrderStatus}
      />
    );
  }

  // --- VIEW 3: PUBLIC STOREFRONT ---
  return (
    <div className="min-h-screen flex flex-col text-stone-900">
      {/* Top Bar with Page Router and Authentic Staff Login Trigger */}
      <TopBar
        activeView={activeView}
        setActiveView={setActiveView}
        publicPage={publicPage}
        setPublicPage={setPublicPage}
      />

      {/* Main View Router matching collage */}
      <main className="flex-1">
        {publicPage === 'HOME' && (
          <HomePage
            animals={animals}
            onSelectAnimal={(a) => setSelectedAnimalForDetail(a)}
            onNavigatePage={(p) => setPublicPage(p as PublicPage)}
            onFilterCategory={(species, breed) => {
              setCatalogSpeciesFilter(species);
              setCatalogBreedFilter(breed);
              setPublicPage('ANIMALS');
            }}
          />
        )}

        {publicPage === 'ANIMALS' && (
          <CattleCatalogPage
            animals={animals}
            onSelectAnimal={(a) => setSelectedAnimalForDetail(a)}
            onNavigatePage={(p) => setPublicPage(p as PublicPage)}
            initialSpecies={catalogSpeciesFilter}
            initialBreed={catalogBreedFilter}
          />
        )}

        {publicPage === 'BULK_ORDER' && (
          <BulkOrderPage
            onEnquiryCreated={async () => {
              showToast(t('बल्क इन्क्वायरी दर्ज हुई! संदर्भ कोड जनरेट किया गया।', 'Bulk enquiry submitted! Reference generated.'), 'SUCCESS');
              await loadData();
            }}
            onNavigateHome={() => setPublicPage('HOME')}
          />
        )}

        {publicPage === 'TRANSPORT' && (
          <DeliveryInfoPage
            onNavigateBulkOrder={() => setPublicPage('BULK_ORDER')}
          />
        )}

        {publicPage === 'DASHBOARD' && (
          <CustomerDashboardPage
            animals={animals}
            onSelectAnimal={(a) => setSelectedAnimalForDetail(a)}
            onNavigatePage={(p) => setPublicPage(p as PublicPage)}
          />
        )}

        {publicPage === 'ABOUT' && <AboutPage />}
        {publicPage === 'CONTACT' && <ContactPage />}
      </main>

      {/* Detail Inspection Modal for Cattle matching collage */}
      <AnimalDetailModal
        animal={selectedAnimalForDetail}
        onClose={() => setSelectedAnimalForDetail(null)}
      />

      {/* Shared Footer with direct page links */}
      <Footer onNavigatePage={(page) => {
        setActiveView('PUBLIC');
        setPublicPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <MainApplication />
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
