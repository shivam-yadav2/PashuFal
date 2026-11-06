import { Request, Response, NextFunction } from 'express';
import { verifySession, SessionPayload } from '../auth/session';

export const SESSION_COOKIE_NAME = 'session';

export type AuthenticatedRequest = Request & { user: SessionPayload };

function readCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) {
      try {
        return decodeURIComponent(part.slice(eq + 1).trim());
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

/** Protects a route: requires a valid, unexpired session cookie, signed with `secret`. */
export function requireAuth(secret: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const token = readCookie(req.headers.cookie, SESSION_COOKIE_NAME);
    if (!token) {
      res.status(401).json({ success: false, error: 'Not signed in.' });
      return;
    }

    const payload = verifySession(token, secret);
    if (!payload) {
      res.status(401).json({ success: false, error: 'Session expired. Please sign in again.' });
      return;
    }

    (req as AuthenticatedRequest).user = payload;
    next();
  };
}
