import React, { useEffect, useState } from 'react';
import { Building2, Phone, LayoutTemplate, Mail, Share2, Save, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { BUSINESS_CONFIG, BusinessConfig, applySettings } from '../../config/business';
import { settingsApi, SmtpSettingsView } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

type Tab = 'business' | 'contact' | 'content' | 'social' | 'email';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'business', label: 'Business', icon: <Building2 className="w-4 h-4" /> },
  { id: 'contact', label: 'Contact & Location', icon: <Phone className="w-4 h-4" /> },
  { id: 'content', label: 'Website Content', icon: <LayoutTemplate className="w-4 h-4" /> },
  { id: 'social', label: 'Social Links', icon: <Share2 className="w-4 h-4" /> },
  { id: 'email', label: 'Email (SMTP)', icon: <Mail className="w-4 h-4" /> },
];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-slate-500 mt-1">{hint}</span>}
    </label>
  );
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20';

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputClass} />;
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={inputClass} />;
}

export const SiteSettingsPanel: React.FC = () => {
  const { showToast } = useNotification();
  const [tab, setTab] = useState<Tab>('business');
  const [site, setSite] = useState<BusinessConfig>(() => structuredClone(BUSINESS_CONFIG));
  const [smtp, setSmtp] = useState<SmtpSettingsView | null>(null);
  const [smtpPassword, setSmtpPassword] = useState('');
  const [testTo, setTestTo] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    settingsApi.getSite().then(setSite).catch(() => undefined);
    settingsApi.getSmtp().then(setSmtp).catch(() => undefined);
  }, []);

  const update = <K extends keyof BusinessConfig>(section: K, patch: Partial<BusinessConfig[K]>) =>
    setSite((prev) => ({ ...prev, [section]: { ...(prev[section] as object), ...patch } }));

  const saveSite = async () => {
    setSaving(true);
    try {
      const saved = await settingsApi.saveSite(site);
      applySettings(saved);
      setSite(saved);
      document.title = saved.brandName;
      showToast('Settings saved. The website now shows the updated details.', 'SUCCESS');
    } catch (err: any) {
      showToast(err.message || 'Could not save settings', 'ERROR');
    } finally {
      setSaving(false);
    }
  };

  const saveSmtp = async () => {
    if (!smtp) return;
    setSaving(true);
    try {
      const saved = await settingsApi.saveSmtp({ ...smtp, password: smtpPassword });
      setSmtp(saved);
      setSmtpPassword('');
      showToast('Email settings saved.', 'SUCCESS');
    } catch (err: any) {
      showToast(err.message || 'Could not save email settings', 'ERROR');
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    setTesting(true);
    try {
      await settingsApi.testSmtp(testTo);
      showToast(`Test email sent to ${testTo}`, 'SUCCESS');
    } catch (err: any) {
      showToast(err.message || 'Test email failed', 'ERROR');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Website & Business Settings</h2>
        <p className="text-sm text-slate-500 mt-1">
          Everything here appears on the public website. Changes take effect as soon as you save.
        </p>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-slate-200 mb-6 -mx-1 px-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        {tab === 'business' && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Business name (English)">
              <TextInput value={site.brandName} onChange={(e) => setSite({ ...site, brandName: e.target.value })} />
            </Field>
            <Field label="Business name (Hindi)">
              <TextInput value={site.hindiBrandName} onChange={(e) => setSite({ ...site, hindiBrandName: e.target.value })} />
            </Field>
            <Field label="Owner name (English)">
              <TextInput value={site.ownerName} onChange={(e) => setSite({ ...site, ownerName: e.target.value })} />
            </Field>
            <Field label="Owner name (Hindi)">
              <TextInput value={site.hindiOwnerName} onChange={(e) => setSite({ ...site, hindiOwnerName: e.target.value })} />
            </Field>
            <Field label="Years of experience" hint="Shown as a trust badge, e.g. 25+">
              <TextInput value={site.experienceYears} onChange={(e) => setSite({ ...site, experienceYears: e.target.value })} />
            </Field>
            <Field label="Tagline">
              <TextInput value={site.subTagline} onChange={(e) => setSite({ ...site, subTagline: e.target.value })} />
            </Field>
          </div>
        )}

        {tab === 'contact' && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Phone (as displayed)" hint="e.g. +91 97928 20684">
              <TextInput value={site.contacts.phone} onChange={(e) => update('contacts', { phone: e.target.value })} />
            </Field>
            <Field label="WhatsApp number" hint="Digits only with country code, e.g. 919792820684">
              <TextInput
                value={site.contacts.whatsapp}
                onChange={(e) => update('contacts', { whatsapp: e.target.value.replace(/\D/g, '') })}
              />
            </Field>
            <Field label="Public email">
              <TextInput type="email" value={site.contacts.email} onChange={(e) => update('contacts', { email: e.target.value })} />
            </Field>
            <Field label="Second contact person" hint="Optional, shown next to the owner">
              <TextInput
                value={site.contacts.secondaryContactName}
                onChange={(e) => update('contacts', { secondaryContactName: e.target.value })}
              />
            </Field>
            <Field label="Working hours">
              <TextInput value={site.contacts.workingHours} onChange={(e) => update('contacts', { workingHours: e.target.value })} />
            </Field>
            <Field label="Milking / inspection timings">
              <TextInput value={site.contacts.milkingShifts} onChange={(e) => update('contacts', { milkingShifts: e.target.value })} />
            </Field>
            <Field label="Address (English)">
              <TextInput
                value={site.location.addressSummary}
                onChange={(e) => update('location', { addressSummary: e.target.value })}
              />
            </Field>
            <Field label="Address (Hindi)">
              <TextInput
                value={site.location.displayAddress}
                onChange={(e) => update('location', { displayAddress: e.target.value })}
              />
            </Field>
            <Field label="PIN code">
              <TextInput value={site.location.pinCode} onChange={(e) => update('location', { pinCode: e.target.value })} />
            </Field>
            <Field label="Google Maps link" hint="Optional — adds a 'Get directions' button">
              <TextInput value={site.location.mapUrl} onChange={(e) => update('location', { mapUrl: e.target.value })} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Service areas" hint="One per line">
                <TextArea
                  rows={4}
                  value={site.serviceAreas.join('\n')}
                  onChange={(e) =>
                    setSite({ ...site, serviceAreas: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })
                  }
                />
              </Field>
            </div>
          </div>
        )}

        {tab === 'content' && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Homepage headline (English)">
              <TextArea value={site.content.heroTitleEn} onChange={(e) => update('content', { heroTitleEn: e.target.value })} />
            </Field>
            <Field label="Homepage headline (Hindi)">
              <TextArea value={site.content.heroTitleHi} onChange={(e) => update('content', { heroTitleHi: e.target.value })} />
            </Field>
            <Field label="Homepage intro (English)">
              <TextArea rows={4} value={site.content.heroSubtitleEn} onChange={(e) => update('content', { heroSubtitleEn: e.target.value })} />
            </Field>
            <Field label="Homepage intro (Hindi)">
              <TextArea rows={4} value={site.content.heroSubtitleHi} onChange={(e) => update('content', { heroSubtitleHi: e.target.value })} />
            </Field>
            <Field label="Announcement bar (English)" hint="Optional — shows a banner at the top of every page">
              <TextInput value={site.content.announcementEn} onChange={(e) => update('content', { announcementEn: e.target.value })} />
            </Field>
            <Field label="Announcement bar (Hindi)">
              <TextInput value={site.content.announcementHi} onChange={(e) => update('content', { announcementHi: e.target.value })} />
            </Field>
            <Field label="Footer description (English)">
              <TextArea value={site.content.footerAboutEn} onChange={(e) => update('content', { footerAboutEn: e.target.value })} />
            </Field>
            <Field label="Footer description (Hindi)">
              <TextArea value={site.content.footerAboutHi} onChange={(e) => update('content', { footerAboutHi: e.target.value })} />
            </Field>
          </div>
        )}

        {tab === 'social' && (
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Facebook page URL">
              <TextInput value={site.social.facebook} onChange={(e) => update('social', { facebook: e.target.value })} />
            </Field>
            <Field label="Instagram URL">
              <TextInput value={site.social.instagram} onChange={(e) => update('social', { instagram: e.target.value })} />
            </Field>
            <Field label="YouTube URL">
              <TextInput value={site.social.youtube} onChange={(e) => update('social', { youtube: e.target.value })} />
            </Field>
          </div>
        )}

        {tab === 'email' && (
          <>
            {!smtp ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading email settings…
              </div>
            ) : (
              <div className="space-y-5">
                <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-emerald-700"
                    checked={smtp.enabled}
                    onChange={(e) => setSmtp({ ...smtp, enabled: e.target.checked })}
                  />
                  <span>
                    <span className="block text-sm font-medium text-slate-900">Send email notifications</span>
                    <span className="block text-xs text-slate-500">
                      Get an email every time a customer submits an enquiry or bulk order request.
                    </span>
                  </span>
                </label>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="SMTP host" hint="e.g. smtp.gmail.com">
                    <TextInput value={smtp.host} onChange={(e) => setSmtp({ ...smtp, host: e.target.value })} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Port">
                      <TextInput
                        type="number"
                        value={smtp.port}
                        onChange={(e) => setSmtp({ ...smtp, port: Number(e.target.value) })}
                      />
                    </Field>
                    <Field label="Security">
                      <select
                        className={inputClass}
                        value={smtp.secure ? 'ssl' : 'starttls'}
                        onChange={(e) => setSmtp({ ...smtp, secure: e.target.value === 'ssl' })}
                      >
                        <option value="starttls">STARTTLS (587)</option>
                        <option value="ssl">SSL (465)</option>
                      </select>
                    </Field>
                  </div>
                  <Field label="Username">
                    <TextInput value={smtp.user} onChange={(e) => setSmtp({ ...smtp, user: e.target.value })} autoComplete="off" />
                  </Field>
                  <Field
                    label="Password"
                    hint={smtp.hasPassword ? 'A password is saved. Leave blank to keep it.' : 'For Gmail, use an App Password.'}
                  >
                    <TextInput
                      type="password"
                      value={smtpPassword}
                      placeholder={smtp.hasPassword ? '••••••••' : ''}
                      onChange={(e) => setSmtpPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </Field>
                  <Field label="Send emails from" hint="The 'From' address customers and you will see">
                    <TextInput type="email" value={smtp.fromEmail} onChange={(e) => setSmtp({ ...smtp, fromEmail: e.target.value })} />
                  </Field>
                  <Field label="Send enquiry alerts to" hint="Usually the owner's email">
                    <TextInput type="email" value={smtp.notifyEmail} onChange={(e) => setSmtp({ ...smtp, notifyEmail: e.target.value })} />
                  </Field>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <span className="block text-sm font-medium text-slate-900 mb-2">Send a test email</span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <TextInput type="email" placeholder="you@example.com" value={testTo} onChange={(e) => setTestTo(e.target.value)} />
                    <button
                      onClick={sendTest}
                      disabled={testing || !testTo}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Send test
                    </button>
                  </div>
                  <span className="block text-xs text-slate-500 mt-1.5">Save your settings first — the test uses the saved values.</span>
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Stored in your database
          </span>
          <button
            onClick={tab === 'email' ? saveSmtp : saveSite}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};
