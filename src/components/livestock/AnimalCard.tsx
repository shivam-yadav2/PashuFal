import React from 'react';
import { Droplets, MapPin, CalendarDays, MessageCircle, BadgeCheck } from 'lucide-react';
import { Animal } from '../../types/domain';
import { formatINR } from '../../lib/currency';
import { useLanguage } from '../../context/LanguageContext';
import { RealisticCattlePhoto } from '../ui/RealisticCattlePhoto';

interface AnimalCardProps {
  animal: Animal;
  onSelect: (animal: Animal) => void;
  onQuickWhatsApp?: (animal: Animal) => void;
}

export const AnimalCard: React.FC<AnimalCardProps> = ({ animal, onSelect, onQuickWhatsApp }) => {
  const { listing } = animal;
  const { t } = useLanguage();

  const status =
    listing.status === 'AVAILABLE'
      ? { label: t('उपलब्ध', 'Available'), cls: 'bg-brand-700 text-white' }
      : listing.status === 'RESERVED'
      ? { label: t('आरक्षित', 'Reserved'), cls: 'bg-accent-400 text-stone-900' }
      : { label: t('बिक चुका', 'Sold'), cls: 'bg-stone-700 text-white' };

  const price =
    listing.contactForPrice
      ? t('कीमत के लिए संपर्क करें', 'Price on request')
      : listing.priceMax && listing.priceMax !== listing.priceMin
      ? `${formatINR(listing.priceMin)} – ${formatINR(listing.priceMax)}`
      : formatINR(listing.priceMin);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white transition-shadow hover:shadow-md">
      <button onClick={() => onSelect(animal)} className="relative block text-left" aria-label={listing.title}>
        <RealisticCattlePhoto
          species={animal.species}
          breed={animal.breed}
          imageUrl={animal.images[0]?.url}
          alt={listing.title}
          className="aspect-4/3 w-full"
        />
        <span className={`absolute left-3 top-3 rounded-md px-2 py-0.5 text-xs font-semibold ${status.cls}`}>{status.label}</span>
      </button>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-stone-900 leading-snug line-clamp-2">
            {animal.breed} {animal.species === 'BUFFALO' ? t('भैंस', 'buffalo') : t('गाय', 'cow')}
          </h3>
          {animal.yieldVerificationStatus === 'VERIFIED_ON_FARM' && (
            <BadgeCheck className="w-5 h-5 shrink-0 text-brand-600" aria-label={t('फार्म पर जाँचा गया', 'Verified on farm')} />
          )}
        </div>

        <dl className="mt-3 space-y-1.5 text-sm text-stone-600">
          {animal.reportedMilkYieldLpd ? (
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-stone-400" aria-hidden />
              <dt className="sr-only">{t('दूध', 'Milk yield')}</dt>
              <dd>
                <span className="font-semibold text-stone-900">{animal.reportedMilkYieldLpd} {t('ली./दिन', 'L/day')}</span>
              </dd>
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-stone-400" aria-hidden />
            <dt className="sr-only">{t('उम्र', 'Age')}</dt>
            <dd>
              {animal.ageYears} {t('वर्ष', 'yrs')}
              {animal.lactationNumber ? ` · ${t(`ब्यांत ${animal.lactationNumber}`, `Lactation ${animal.lactationNumber}`)}` : ''}
            </dd>
          </div>
          {listing.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-stone-400" aria-hidden />
              <dt className="sr-only">{t('स्थान', 'Location')}</dt>
              <dd className="truncate">{listing.location}</dd>
            </div>
          )}
        </dl>

        <p className="mt-4 text-lg font-semibold text-stone-900">{price}</p>

        <div className="mt-4 grid grid-cols-2 gap-2 pt-1">
          <button onClick={() => onSelect(animal)} className="btn-secondary px-3!">
            {t('विवरण', 'Details')}
          </button>
          {onQuickWhatsApp && (
            <button onClick={() => onQuickWhatsApp(animal)} className="btn-whatsapp px-3!">
              <MessageCircle className="w-4 h-4" aria-hidden />
              {t('पूछें', 'Enquire')}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
