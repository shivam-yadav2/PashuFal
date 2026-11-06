import { verifyCredentials } from './authRepository';
import { hashPassword } from '../../auth/password';
import { getTestPool, resetDatabase, closeTestPool } from '../testHelpers';

const pool = getTestPool();

async function seedAdmin(overrides: Partial<{ id: string; username: string; password: string; role: string; isActive: boolean }> = {}) {
  const opts = { id: 'ADM-T1', username: 'testowner', password: 'correct-password', role: 'OWNER', isActive: true, ...overrides };
  const hash = await hashPassword(opts.password);
  await pool.execute(
    'INSERT INTO admin_users (id, username, password_hash, full_name, role, phone, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [opts.id, opts.username, hash, 'Test Owner', opts.role, '9999999999', opts.isActive]
  );
  return opts;
}

describe('authRepository.verifyCredentials', () => {
  beforeEach(() => resetDatabase());
  afterAll(() => closeTestPool());

  it('returns the admin user for correct username and password', async () => {
    await seedAdmin();
    const user = await verifyCredentials('testowner', 'correct-password', pool);
    expect(user).toEqual(expect.objectContaining({ id: 'ADM-T1', username: 'testowner', role: 'OWNER', fullName: 'Test Owner' }));
  });

  it('is case-insensitive on username, matching the old client-side behavior', async () => {
    await seedAdmin();
    const user = await verifyCredentials('TestOwner', 'correct-password', pool);
    expect(user?.username).toBe('testowner');
  });

  it('returns null for a wrong password', async () => {
    await seedAdmin();
    expect(await verifyCredentials('testowner', 'wrong-password', pool)).toBeNull();
  });

  it('returns null for a username that does not exist', async () => {
    expect(await verifyCredentials('nobody', 'whatever', pool)).toBeNull();
  });

  it('returns null for a deactivated account even with the correct password', async () => {
    await seedAdmin({ isActive: false });
    expect(await verifyCredentials('testowner', 'correct-password', pool)).toBeNull();
  });
});
