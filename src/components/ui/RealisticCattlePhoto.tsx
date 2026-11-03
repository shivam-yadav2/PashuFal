import React, { useState } from 'react';
import { Species } from '../../types/domain';

interface RealisticCattlePhotoProps {
  species: Species;
  breed: string;
  className?: string;
  tagNumber?: string;
  imageUrl?: string;
  alt?: string;
}

export const RealisticCattlePhoto: React.FC<RealisticCattlePhotoProps> = ({
  species,
  breed,
  className = "w-full h-52",
  tagNumber,
  imageUrl,
  alt = "Dairy Cattle",
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  const isBuffalo = species === 'BUFFALO' || breed.toLowerCase().includes('murrah') || breed.toLowerCase().includes('jaffarabadi');
  const isGir = breed.toLowerCase().includes('gir');
  const isSahiwal = breed.toLowerCase().includes('sahiwal');

  // Curated photographic livestock images for real cattle presentation
  const getCattlePhoto = () => {
    if (imageUrl && !imgFailed && !imageUrl.startsWith('/assets/')) {
      return imageUrl;
    }
    if (isBuffalo) {
      return 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80';
    }
    if (breed.toLowerCase().includes('hf') || breed.toLowerCase().includes('holstein')) {
      return 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1000&q=80';
    }
    if (isSahiwal || isGir || breed.toLowerCase().includes('desi')) {
      return 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1000&q=80';
    }
    return 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=1000&q=80';
  };

  const activePhotoUrl = getCattlePhoto();

  // If a valid image URL is available and hasn't failed, render it
  if (activePhotoUrl && !imgFailed) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img
          src={activePhotoUrl}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {tagNumber && (
          <div className="absolute top-2.5 left-2.5 bg-black/75 text-amber-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
            🏷️ {tagNumber}
          </div>
        )}
      </div>
    );
  }

  // Realistic photographic SVG composition representing real Indian Murrah buffaloes and cattle
  return (
    <div className={`relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-850 to-stone-950 ${className}`}>
      {/* Photo-realistic rendering with natural lighting and depth */}
      <svg
        viewBox="0 0 400 240"
        className="w-full h-full object-cover select-none transition-transform duration-500 hover:scale-105"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Farm background sky & sheds */}
          <linearGradient id="farmSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C4B598" />
            <stop offset="60%" stopColor="#8A9A86" />
            <stop offset="100%" stopColor="#414D3E" />
          </linearGradient>

          {/* Golden morning sunlight glow */}
          <radialGradient id="morningSun" cx="80%" cy="20%" r="60%">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Buffalo glossy black hide texture with sunlight rim */}
          <linearGradient id="buffaloCoat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2A2A2A" />
            <stop offset="35%" stopColor="#1C1C1C" />
            <stop offset="70%" stopColor="#121212" />
            <stop offset="100%" stopColor="#0A0A0A" />
          </linearGradient>

          {/* Sun highlight on buffalo back */}
          <linearGradient id="sunRim" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#555555" />
            <stop offset="60%" stopColor="#777777" />
            <stop offset="100%" stopColor="#222222" />
          </linearGradient>

          {/* Sahiwal / Gir rich reddish-tan coat */}
          <linearGradient id="sahiwalCoat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C25E3E" />
            <stop offset="40%" stopColor="#9E4124" />
            <stop offset="100%" stopColor="#6E2812" />
          </linearGradient>

          {/* Horn texture */}
          <linearGradient id="hornGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#44403C" />
            <stop offset="50%" stopColor="#292524" />
            <stop offset="100%" stopColor="#0C0A09" />
          </linearGradient>
        </defs>

        {/* 1. Background Farm Environment */}
        <rect width="400" height="240" fill="url(#farmSky)" />
        <rect width="400" height="240" fill="url(#morningSun)" />

        {/* Rural brick stable and trees silhouette in background */}
        <path d="M0 130 L120 115 L260 118 L400 110 L400 160 L0 160 Z" fill="#2E372A" opacity="0.6" />
        <rect x="0" y="145" width="400" height="95" fill="#4A3F35" />
        <path d="M0 160 Q100 155 200 162 T400 158 L400 240 L0 240 Z" fill="#3B3127" />

        {/* Hay and straw texture on paddock floor */}
        <ellipse cx="200" cy="225" rx="190" ry="25" fill="#524334" opacity="0.8" />
        <path d="M40 215 L55 210 M120 220 L135 214 M280 218 L295 212 M340 222 L355 216" stroke="#D97706" strokeWidth="1.5" opacity="0.4" />

        {/* 2. Cattle Shadow */}
        <ellipse cx="210" cy="218" rx="125" ry="14" fill="#000000" fillOpacity="0.4" />

        {/* 3. The Animal (Photo Silhouette with Highlights) */}
        {isBuffalo ? (
          /* ================= PRIZED MURRAH BUFFALO ================= */
          <g transform="translate(15, 0)">
            {/* Back Left Leg */}
            <path d="M125 145 C122 170, 126 195, 128 218 L142 218 C141 195, 143 170, 145 145 Z" fill="#0D0D0D" />
            <rect x="126" y="212" width="16" height="7" rx="1" fill="#050505" />

            {/* Back Right Leg */}
            <path d="M148 148 C145 170, 150 195, 152 216 L164 216 C163 195, 166 170, 168 148 Z" fill="#181818" />
            <rect x="150" y="210" width="14" height="7" rx="1" fill="#050505" />

            {/* Full Milk Udder (Thaili) with 4 symmetric teats */}
            <path d="M165 148 C165 182, 215 182, 215 148 Z" fill="#202020" stroke="#121212" strokeWidth="1" />
            <rect x="175" y="174" width="4.5" height="11" rx="2" fill="#171717" />
            <rect x="186" y="176" width="4.5" height="11" rx="2" fill="#171717" />
            <rect x="196" y="176" width="4.5" height="11" rx="2" fill="#171717" />
            <rect x="206" y="174" width="4.5" height="11" rx="2" fill="#171717" />

            {/* Front Left Leg */}
            <path d="M265 140 C262 165, 264 195, 265 218 L278 218 C280 195, 282 165, 285 140 Z" fill="#0F0F0F" />
            <rect x="264" y="212" width="14" height="7" rx="1" fill="#050505" />

            {/* Front Right Leg */}
            <path d="M285 138 C282 165, 285 195, 288 216 L300 216 C302 195, 303 165, 304 138 Z" fill="#1E1E1E" />
            <rect x="287" y="210" width="13" height="7" rx="1" fill="#050505" />

            {/* Massive Deep Body Barrel */}
            <path
              d="M110 115 C120 95, 175 92, 220 90 C265 88, 305 100, 315 125 C320 152, 295 168, 240 168 C175 168, 115 164, 110 138 Z"
              fill="url(#buffaloCoat)"
            />

            {/* Top sunlight sheen along spine */}
            <path
              d="M125 106 C170 94, 235 91, 300 96 C270 91, 195 90, 130 102 Z"
              fill="#666666"
              opacity="0.35"
            />

            {/* Strong Buffalo Neck & Head */}
            <path
              d="M290 115 L335 88 C345 82, 360 98, 350 118 L320 138 Z"
              fill="url(#buffaloCoat)"
            />

            {/* Broad Muzzle & Moist Nostrils */}
            <ellipse cx="352" cy="112" rx="15" ry="11" fill="#0D0D0D" />
            <ellipse cx="349" cy="111" rx="2.5" ry="1.5" fill="#000000" />
            <ellipse cx="355" cy="112" rx="2.5" ry="1.5" fill="#000000" />
            {/* Dew drop shine on muzzle */}
            <circle cx="347" cy="107" r="1.5" fill="#888888" opacity="0.6" />

            {/* Murrah Signature Tightly Curled Horns */}
            <path
              d="M322 84 C316 52, 342 48, 338 68 C335 80, 325 84, 322 84 Z"
              fill="url(#hornGrad)"
              stroke="#525252"
              strokeWidth="0.8"
            />
            {/* Second Horn */}
            <path
              d="M312 80 C306 50, 328 46, 325 66 C322 78, 314 81, 312 80 Z"
              fill="url(#hornGrad)"
              opacity="0.8"
            />

            {/* Eye with gentle life reflection */}
            <ellipse cx="334" cy="94" rx="4" ry="3" fill="#050505" />
            <circle cx="335" cy="93" r="1.2" fill="#FFFFFF" opacity="0.9" />

            {/* Alert ear */}
            <ellipse cx="316" cy="92" rx="8" ry="4" fill="#1C1C1C" transform="rotate(-18 316 92)" />

            {/* Tail with rich switch */}
            <path d="M110 118 C98 128, 96 170, 99 188" stroke="#141414" strokeWidth="4" strokeLinecap="round" />
            <path d="M96 186 C90 204, 104 204, 101 186 Z" fill="#050505" />
          </g>
        ) : (
          /* ================= PURE DESI COW (SAHIWAL / GIR) ================= */
          <g transform="translate(15, 0)">
            {/* Legs */}
            <rect x="125" y="145" width="13" height="70" rx="3" fill="#5A2411" />
            <rect x="145" y="148" width="12" height="66" rx="3" fill="#753018" />
            <rect x="265" y="140" width="13" height="75" rx="3" fill="#5A2411" />
            <rect x="285" y="138" width="12" height="73" rx="3" fill="#753018" />
            <rect x="125" y="210" width="13" height="7" rx="1" fill="#1C1917" />
            <rect x="145" y="209" width="12" height="7" rx="1" fill="#1C1917" />
            <rect x="265" y="210" width="13" height="7" rx="1" fill="#1C1917" />
            <rect x="285" y="209" width="12" height="7" rx="1" fill="#1C1917" />

            {/* Cow Udder */}
            <path d="M165 145 C165 175, 210 175, 210 145 Z" fill="#FDA4AF" opacity="0.9" />
            <rect x="175" y="170" width="4" height="9" rx="1.5" fill="#F43F5E" opacity="0.8" />
            <rect x="185" y="172" width="4" height="9" rx="1.5" fill="#F43F5E" opacity="0.8" />
            <rect x="195" y="172" width="4" height="9" rx="1.5" fill="#F43F5E" opacity="0.8" />

            {/* Cow Body */}
            <path
              d="M110 115 C120 95, 175 95, 220 90 C265 88, 305 100, 315 125 C320 152, 295 168, 240 168 C175 168, 115 164, 110 138 Z"
              fill={isSahiwal || isGir ? "url(#sahiwalCoat)" : "#E2E8F0"}
            />

            {/* Vedic Zebu Hump (कूबड़) */}
            <path
              d="M245 90 C250 62, 280 62, 288 92 Z"
              fill={isSahiwal || isGir ? "#802C12" : "#CBD5E1"}
            />

            {/* Folded Dewlap (गलकम्बल) */}
            <path
              d="M295 130 C305 152, 320 155, 322 140 Z"
              fill={isSahiwal || isGir ? "#A53C1B" : "#F1F5F9"}
            />

            {/* Head and Horns */}
            <path d="M290 115 L335 88 C345 82, 360 98, 350 118 L320 138 Z" fill={isSahiwal || isGir ? "#8F3316" : "#E2E8F0"} />
            <ellipse cx="352" cy="112" rx="14" ry="10" fill="#431407" />

            {/* Curved Gir / Sahiwal Horns */}
            <path d="M320 84 C315 55, 300 65, 312 78 Z" fill="#292524" />
            <ellipse cx="334" cy="94" rx="4" ry="3" fill="#050505" />
            <circle cx="335" cy="93" r="1.2" fill="#FFFFFF" />

            {/* Tail */}
            <path d="M110 118 C98 128, 96 170, 99 188" stroke="#5A2411" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M96 186 C90 202, 102 202, 100 186 Z" fill="#1C1917" />
          </g>
        )}
      </svg>

      {/* Clean Photo Badge */}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        {tagNumber && (
          <span className="bg-black/75 text-amber-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
            🏷️ {tagNumber}
          </span>
        )}
        <span className="bg-emerald-950/80 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-xs border border-emerald-800/60">
          Verified Healthy
        </span>
      </div>

      <div className="absolute bottom-2.5 right-3 text-[11px] font-semibold tracking-wider text-amber-200/90 drop-shadow-md">
        {breed} · {species}
      </div>
    </div>
  );
};
