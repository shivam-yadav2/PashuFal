import React, { useState } from 'react';
import { Animal } from '../../types/domain';
import { formatINR } from '../../lib/currency';
import { useLanguage } from '../../context/LanguageContext';
import { RealisticCattlePhoto } from '../ui/RealisticCattlePhoto';

interface AnimalCardProps {
  animal: Animal;
  onSelect: (animal: Animal) => void;
  onQuickWhatsApp?: (animal: Animal) => void;
}

export const AnimalCard: React.FC<AnimalCardProps> = ({
  animal,
  onSelect,
  onQuickWhatsApp,
}) => {
  const { listing } = animal;
  const { t } = useLanguage();
  const [isFavorite, setIsFavorite] = useState(false);

  const isAvailable = listing.status === 'AVAILABLE';
  const isReserved = listing.status === 'RESERVED';

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col group">
      
      {/* 1. Real Photographic Image Container */}
      <div className="relative">
        <RealisticCattlePhoto
          species={animal.species}
          breed={animal.breed}
          tagNumber={animal.tagNumber}
          imageUrl={animal.images[0]?.url}
          alt={listing.title}
          className="w-full h-52 object-cover"
        />

        {/* Top Left: "Available" Badge matching collage */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {isAvailable ? (
            <span className="bg-emerald-600 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-md border border-emerald-400">
              {t('Available', 'Available')}
            </span>
          ) : isReserved ? (
            <span className="bg-amber-500 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full shadow-md">
              {t('Reserved', 'Reserved')}
            </span>
          ) : (
            <span className="bg-slate-700 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
              {listing.status}
            </span>
          )}
        </div>

        {/* Top Right: Wishlist Heart Button matching collage */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-md cursor-pointer ${
            isFavorite
              ? 'bg-rose-50 text-rose-500 border border-rose-200'
              : 'bg-white/90 backdrop-blur-xs text-slate-400 hover:text-rose-500'
          }`}
        >
          <span className="text-sm">{isFavorite ? '❤️' : '🤍'}</span>
        </button>

        {/* Bottom Tag Overlay: Daily Milk Yield */}
        {animal.reportedMilkYieldLpd && (
          <div className="absolute bottom-2.5 left-2.5 bg-slate-950/80 backdrop-blur-xs text-amber-300 text-xs font-black px-3 py-1 rounded-xl border border-white/10 shadow-xs flex items-center gap-1.5">
            <span>🥛</span>
            <span>{animal.reportedMilkYieldLpd} {t('Ltr/Day', 'Ltr/Day')}</span>
          </div>
        )}
      </div>

      {/* 2. Card Content Matching Collage */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        
        <div>
          {/* Title */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-black text-slate-900 text-base group-hover:text-emerald-900 transition-colors line-clamp-1">
              {animal.breed} {animal.species === 'BUFFALO' ? t('भैंस', 'Buffalo') : t('गाय', 'Cow')}
            </h3>
            <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0">
              #{animal.id}
            </span>
          </div>

          {/* Specs Row with Icons Matching Collage */}
          <div className="mt-2 text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="text-slate-400">🎂</span>
                <span>{t('Age:', 'Age:')} <strong>{animal.ageYears} {t('वर्ष', 'Years')}</strong></span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="text-slate-400">🥛</span>
                <span>{t('Milk:', 'Milk:')} <strong className="text-emerald-800">{animal.reportedMilkYieldLpd || '16'} {t('Ltr/Day', 'Ltr/Day')}</strong></span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500 pt-0.5">
              <span>📍</span>
              <span className="truncate">{listing.location || 'Khardaha Nilkanth, Lar (Deoria)'}</span>
            </div>
          </div>

          {/* Price Tag matching collage */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-baseline justify-between">
            <span className="text-[11px] font-semibold text-slate-500">{t('कीमत (Price):', 'Price:')}</span>
            <span className="font-mono font-black text-lg text-emerald-900">
              {formatINR(listing.priceMin)}
            </span>
          </div>
        </div>

        {/* 3. Action Buttons matching collage: [ View Details ] [ 💬 Enquire Now ] */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onSelect(animal)}
            className="py-2.5 px-3 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer text-center"
          >
            {t('View Details', 'View Details')}
          </button>
          
          <button
            onClick={() => onQuickWhatsApp ? onQuickWhatsApp(animal) : null}
            className="py-2.5 px-3 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-2xs hover:shadow-md cursor-pointer text-center flex items-center justify-center gap-1.5"
          >
            <span>💬</span>
            <span>{t('Enquire Now', 'Enquire Now')}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
