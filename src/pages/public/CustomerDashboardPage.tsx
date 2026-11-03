import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { BUSINESS_CONFIG } from '../../config/business';
import { Animal } from '../../types/domain';

interface CustomerDashboardPageProps {
  animals: Animal[];
  onSelectAnimal: (animal: Animal) => void;
  onNavigatePage: (page: string) => void;
}

export const CustomerDashboardPage: React.FC<CustomerDashboardPageProps> = ({
  animals,
  onSelectAnimal,
  onNavigatePage,
}) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ENQUIRIES' | 'ORDERS' | 'FAVORITES' | 'SETTINGS'>('OVERVIEW');

  // Realistic mock data matching the collage profile
  const customer = {
    name: 'Rahul Sharma',
    role: language === 'HI' ? 'डेयरी किसान (देवरिया)' : 'Commercial Dairy Farmer',
    phone: '+91 98765 43210',
    email: 'rahul.sharma@purvanchal.in',
    location: 'Salempur Road, Deoria, Uttar Pradesh',
  };

  const enquiries = [
    {
      id: 'ENQ00124',
      animal: 'Murrah Buffalo (16 Ltr/Day)',
      date: '2026-10-24',
      status: 'Contacted',
      statusColor: 'bg-blue-100 text-blue-800 border-blue-200',
      priceQuote: '₹85,000',
      notes: language === 'HI' ? 'मालिक परमेश्वर जी से फोन पर बात हुई। रविवार को दोहाई जांच तय।' : 'Contacted by owner Parmeshwar. Milking inspection confirmed for Sunday.',
    },
    {
      id: 'ENQ00123',
      animal: 'Sahiwal Dairy Cow (14 Ltr/Day)',
      date: '2026-10-22',
      status: 'Pending',
      statusColor: 'bg-amber-100 text-amber-900 border-amber-200',
      priceQuote: '₹75,000',
      notes: language === 'HI' ? 'कोटेशन तैयार हो रही है, वाहन भाड़ा जोड़ा जा रहा है।' : 'Quotation being prepared with vehicle freight.',
    },
  ];

  const orders = [
    {
      id: 'ORD1248',
      animal: 'Murrah Buffalo (UP-DEO-8812)',
      orderDate: '2026-10-20',
      status: 'In Transit',
      statusColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      vehicle: 'Bolero Maxi Truck (UP-52-T-9921)',
      driver: 'Ramsevak Yadav (98390XXXXX)',
      destination: 'Salempur Farm, Deoria',
      advancePaid: '₹5,000',
      totalPrice: '₹85,000',
      balanceDue: '₹80,000 (Pay on Delivery)',
    },
  ];

  // Pick 3 saved animals
  const savedAnimals = animals.slice(0, 3);

  return (
    <div className="bg-[#FAF8F5] py-8 lg:py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Collage Header Banner */}
        <div className="bg-gradient-to-r from-[#0F241A] to-[#183B2B] text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 font-black text-2xl flex items-center justify-center shadow-md shrink-0">
              {customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">{customer.name}</h1>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  {t('सत्यापित खरीदार', 'Verified Buyer')}
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">{customer.role} · 📞 {customer.phone}</p>
              <p className="text-[11px] text-stone-400">📍 {customer.location}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigatePage('ANIMALS')}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              + {t('नया पशु खोजें', 'Browse Animals')}
            </button>
            <button
              onClick={() => onNavigatePage('BULK_ORDER')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors cursor-pointer"
            >
              📋 {t('बल्क आर्डर करें', 'Bulk Order')}
            </button>
          </div>
        </div>

        {/* Dashboard Grid: Sidebar Navigation + Main Content matching Collage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Navigation Bar */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-1">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'OVERVIEW'
                  ? 'bg-[#0F241A] text-amber-300 shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>📊</span>
              <span>{t('डैशबोर्ड ओवरव्यू', 'Dashboard')}</span>
            </button>

            <button
              onClick={() => setActiveTab('ENQUIRIES')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'ENQUIRIES'
                  ? 'bg-[#0F241A] text-amber-300 shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-3">
                <span>💬</span>
                <span>{t('मेरी पूछताछ (Enquiries)', 'My Enquiries')}</span>
              </span>
              <span className="bg-amber-100 text-amber-950 px-2 py-0.5 rounded-full text-[10px]">2</span>
            </button>

            <button
              onClick={() => setActiveTab('ORDERS')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'ORDERS'
                  ? 'bg-[#0F241A] text-amber-300 shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-3">
                <span>📦</span>
                <span>{t('मेरे ऑर्डर्स (Orders)', 'My Orders')}</span>
              </span>
              <span className="bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-full text-[10px]">1</span>
            </button>

            <button
              onClick={() => setActiveTab('FAVORITES')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === 'FAVORITES'
                  ? 'bg-[#0F241A] text-amber-300 shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-3">
                <span>⭐</span>
                <span>{t('पसंदीदा पशु (Saved)', 'Saved Animals')}</span>
              </span>
              <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full text-[10px]">3</span>
            </button>

            <button
              onClick={() => onNavigatePage('TRANSPORT')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 text-left cursor-pointer"
            >
              <span>🚚</span>
              <span>{t('गाड़ी ट्रैकिंग व भाड़ा', 'Delivery & Tracking')}</span>
            </button>

            <div className="pt-3 mt-3 border-t border-slate-100">
              <a
                href={`https://wa.me/${BUSINESS_CONFIG.contacts.whatsapp}?text=${encodeURIComponent('नमस्ते! मुझे अपने ऑर्डर के बारे में जानकारी चाहिए।')}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-colors"
              >
                <span>💬 WhatsApp सहायता</span>
              </a>
            </div>
          </div>

          {/* Right Main Panel */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Top 3 Metric Cards matching collage */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                  <span>{t('कुल पूछताछ', 'Total Enquiries')}</span>
                  <span className="text-xl">🛒</span>
                </div>
                <div className="mt-2 text-3xl font-black text-slate-900">2</div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1">1 {t('सक्रिय बातचीत में', 'Active in discussion')}</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                  <span>{t('कन्फर्म ऑर्डर्स', 'Confirmed Orders')}</span>
                  <span className="text-xl">✅</span>
                </div>
                <div className="mt-3 text-3xl font-black text-slate-900">1</div>
                <div className="text-[11px] text-blue-700 font-semibold mt-1">1 {t('रास्ते में (In Transit)', 'Dispatched via truck')}</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                  <span>{t('पसंदीदा पशु', 'Saved Animals')}</span>
                  <span className="text-xl">⭐</span>
                </div>
                <div className="mt-3 text-3xl font-black text-slate-900">3</div>
                <div className="text-[11px] text-amber-700 font-semibold mt-1">{t('समीक्षा हेतु सुरक्षित', 'Saved for review')}</div>
              </div>
            </div>

            {/* Recent Enquiries Table matching collage */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-slate-900 tracking-tight">
                    {t('हाल की पूछताछ (Recent Enquiries)', 'Recent Enquiries')}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {t('दादी चम्पा फार्म द्वारा दी गई कोटेशन व स्थिति', 'Status and direct quotations from farm')}
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  {enquiries.length} {t('सक्रिय', 'Active')}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {enquiries.map((enq) => (
                  <div key={enq.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          #{enq.id}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{enq.animal}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${enq.statusColor}`}>
                          {enq.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{enq.notes}</p>
                      <span className="text-[10px] text-slate-400 block font-mono">{t('दर्ज दिनांक:', 'Date:')} {enq.date}</span>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center shrink-0">
                      <span className="text-xs font-bold font-mono text-slate-900">{enq.priceQuote}</span>
                      <a
                        href={`https://wa.me/${BUSINESS_CONFIG.contacts.whatsapp}?text=${encodeURIComponent(`नमस्ते! मुझे मेरी इन्क्वायरी #${enq.id} (${enq.animal}) के बारे में बात करनी है।`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <span>💬</span>
                        <span>{t('चैट करें', 'Chat')}</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Order & Live Transit Tracker */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {t('सक्रिय पशु ट्रांसपोर्ट डिलीवरी (Live Order)', 'Live Livestock Order')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('लार फार्म से आपके गंतव्य तक की लाइव प्रगति', 'Direct dispatch from Lar farm with vet certificate')}
                  </p>
                </div>
                <span className="bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-full font-mono">
                  ORD-1248
                </span>
              </div>

              {orders.map((ord) => (
                <div key={ord.id} className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 text-[10px] block font-semibold">{t('पशु विवरण', 'Animal')}</span>
                      <strong className="text-slate-900 font-bold">{ord.animal}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block font-semibold">{t('वाहन व ड्राइवर', 'Vehicle & Driver')}</span>
                      <strong className="text-slate-900 font-bold">{ord.vehicle}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block font-semibold">{t('टोकन एडवांस', 'Advance Paid')}</span>
                      <strong className="text-emerald-700 font-bold">{ord.advancePaid}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block font-semibold">{t('बकाया राशि (डिलीवरी पर)', 'Balance on Delivery')}</span>
                      <strong className="text-amber-900 font-bold">{ord.balanceDue}</strong>
                    </div>
                  </div>

                  {/* 5-step progress bar */}
                  <div className="pt-2">
                    <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-bold">
                      <div className="space-y-1">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-xs">✓</div>
                        <span className="text-emerald-900">{t('ऑर्डर तय', 'Confirmed')}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-xs">✓</div>
                        <span className="text-emerald-900">{t('दोहाई जांच', 'Dohai Test')}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-xs">✓</div>
                        <span className="text-emerald-900">{t('पशु फिटनेस', 'Vet Fitness')}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto text-xs animate-pulse">🚚</div>
                        <span className="text-blue-900">{t('गाड़ी रवाना', 'Dispatched')}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto text-xs">5</div>
                        <span className="text-slate-400">{t('घर डिलीवरी', 'Delivered')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Saved Animals Showcase */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900">
                  {t('आपके पसंदीदा पशु (Saved Favorites)', 'Saved Animals')}
                </h3>
                <button
                  onClick={() => onNavigatePage('ANIMALS')}
                  className="text-xs font-bold text-emerald-800 hover:underline"
                >
                  {t('कैटलॉग में और देखें →', 'View All in Catalog →')}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {savedAnimals.map((animal) => (
                  <div
                    key={animal.id}
                    onClick={() => onSelectAnimal(animal)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-emerald-600 bg-slate-50/50 cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="font-mono text-slate-600">#{animal.id}</span>
                      <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                        {animal.reportedMilkYieldLpd} L/Day
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 line-clamp-1">
                      {animal.breed} {animal.species === 'BUFFALO' ? 'Buffalo' : 'Cow'}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200">
                      <span>{t('देखें', 'View Details')}</span>
                      <span className="font-bold text-slate-900">₹{animal.listing.priceMin.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
