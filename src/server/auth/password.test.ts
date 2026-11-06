import { hashPassword, verifyPassword } from './password';

describe('password', () => {
  it('hashes a password and verifies the correct plaintext against it', async () => {
    const hash = await hashPassword('correct horse battery staple');
    expect(hash).not.toBe('correct horse battery staple');
    expect(await verifyPassword('correct horse battery staple', hash)).toBe(true);
  });

  it('rejects an incorrect password against a real hash', async () => {
    const hash = await hashPassword('correct horse battery staple');
    expect(await verifyPassword('wrong guess', hash)).toBe(false);
  });

  it('produces a different hash each time (salted)', async () => {
    const a = await hashPassword('same input');
    const b = await hashPassword('same input');
    expect(a).not.toBe(b);
  });
});
