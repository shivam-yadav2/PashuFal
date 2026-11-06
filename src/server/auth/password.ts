import bcrypt from 'bcryptjs';

// bcryptjs (pure JS, no native compile step) is used instead of bcrypt so
// this installs cleanly on restricted shared hosting environments that
// can't run node-gyp.
const SALT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
