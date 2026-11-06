import { createHmac, timingSafeEqual } from 'crypto';
import { UserRole } from '../../types/domain';

export interface SessionPayload {
  id: string;
  username: string;
  role: UserRole;
  fullName: string;
  phone: string;
  exp: number;
}

function sign(body: string, secret: string): string {
  return createHmac('sha256', secret).update(body).digest('base64url');
}

/**
 * A minimal signed, stateless session token: base64url(JSON payload) + '.' +
 * HMAC-SHA256 signature. No external JWT library — this is the entire spec
 * we need (sign, verify, expiry), and it keeps the dependency list (and the
 * install on restricted shared hosting) smaller.
 */
export function signSession(
  payload: Omit<SessionPayload, 'exp'>,
  secret: string,
  expiresInMs: number
): string {
  const full: SessionPayload = { ...payload, exp: Date.now() + expiresInMs };
  const body = Buffer.from(JSON.stringify(full)).toString('base64url');
  return `${body}.${sign(body, secret)}`;
}

export function verifySession(token: string, secret: string): SessionPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, signature] = parts;

  const expected = sign(body, secret);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
    if (!payload.id || !payload.username || !payload.role) return null;
    return payload;
  } catch {
    return null;
  }
}
