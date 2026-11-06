import { Pool, RowDataPacket } from 'mysql2/promise';
import { getPool } from '../mysql';
import { verifyPassword } from '../../auth/password';
import { UserRole } from '../../../types/domain';

interface AdminUserRow extends RowDataPacket {
  id: string;
  username: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  phone: string;
  is_active: number;
}

export interface AuthenticatedAdmin {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  phone: string;
}

export async function verifyCredentials(
  usernameInput: string,
  password: string,
  pool: Pool = getPool()!
): Promise<AuthenticatedAdmin | null> {
  const username = usernameInput.trim().toLowerCase();
  const [rows] = await pool.query<AdminUserRow[]>(
    'SELECT * FROM admin_users WHERE username = ? AND is_active = TRUE',
    [username]
  );
  const row = rows[0];
  if (!row) return null;

  const valid = await verifyPassword(password, row.password_hash);
  if (!valid) return null;

  return { id: row.id, username: row.username, fullName: row.full_name, role: row.role, phone: row.phone };
}
