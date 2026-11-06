import { Request, Response } from 'express';
import { requireAuth } from './requireAuth';
import { signSession } from '../auth/session';

const SECRET = 'test-secret';

function fakeReqRes(cookieHeader?: string) {
  const req = { headers: cookieHeader ? { cookie: cookieHeader } : {} } as unknown as Request;
  const calls: { status?: number; body?: unknown } = {};
  const res = {
    status(code: number) {
      calls.status = code;
      return { json: (body: unknown) => { calls.body = body; } };
    },
  } as unknown as Response;
  return { req, res, calls };
}

describe('requireAuth', () => {
  it('calls next() and attaches req.user when the session cookie is valid', () => {
    const token = signSession({ id: 'ADM-1', username: 'owner', role: 'OWNER', fullName: 'Owner Name', phone: '9999999999' }, SECRET, 60_000);
    const { req, res, calls } = fakeReqRes(`session=${token}`);
    let nextCalled = false;
    requireAuth(SECRET)(req, res, () => { nextCalled = true; });
    expect(nextCalled).toBe(true);
    expect((req as any).user).toEqual(expect.objectContaining({ id: 'ADM-1', username: 'owner', role: 'OWNER', fullName: 'Owner Name', phone: '9999999999' }));
    expect(calls.status).toBeUndefined();
  });

  it('responds 401 with no next() call when there is no session cookie', () => {
    const { req, res, calls } = fakeReqRes();
    let nextCalled = false;
    requireAuth(SECRET)(req, res, () => { nextCalled = true; });
    expect(nextCalled).toBe(false);
    expect(calls.status).toBe(401);
    expect(calls.body).toEqual({ success: false, error: 'Not signed in.' });
  });

  it('responds 401 when the session cookie is invalid or expired', () => {
    const expired = signSession({ id: 'ADM-1', username: 'owner', role: 'OWNER', fullName: 'Owner Name', phone: '9999999999' }, SECRET, -1000);
    const { req, res, calls } = fakeReqRes(`session=${expired}`);
    let nextCalled = false;
    requireAuth(SECRET)(req, res, () => { nextCalled = true; });
    expect(nextCalled).toBe(false);
    expect(calls.status).toBe(401);
  });
});
