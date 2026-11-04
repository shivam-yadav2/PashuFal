import { Pool, RowDataPacket } from 'mysql2/promise';
import { getPool } from '../mysql';
import { Contact, ContactRole } from '../../../types/domain';

interface ContactRow extends RowDataPacket {
  id: string;
  name: string;
  phone: string;
  whatsapp: string | null;
  location: string;
  roles: string | ContactRole[];
  active: number | boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: ContactRow): Contact {
  const roles = typeof row.roles === 'string' ? JSON.parse(row.roles) : row.roles;
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    whatsapp: row.whatsapp ?? undefined,
    location: row.location,
    roles,
    active: Boolean(row.active),
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getContacts(pool: Pool = getPool()!): Promise<Contact[]> {
  const [rows] = await pool.query<ContactRow[]>('SELECT * FROM contacts');
  return rows.map(mapRow);
}

export async function getContactById(id: string, pool: Pool = getPool()!): Promise<Contact | undefined> {
  const [rows] = await pool.query<ContactRow[]>('SELECT * FROM contacts WHERE id = ?', [id]);
  return rows[0] ? mapRow(rows[0]) : undefined;
}

export async function createContact(contact: Contact, pool: Pool = getPool()!): Promise<Contact> {
  // created_at/updated_at are DEFAULT CURRENT_TIMESTAMP / ON UPDATE CURRENT_TIMESTAMP
  // columns — left out here deliberately so the DB's own clock sets them,
  // rather than trusting a client-supplied ISO string (see animalsRepository's
  // toDbValue comment for why a raw ISO string in a TIMESTAMP column is wrong here).
  await pool.execute(
    'INSERT INTO contacts (id, name, phone, whatsapp, location, roles, active, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      contact.id,
      contact.name,
      contact.phone,
      contact.whatsapp ?? null,
      contact.location,
      JSON.stringify(contact.roles),
      contact.active,
      contact.notes ?? null,
    ]
  );
  return (await getContactById(contact.id, pool))!;
}
