import { Pool, RowDataPacket } from 'mysql2/promise';
import { getPool } from '../mysql';
import { AuditEvent } from '../../../types/domain';

interface AuditLogRow extends RowDataPacket {
  id: string;
  actor: string;
  action: string;
  entity_type: AuditEvent['entityType'];
  entity_id: string;
  timestamp: string;
  details: string;
}

function mapRow(row: AuditLogRow): AuditEvent {
  return {
    id: row.id,
    actor: row.actor,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    timestamp: row.timestamp,
    details: row.details,
  };
}

export async function recordAudit(
  entry: Omit<AuditEvent, 'id' | 'timestamp'>,
  pool: Pool = getPool()!
): Promise<void> {
  const id = `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  await pool.execute(
    'INSERT INTO audit_logs (id, actor, action, entity_type, entity_id, timestamp, details) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, entry.actor, entry.action, entry.entityType, entry.entityId, new Date(), entry.details]
  );
}

export async function getAuditLogs(pool: Pool = getPool()!): Promise<AuditEvent[]> {
  const [rows] = await pool.query<AuditLogRow[]>(
    'SELECT * FROM audit_logs ORDER BY timestamp DESC, id DESC'
  );
  return rows.map(mapRow);
}
