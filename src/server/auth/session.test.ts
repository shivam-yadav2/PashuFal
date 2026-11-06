import { signSession, verifySession } from './session';

const SECRET = 'test-secret-key-for-session-signing';

describe('session', () => {
  it('round-trips a payload through sign and verify', () => {
    const token = signSession({ id: 'ADM-001', username: 'owner', role: 'OWNER', fullName: 'Owner Name', phone: '9999999999' }, SECRET, 60_000);
    const payload = verifySession(token, SECRET);
    expect(payload).toEqual(expect.objectContaining({ id: 'ADM-001', username: 'owner', role: 'OWNER', fullName: 'Owner Name', phone: '9999999999' }));
  });

  it('rejects a token signed with a different secret', () => {
    const token = signSession({ id: 'ADM-001', username: 'owner', role: 'OWNER', fullName: 'Owner Name', phone: '9999999999' }, SECRET, 60_000);
    expect(verifySession(token, 'a-completely-different-secret')).toBeNull();
  });

  it('rejects a tampered payload even with the right signature format', () => {
    const token = signSession({ id: 'ADM-001', username: 'owner', role: 'OWNER', fullName: 'Owner Name', phone: '9999999999' }, SECRET, 60_000);
    const [body, sig] = token.split('.');
    const tamperedBody = Buffer.from(JSON.stringify({ id: 'ADM-001', username: 'owner', role: 'OWNER', exp: Date.now() + 999_999_999 })).toString('base64url');
    expect(verifySession(`${tamperedBody}.${sig}`, SECRET)).toBeNull();
  });

  it('rejects an expired token', () => {
    const token = signSession({ id: 'ADM-001', username: 'owner', role: 'OWNER', fullName: 'Owner Name', phone: '9999999999' }, SECRET, -1000);
    expect(verifySession(token, SECRET)).toBeNull();
  });

  it('rejects garbage input without throwing', () => {
    expect(verifySession('not-a-real-token', SECRET)).toBeNull();
    expect(verifySession('', SECRET)).toBeNull();
  });
});
