import { Pool, RowDataPacket } from 'mysql2/promise';
import { getPool } from '../mysql';
import { BUSINESS_CONFIG, BusinessConfig, BusinessSettings, deepMerge } from '../../../config/business';

const SITE_KEY = 'site';
const SMTP_KEY = 'smtp';

export interface SmtpSettings {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromEmail: string;
  notifyEmail: string;
}

export type MaskedSmtpSettings = SmtpSettings & { hasPassword: boolean };

const DEFAULT_SMTP: SmtpSettings = {
  enabled: false,
  host: '',
  port: 587,
  secure: false,
  user: '',
  password: '',
  fromEmail: '',
  notifyEmail: '',
};

// A snapshot of the code defaults, taken before any client/server code mutates
// BUSINESS_CONFIG via applySettings.
const DEFAULT_SITE: BusinessConfig = structuredClone(BUSINESS_CONFIG);

async function readJson(key: string, pool: Pool): Promise<Record<string, any> | undefined> {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT setting_value FROM site_settings WHERE setting_key = ?', [key]);
  if (!rows[0]) return undefined;
  try {
    return JSON.parse(rows[0].setting_value);
  } catch {
    return undefined;
  }
}

async function writeJson(key: string, value: unknown, pool: Pool): Promise<void> {
  await pool.execute(
    'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
    [key, JSON.stringify(value)]
  );
}

/** Keeps only keys that exist in the default shape, so the API can't be used to store arbitrary data. */
function pickKnownKeys(input: Record<string, any>, shape: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(input ?? {})) {
    if (!(key in shape)) continue;
    const template = shape[key];
    if (template && typeof template === 'object' && !Array.isArray(template) && value && typeof value === 'object' && !Array.isArray(value)) {
      out[key] = pickKnownKeys(value, template);
    } else {
      out[key] = value;
    }
  }
  return out;
}

export async function getSiteSettings(pool: Pool = getPool()!): Promise<BusinessConfig> {
  const stored = await readJson(SITE_KEY, pool);
  return deepMerge(structuredClone(DEFAULT_SITE), stored);
}

export async function saveSiteSettings(partial: BusinessSettings, pool: Pool = getPool()!): Promise<BusinessConfig> {
  const stored = (await readJson(SITE_KEY, pool)) ?? {};
  const merged = deepMerge(stored, pickKnownKeys(partial as Record<string, any>, DEFAULT_SITE));
  await writeJson(SITE_KEY, merged, pool);
  return getSiteSettings(pool);
}

export async function getSmtpSettings(pool?: Pool): Promise<MaskedSmtpSettings>;
export async function getSmtpSettings(pool: Pool | undefined, opts: { includePassword: true }): Promise<MaskedSmtpSettings>;
export async function getSmtpSettings(
  pool: Pool = getPool()!,
  opts: { includePassword?: boolean } = {}
): Promise<MaskedSmtpSettings> {
  const stored = await readJson(SMTP_KEY, pool);
  const smtp: SmtpSettings = { ...DEFAULT_SMTP, ...pickKnownKeys(stored ?? {}, DEFAULT_SMTP) };
  return {
    ...smtp,
    password: opts.includePassword ? smtp.password : '',
    hasPassword: smtp.password.length > 0,
  };
}

/** An empty or omitted password keeps the stored one, so the admin form never has to echo it back. */
export async function saveSmtpSettings(partial: Partial<SmtpSettings>, pool: Pool = getPool()!): Promise<MaskedSmtpSettings> {
  const current = await getSmtpSettings(pool, { includePassword: true });
  const incoming = pickKnownKeys(partial as Record<string, any>, DEFAULT_SMTP) as Partial<SmtpSettings>;
  if (!incoming.password) delete incoming.password;
  if (incoming.port !== undefined) incoming.port = Number(incoming.port) || DEFAULT_SMTP.port;
  const { hasPassword: _ignored, ...currentSmtp } = current;
  await writeJson(SMTP_KEY, { ...currentSmtp, ...incoming }, pool);
  return getSmtpSettings(pool);
}
