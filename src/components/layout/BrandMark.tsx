import React from 'react';
import { BUSINESS_CONFIG } from '../../config/business';

/** Monogram built from the first letter of the (admin-editable) Hindi brand name. */
export const BrandMark: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => {
  const letter = Array.from(BUSINESS_CONFIG.hindiBrandName || BUSINESS_CONFIG.brandName)[0] ?? '•';
  const dims = size === 'sm' ? 'w-8 h-8 text-base' : 'w-10 h-10 text-lg';
  return (
    <span
      aria-hidden
      className={`${dims} shrink-0 inline-flex items-center justify-center rounded-lg bg-brand-800 text-white font-semibold`}
    >
      {letter}
    </span>
  );
};
