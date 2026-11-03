import React from 'react';
import { Species } from '../../types/domain';

interface CattleIllustrationProps {
  species: Species;
  breed: string;
  className?: string;
  tagNumber?: string;
}

export const CattleIllustration: React.FC<CattleIllustrationProps> = ({
  species,
  breed,
  className = "w-full h-48",
  tagNumber
}) => {
  const isBuffalo = species === 'BUFFALO' || breed.toLowerCase().includes('murrah') || breed.toLowerCase().includes('jaffarabadi');
  const isGir = breed.toLowerCase().includes('gir');
  const isSahiwal = breed.toLowerCase().includes('sahiwal');
  const isTharparkar = breed.toLowerCase().includes('tharparkar');
  const isHFCross = breed.toLowerCase().includes('hf') || breed.toLowerCase().includes('holstein');

  // Background and body tones based on breed
  let bodyColor = isBuffalo ? "#1A1A1A" : isSahiwal ? "#8B3A22" : isGir ? "#A2482B" : isTharparkar ? "#E2E8F0" : "#262626";
  let bellyColor = isBuffalo ? "#111111" : isSahiwal ? "#A74A30" : isGir ? "#BA5D3E" : isTharparkar ? "#F1F5F9" : "#FFFFFF";
  let bgGradient = isBuffalo 
    ? "from-[#1F2937]/90 to-[#111827]" 
    : isGir || isSahiwal 
    ? "from-[#FEF3C7]/80 to-[#FDE68A]/60" 
    : "from-[#F1F5F9] to-[#E2E8F0]";

  return (
    <div className={`relative overflow-hidden flex items-center justify-center bg-gradient-to-b ${bgGradient} ${className}`}>
      {/* Subtle pastoral background rays */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#142921_1px,transparent_1px)] [background-size:16px_16px]" />

      <svg
        viewBox="0 0 320 200"
        className="w-full h-full max-h-52 object-contain filter drop-shadow-md select-none transition-transform duration-300 hover:scale-[1.02]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ground shadow */}
        <ellipse cx="160" cy="180" rx="100" ry="8" fill="#000000" fillOpacity="0.18" />

        {/* Back Legs */}
        <rect x="95" y="115" width="12" height="65" rx="4" fill={bodyColor} filter="brightness(0.85)" />
        <rect x="108" y="120" width="10" height="60" rx="3" fill={bodyColor} filter="brightness(0.75)" />
        <rect x="205" y="115" width="12" height="65" rx="4" fill={bodyColor} filter="brightness(0.85)" />
        <rect x="220" y="118" width="10" height="62" rx="3" fill={bodyColor} filter="brightness(0.75)" />

        {/* Hooves */}
        <rect x="95" y="174" width="12" height="7" rx="1" fill="#0F172A" />
        <rect x="108" y="174" width="10" height="7" rx="1" fill="#0F172A" />
        <rect x="205" y="174" width="12" height="7" rx="1" fill="#0F172A" />
        <rect x="220" y="174" width="10" height="7" rx="1" fill="#0F172A" />

        {/* Full Milking Udder with Teats */}
        <path
          d="M130 120 C130 145, 170 145, 170 120 Z"
          fill={isBuffalo ? "#2B2B2B" : "#FBCFE8"}
          stroke={isBuffalo ? "#1A1A1A" : "#F472B6"}
          strokeWidth="1.5"
        />
        {/* 4 Well-Placed Teats */}
        <rect x="138" y="138" width="4" height="10" rx="2" fill={isBuffalo ? "#1F2937" : "#F472B6"} />
        <rect x="146" y="140" width="4" height="10" rx="2" fill={isBuffalo ? "#1F2937" : "#F472B6"} />
        <rect x="154" y="140" width="4" height="10" rx="2" fill={isBuffalo ? "#1F2937" : "#F472B6"} />
        <rect x="162" y="138" width="4" height="10" rx="2" fill={isBuffalo ? "#1F2937" : "#F472B6"} />

        {/* Cattle Body Trunk */}
        <path
          d="M85 85 C95 70, 140 72, 170 70 C205 68, 235 78, 240 100 C245 125, 230 135, 185 135 C135 135, 90 132, 85 110 Z"
          fill={bodyColor}
        />

        {/* Zebu Hump for Desi Cows (Sahiwal & Gir) */}
        {!isBuffalo && (
          <path
            d="M185 70 C190 48, 215 48, 222 72 Z"
            fill={bodyColor}
          />
        )}

        {/* Distinctive spots for Gir or HF */}
        {isGir && (
          <>
            <circle cx="120" cy="100" r="10" fill="#FFFFFF" fillOpacity="0.4" />
            <circle cx="150" cy="95" r="14" fill="#FFFFFF" fillOpacity="0.35" />
            <circle cx="185" cy="105" r="8" fill="#FFFFFF" fillOpacity="0.4" />
          </>
        )}
        {isHFCross && (
          <>
            <path d="M110 88 C125 80, 145 95, 130 115 C115 125, 105 105, 110 88 Z" fill="#FFFFFF" />
            <path d="M165 85 C185 75, 195 100, 180 120 C165 115, 155 95, 165 85 Z" fill="#FFFFFF" />
          </>
        )}

        {/* Dewlap (Gal Kambal) for indigenous Indian cattle */}
        {!isBuffalo && (
          <path
            d="M225 105 C235 125, 248 128, 250 115 Z"
            fill={bellyColor}
            opacity="0.9"
          />
        )}

        {/* Front Legs */}
        <rect x="195" y="112" width="11" height="66" rx="4" fill={bodyColor} />
        <rect x="85" y="112" width="11" height="66" rx="4" fill={bodyColor} />
        <rect x="195" y="174" width="11" height="7" rx="1" fill="#0F172A" />
        <rect x="85" y="174" width="11" height="7" rx="1" fill="#0F172A" />

        {/* Neck and Head */}
        <path
          d="M220 90 L255 70 C265 65, 275 80, 268 95 L245 112 Z"
          fill={bodyColor}
        />

        {/* Snout and Muzzle */}
        <ellipse cx="270" cy="90" rx="12" ry="9" fill={isBuffalo ? "#0A0A0A" : "#642211"} />
        <circle cx="268" cy="89" r="2" fill="#000000" />
        <circle cx="273" cy="90" r="2" fill="#000000" />

        {/* Horns based on breed */}
        {isBuffalo ? (
          // Murrah Tightly Curled Horns
          <path
            d="M245 68 C242 45, 260 42, 258 58 C256 68, 248 70, 245 68 Z"
            fill="#0F172A"
            stroke="#334155"
            strokeWidth="1"
          />
        ) : isGir ? (
          // Long backward curving Gir horns & convex head
          <path
            d="M245 65 C235 40, 220 50, 235 62 Z"
            fill="#451A03"
          />
        ) : (
          // Standard upright or forward curving cow horns
          <path
            d="M248 66 C252 48, 260 48, 258 64 Z"
            fill="#475569"
          />
        )}

        {/* Ears */}
        {isGir ? (
          // Long pendulous leaf-like Gir ears
          <path
            d="M248 75 C242 98, 232 98, 240 76 Z"
            fill={bodyColor}
            stroke="#78350F"
            strokeWidth="0.8"
          />
        ) : (
          <ellipse cx="242" cy="74" rx="7" ry="4" fill={bodyColor} transform="rotate(-25 242 74)" />
        )}

        {/* Gentle Eye */}
        <ellipse cx="254" cy="76" rx="3.5" ry="2.5" fill="#000000" />
        <circle cx="255" cy="75" r="1" fill="#FFFFFF" />

        {/* Tail */}
        <path
          d="M85 88 C75 95, 74 135, 76 150"
          stroke={bodyColor}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Tail switch tuft */}
        <path
          d="M74 148 C70 162, 80 162, 78 148 Z"
          fill="#0F172A"
        />
      </svg>

      {/* Ear Tag badge */}
      {tagNumber && (
        <div className="absolute top-3 left-3 bg-amber-400/90 text-amber-950 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
          🏷️ {tagNumber}
        </div>
      )}

      {/* Breed Watermark */}
      <div className="absolute bottom-2 right-3 text-[11px] font-medium tracking-wider text-slate-500/80 uppercase">
        {breed} · {species}
      </div>
    </div>
  );
};
