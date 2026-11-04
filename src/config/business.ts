/**
 * Site-wide business settings. These are the defaults; at startup the client
 * fetches `/api/settings` and merges the admin-edited values over this object
 * (see `applySettings`), so every component reading BUSINESS_CONFIG shows the
 * values the owner set in the admin panel.
 */
export const BUSINESS_CONFIG = {
  brandName: 'Champa Dairy & Pashu Kendra',
  hindiBrandName: 'चम्पा डेयरी एवं पशु केंद्र',
  dadiName: 'Champa Devi (दादी चम्पा)',
  ownerName: 'Parmeshwar Kushwaha',
  hindiOwnerName: 'परमेश्वर कुशवाहा',
  experienceYears: '25+',
  tagline: 'दादी चम्पा के नाम से संचालित - ग्राहक को जो नस्ल और दुग्ध क्षमता चाहिए सब उपलब्ध',
  subTagline: 'High Milking Buffalo & Cow · Customer ko jo chahiye sab milega',
  location: {
    village: 'Khardaha Nilkanth',
    tehsil: 'Lar',
    district: 'Deoria',
    state: 'Uttar Pradesh',
    pinCode: '274502',
    region: 'Deoria & Purvanchal',
    addressSummary: 'Khardaha Nilkanth, Lar, Deoria, Uttar Pradesh',
    displayAddress: 'खरदहा नीलकंठ, लार, देवरिया (उत्तर प्रदेश)',
    mapUrl: '',
  },
  contacts: {
    phone: '+91 97928 20684',
    rawPhone: '9792820684',
    whatsapp: '919792820684',
    email: '',
    secondaryContactName: '',
    workingHours: '24x7 Available on Call / 6:00 AM – 8:00 PM Farm Visits',
    milkingShifts: 'Morning: 4:30 AM – 7:00 AM | Evening: 4:30 PM – 7:00 PM',
  },
  serviceAreas: [
    'Whole Deoria District (Lar, Salempur, Bhatpar Rani, Deoria Sadar, Barhaj, Rudrapur)',
    'Gorakhpur (GKP) & Surrounding Areas',
    'Bihar Border Regions (Siwan, Gopalganj nearby)',
  ],
  milkTransportNote: 'Pure Fresh Milk Transport available across whole Deoria and Gorakhpur (GKP).',
  customerGuarantee:
    'ग्राहक की पसंद सर्वोपरि — आपको जैसी भी भैंस या गाय चाहिए (दूध क्षमता, उम्र, नस्ल), आपके आर्डर पर तुरंत उपलब्ध कराई जाती है।',
  content: {
    heroTitleEn: 'Healthy, high-yield dairy cattle — verified before you buy',
    heroTitleHi: 'स्वस्थ, अधिक दूध देने वाले पशु — खरीद से पहले जाँचे हुए',
    heroSubtitleEn:
      'Every buffalo and cow is milked twice in front of you, vet-checked, and delivered safely across Deoria, Gorakhpur and the Bihar border.',
    heroSubtitleHi:
      'हर भैंस और गाय की आपके सामने दो बार दुहाई, पशु-चिकित्सक जाँच, और देवरिया, गोरखपुर व बिहार सीमा तक सुरक्षित डिलीवरी।',
    footerAboutEn:
      'High-milking buffaloes, dairy cows, bulk supply for commercial farms, and doorstep transport across Deoria and Gorakhpur.',
    footerAboutHi:
      'उच्च दुग्ध क्षमता वाली भैंस, गाय, बल्क डेयरी फार्म आपूर्ति एवं सुरक्षित वाहन परिवहन — देवरिया व गोरखपुर में।',
    announcementEn: '',
    announcementHi: '',
  },
  social: {
    facebook: '',
    instagram: '',
    youtube: '',
  },
  currency: {
    code: 'INR',
    symbol: '₹',
  },
};

export type BusinessConfig = typeof BUSINESS_CONFIG;

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? (T[K] extends any[] ? T[K] : DeepPartial<T[K]>) : T[K] };
export type BusinessSettings = DeepPartial<BusinessConfig>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Deep-merges `source` into `target` in place. Arrays are replaced, not merged. */
export function deepMerge<T extends Record<string, any>>(target: T, source: Record<string, any> | undefined): T {
  if (!source) return target;
  for (const [key, value] of Object.entries(source)) {
    if (value === undefined) continue;
    if (isPlainObject(value) && isPlainObject(target[key])) {
      deepMerge(target[key], value);
    } else {
      (target as any)[key] = value;
    }
  }
  return target;
}

/** Overlays admin-edited settings onto the live BUSINESS_CONFIG object. */
export function applySettings(settings: BusinessSettings | undefined): void {
  deepMerge(BUSINESS_CONFIG, settings as Record<string, any>);
}
