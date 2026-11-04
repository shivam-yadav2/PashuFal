import React from 'react';
import { Phone, Mail, MapPin, MessageCircle, Facebook, Instagram, Youtube, Navigation } from 'lucide-react';
import { BUSINESS_CONFIG } from '../../config/business';
import { PublicPage, whatsappLink } from './TopBar';
import { useLanguage } from '../../context/LanguageContext';
import { BrandMark } from './BrandMark';

interface FooterProps {
  onNavigatePage?: (page: PublicPage) => void;
}

const LINKS: { id: PublicPage; labelHi: string; labelEn: string }[] = [
  { id: 'ANIMALS', labelHi: 'उपलब्ध पशु', labelEn: 'Available animals' },
  { id: 'BULK_ORDER', labelHi: 'बल्क ऑर्डर', labelEn: 'Bulk orders for farms' },
  { id: 'TRANSPORT', labelHi: 'पशु परिवहन', labelEn: 'Animal transport' },
  { id: 'ABOUT', labelHi: 'हमारे बारे में', labelEn: 'About us' },
  { id: 'CONTACT', labelHi: 'संपर्क', labelEn: 'Contact' },
  { id: 'DASHBOARD', labelHi: 'मेरा डैशबोर्ड', labelEn: 'My dashboard' },
];

export const Footer: React.FC<FooterProps> = ({ onNavigatePage }) => {
  const { t } = useLanguage();
  const { contacts, location, content, social, serviceAreas } = BUSINESS_CONFIG;
  const socials = [
    { href: social.facebook, icon: Facebook, label: 'Facebook' },
    { href: social.instagram, icon: Instagram, label: 'Instagram' },
    { href: social.youtube, icon: Youtube, label: 'YouTube' },
  ].filter((s) => s.href);

  return (
    <footer className="bg-brand-900 text-brand-100/80 text-sm">
      <div className="container-page py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-1">
          <div className="flex items-center gap-3">
            <BrandMark />
            <span className="font-semibold text-white leading-tight">
              {t(BUSINESS_CONFIG.hindiBrandName, BUSINESS_CONFIG.brandName)}
            </span>
          </div>
          <p className="text-brand-100/70 leading-relaxed">{t(content.footerAboutHi, content.footerAboutEn)}</p>
          <p className="text-brand-100/60">
            {t('प्रोपराइटर', 'Proprietor')}: <span className="text-white">{t(BUSINESS_CONFIG.hindiOwnerName, BUSINESS_CONFIG.ownerName)}</span>
          </p>
          {socials.length > 0 && (
            <div className="flex gap-2 pt-1">
              {socials.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">{t('लिंक', 'Explore')}</h4>
          <ul className="space-y-2.5">
            {LINKS.map((link) => (
              <li key={link.id}>
                <button onClick={() => onNavigatePage?.(link.id)} className="hover:text-white transition-colors">
                  {t(link.labelHi, link.labelEn)}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">{t('सेवा क्षेत्र', 'Service areas')}</h4>
          <ul className="space-y-2.5">
            {serviceAreas.map((area) => (
              <li key={area} className="leading-snug">{area}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">{t('संपर्क करें', 'Get in touch')}</h4>
          <ul className="space-y-3">
            <li>
              <a href={`tel:${contacts.rawPhone || contacts.phone}`} className="flex items-start gap-2.5 hover:text-white">
                <Phone className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  <span className="block text-white font-medium">{contacts.phone}</span>
                  <span className="block text-brand-100/60 text-xs">
                    {BUSINESS_CONFIG.ownerName}
                    {contacts.secondaryContactName ? ` · ${contacts.secondaryContactName}` : ''}
                  </span>
                </span>
              </a>
            </li>
            {contacts.email && (
              <li>
                <a href={`mailto:${contacts.email}`} className="flex items-center gap-2.5 hover:text-white break-all">
                  <Mail className="w-4 h-4 shrink-0" />
                  {contacts.email}
                </a>
              </li>
            )}
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                {t(location.displayAddress, location.addressSummary)}
                {location.pinCode ? ` – ${location.pinCode}` : ''}
              </span>
            </li>
          </ul>
          <div className="flex flex-wrap gap-2 mt-5">
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn-whatsapp px-4! py-2!">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            {location.mapUrl && (
              <a
                href={location.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                <Navigation className="w-4 h-4" /> {t('रास्ता देखें', 'Directions')}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-brand-100/50">
          <p>
            © {new Date().getFullYear()} {BUSINESS_CONFIG.brandName}. {t('सर्वाधिकार सुरक्षित।', 'All rights reserved.')}
          </p>
          <p>{location.addressSummary}</p>
        </div>
      </div>
    </footer>
  );
};
