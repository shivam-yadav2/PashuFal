import nodemailer from 'nodemailer';
import { getSmtpSettings, getSiteSettings } from './db/repositories/settingsRepository';
import { BusinessError } from './errors';
import { Enquiry } from '../types/domain';

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function buildTransport() {
  const smtp = await getSmtpSettings(undefined, { includePassword: true });
  if (!smtp.enabled || !smtp.host || !smtp.fromEmail) return null;
  const transport = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: smtp.user ? { user: smtp.user, pass: smtp.password } : undefined,
  });
  return { transport, smtp };
}

/** Sends a test email using the saved SMTP settings. Throws BusinessError with a readable reason on failure. */
export async function sendTestEmail(to: string): Promise<void> {
  const built = await buildTransport();
  if (!built) {
    throw new BusinessError('Email is not configured. Turn on SMTP and fill in host and "From" address first.');
  }
  const site = await getSiteSettings();
  try {
    await built.transport.sendMail({
      from: built.smtp.fromEmail,
      to,
      subject: `${site.brandName} — test email`,
      text: 'Your SMTP settings are working. Enquiry notifications will be delivered to this address.',
    });
  } catch (err: any) {
    throw new BusinessError(`Could not send email: ${err?.message ?? 'unknown SMTP error'}`);
  }
}

/** Fire-and-forget notification to the owner. Never throws — an email outage must not break enquiry submission. */
export async function notifyNewEnquiry(enquiry: Enquiry): Promise<void> {
  try {
    const built = await buildTransport();
    if (!built || !built.smtp.notifyEmail) return;
    const site = await getSiteSettings();
    const rows: [string, unknown][] = [
      ['Reference', enquiry.id],
      ['Name', enquiry.customerName],
      ['Phone', enquiry.phone],
      ['Email', enquiry.email],
      ['Location', enquiry.location],
      ['Type', enquiry.enquiryType],
      ['Animal', `${enquiry.requestedQuantity} × ${enquiry.animalType}${enquiry.preferredBreed ? ` (${enquiry.preferredBreed})` : ''}`],
      ['Budget / animal', enquiry.budgetPerAnimal],
      ['Delivery to', enquiry.deliveryLocation],
      ['Notes', enquiry.additionalInstructions],
    ];
    const html = `<h2 style="font-family:sans-serif">New enquiry — ${escapeHtml(site.brandName)}</h2>
      <table style="font-family:sans-serif;border-collapse:collapse">${rows
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#555">${escapeHtml(k)}</td><td style="padding:4px 0"><strong>${escapeHtml(v)}</strong></td></tr>`)
        .join('')}</table>`;
    await built.transport.sendMail({
      from: built.smtp.fromEmail,
      to: built.smtp.notifyEmail,
      replyTo: enquiry.email || undefined,
      subject: `New enquiry ${enquiry.id} from ${enquiry.customerName}`,
      html,
    });
  } catch (err) {
    console.error('[Mailer] Failed to send enquiry notification:', err);
  }
}
