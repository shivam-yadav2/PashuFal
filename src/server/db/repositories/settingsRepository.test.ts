import { getSiteSettings, saveSiteSettings, getSmtpSettings, saveSmtpSettings } from './settingsRepository';
import { getTestPool, resetDatabase, closeTestPool } from '../testHelpers';
import { BUSINESS_CONFIG } from '../../../config/business';

const pool = getTestPool();

describe('settingsRepository', () => {
  beforeEach(() => resetDatabase());
  afterAll(() => closeTestPool());

  it('returns built-in defaults when nothing has been saved', async () => {
    const settings = await getSiteSettings(pool);
    expect(settings.brandName).toBe(BUSINESS_CONFIG.brandName);
    expect(settings.contacts.phone).toBe(BUSINESS_CONFIG.contacts.phone);
  });

  it('deep-merges a partial save over the defaults and persists it', async () => {
    await saveSiteSettings({ contacts: { email: 'info@example.com' } }, pool);
    const settings = await getSiteSettings(pool);
    expect(settings.contacts.email).toBe('info@example.com');
    expect(settings.contacts.phone).toBe(BUSINESS_CONFIG.contacts.phone);
  });

  it('ignores unknown top-level keys instead of storing arbitrary data', async () => {
    await saveSiteSettings({ brandName: 'New Name', evil: 'x' } as any, pool);
    const settings = (await getSiteSettings(pool)) as any;
    expect(settings.brandName).toBe('New Name');
    expect(settings.evil).toBeUndefined();
  });

  it('keeps the stored SMTP password when a save omits it, and never returns it in the masked view', async () => {
    await saveSmtpSettings({ enabled: true, host: 'smtp.example.com', port: 587, secure: false, user: 'u', password: 'secret', fromEmail: 'a@b.c', notifyEmail: 'd@e.f' }, pool);
    await saveSmtpSettings({ host: 'smtp2.example.com' }, pool);

    const full = await getSmtpSettings(pool, { includePassword: true });
    expect(full.host).toBe('smtp2.example.com');
    expect(full.password).toBe('secret');

    const masked = await getSmtpSettings(pool);
    expect(masked.password).toBe('');
    expect(masked.hasPassword).toBe(true);
  });
});
