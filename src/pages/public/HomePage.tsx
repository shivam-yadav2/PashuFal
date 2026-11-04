import React from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Droplets,
  Truck,
  Stethoscope,
  Phone,
  MessageCircle,
  ClipboardList,
  Eye,
  Handshake,
  Building2,
} from 'lucide-react';
import { Animal, Species } from '../../types/domain';
import { BUSINESS_CONFIG } from '../../config/business';
import { AnimalCard } from '../../components/livestock/AnimalCard';
import { useLanguage } from '../../context/LanguageContext';
import { whatsappLink } from '../../components/layout/TopBar';

interface HomePageProps {
  animals: Animal[];
  onSelectAnimal: (animal: Animal) => void;
  onNavigatePage: (page: string) => void;
  onFilterCategory?: (species: 'ALL' | Species, breed?: string) => void;
}

const HERO_IMAGE = '/assets/hero/cattle-sunset.png';

export const HomePage: React.FC<HomePageProps> = ({ animals, onSelectAnimal, onNavigatePage, onFilterCategory }) => {
  const { t } = useLanguage();
  const { content, contacts } = BUSINESS_CONFIG;

  const publicAnimals = animals.filter((a) => a.listing.status === 'AVAILABLE' || a.listing.status === 'RESERVED');
  const featured = publicAnimals.slice(0, 4);
  const availableCount = animals.filter((a) => a.listing.status === 'AVAILABLE').length;

  const askAbout = (animal: Animal) =>
    window.open(
      whatsappLink(
        t(
          `नमस्ते, मुझे पशु #${animal.id} (${animal.breed}, ${animal.reportedMilkYieldLpd ?? '—'} ली./दिन) की जानकारी चाहिए।`,
          `Hello, I'd like details about animal #${animal.id} (${animal.breed}, ${animal.reportedMilkYieldLpd ?? '—'} L/day).`
        )
      ),
      '_blank',
      'noopener'
    );

  const trustPoints = [
    {
      icon: Droplets,
      title: t('आपके सामने दुहाई', 'Milked in front of you'),
      body: t('सुबह-शाम की दुहाई देखकर ही सौदा करें — दूध की मात्रा का कोई अनुमान नहीं।', 'Watch the morning and evening milking yourself before you commit — no guesswork on yield.'),
    },
    {
      icon: Stethoscope,
      title: t('पशु-चिकित्सक जाँच', 'Vet-checked'),
      body: t('हर पशु का स्वास्थ्य परीक्षण व यात्रा फिटनेस प्रमाणपत्र।', 'Every animal gets a health check and a fitness-to-travel certificate.'),
    },
    {
      icon: Truck,
      title: t('सुरक्षित डिलीवरी', 'Safe delivery'),
      body: t('पुआल-युक्त वाहन और अनुभवी सहायक, सीधे आपके खूंटे तक।', 'Straw-bedded vehicles and experienced handlers, right to your shed.'),
    },
  ];

  const categories: { label: string; sub: string; onClick: () => void }[] = [
    { label: t('भैंस', 'Buffaloes'), sub: t('मुर्राह व अन्य', 'Murrah & others'), onClick: () => onFilterCategory?.('BUFFALO') },
    { label: t('देसी गाय', 'Desi cows'), sub: t('साहीवाल, गिर', 'Sahiwal, Gir'), onClick: () => onFilterCategory?.('COW', 'Sahiwal') },
    { label: t('HF क्रॉस गाय', 'HF cross cows'), sub: t('अधिक दूध', 'High volume'), onClick: () => onFilterCategory?.('COW', 'HF') },
    { label: t('सभी पशु', 'All animals'), sub: t('पूरी सूची', 'Full catalogue'), onClick: () => onFilterCategory?.('ALL') },
  ];

  const steps = [
    { icon: ClipboardList, title: t('अपनी जरूरत बताएं', 'Tell us what you need'), body: t('नस्ल, दूध क्षमता और बजट — फोन, WhatsApp या फॉर्म से।', 'Breed, yield and budget — by phone, WhatsApp or the enquiry form.') },
    { icon: Eye, title: t('फार्म पर देखें', 'See it on the farm'), body: t('पशु को देखें और खुद दुहाई जाँच करें।', 'Visit, inspect the animal and verify the milking yourself.') },
    { icon: Handshake, title: t('सौदा पक्का करें', 'Confirm the deal'), body: t('टोकन राशि देकर पशु आरक्षित करें।', 'Reserve the animal with a token amount.') },
    { icon: Truck, title: t('घर तक डिलीवरी', 'Delivered home'), body: t('जाँच के बाद सुरक्षित वाहन से डिलीवरी।', 'Vet-cleared and delivered by safe transport.') },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[88vh] items-center overflow-hidden bg-brand-900">
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-brand-900/75 via-brand-900/25 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-brand-900/55 via-transparent to-transparent" />
        <div className="relative container-page py-16">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-brand-100">
              <BadgeCheck className="w-4 h-4 text-accent-400" />
              {t(`${BUSINESS_CONFIG.experienceYears} वर्षों का भरोसा`, `Trusted for ${BUSINESS_CONFIG.experienceYears} years`)}
            </p>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl font-semibold leading-tight text-white">
              {t(content.heroTitleHi, content.heroTitleEn)}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-brand-100/90">{t(content.heroSubtitleHi, content.heroSubtitleEn)}</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button onClick={() => onNavigatePage('ANIMALS')} className="btn-primary bg-accent-400! text-stone-900! hover:bg-accent-500! px-6! py-3!">
                {t('उपलब्ध पशु देखें', 'Browse available animals')}
                <ArrowRight className="w-4 h-4" />
              </button>
              <a href={`tel:${contacts.rawPhone || contacts.phone}`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">
                <Phone className="w-4 h-4" />
                {contacts.phone}
              </a>
            </div>
            {availableCount > 0 && (
              <p className="mt-6 text-sm text-brand-100/70">
                {t(`अभी ${availableCount} पशु उपलब्ध हैं`, `${availableCount} animals available right now`)}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Trust points */}
      <section className="border-b border-stone-200 bg-white">
        <div className="container-page grid gap-8 py-12 md:grid-cols-3">
          {trustPoints.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-4">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Icon className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-semibold text-stone-900">{title}</h3>
                <p className="mt-1 text-sm">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-page py-16">
        <h2 className="font-display text-3xl font-semibold">{t('क्या खोज रहे हैं?', 'What are you looking for?')}</h2>
        <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <button
              key={c.label}
              onClick={c.onClick}
              className="group rounded-xl border border-stone-200 bg-white p-5 text-left transition-shadow hover:shadow-md hover:border-brand-600/40"
            >
              <span className="block text-lg font-semibold text-stone-900">{c.label}</span>
              <span className="mt-1 block text-sm text-stone-500">{c.sub}</span>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700">
                {t('देखें', 'View')}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured animals */}
      <section className="bg-white border-y border-stone-200">
        <div className="container-page py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold">{t('अभी उपलब्ध', 'Available now')}</h2>
              <p className="mt-2">{t('हाल ही में जाँचे गए पशु।', 'Recently verified animals on our farm.')}</p>
            </div>
            <button onClick={() => onNavigatePage('ANIMALS')} className="btn-secondary">
              {t('सभी पशु देखें', 'See all animals')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {featured.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((animal) => (
                <AnimalCard key={animal.id} animal={animal} onSelect={onSelectAnimal} onQuickWhatsApp={askAbout} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-dashed border-stone-300 p-10 text-center">
              <p className="font-medium text-stone-800">{t('इस समय कोई पशु सूचीबद्ध नहीं है।', 'No animals are listed at the moment.')}</p>
              <p className="mt-1 text-sm">{t('अपनी जरूरत बताएं — हम आपके लिए खोज देंगे।', "Tell us what you need and we'll source it for you.")}</p>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-5">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-16">
        <h2 className="font-display text-3xl font-semibold">{t('खरीद कैसे होती है', 'How buying works')}</h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="rounded-xl border border-stone-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-800 text-sm font-semibold text-white">{i + 1}</span>
                <Icon className="w-5 h-5 text-brand-700" />
              </div>
              <h3 className="mt-4 font-semibold text-stone-900">{title}</h3>
              <p className="mt-1 text-sm">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Bulk CTA */}
      <section className="container-page pb-16">
        <div className="flex flex-col gap-6 rounded-2xl bg-brand-800 p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-4">
            <span className="hidden sm:inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
              <Building2 className="w-6 h-6" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-semibold text-white">
                {t('डेयरी फार्म के लिए 5 से 50+ पशु?', 'Setting up a dairy farm? 5 to 50+ animals')}
              </h2>
              <p className="mt-2 text-brand-100/80">
                {t('चरणबद्ध डिलीवरी, थोक मूल्य और हर पशु की दुहाई जाँच।', 'Volume pricing, phased delivery and milking verification for every animal.')}
              </p>
            </div>
          </div>
          <button onClick={() => onNavigatePage('BULK_ORDER')} className="btn-secondary shrink-0 border-transparent!">
            {t('बल्क कोटेशन मांगें', 'Request a bulk quote')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
