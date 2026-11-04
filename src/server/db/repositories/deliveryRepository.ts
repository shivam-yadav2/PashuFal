import { Pool, RowDataPacket } from 'mysql2/promise';
import { getPool, withTransaction } from '../mysql';
import { recordAudit } from './auditRepository';
import { getTodayBusinessDate } from '../../../lib/dates';
import { DeliverySubscription, MilkDelivery, DeliveryStatus } from '../../../types/domain';

interface SubscriptionRow extends RowDataPacket {
  id: string;
  customer_contact_id: string;
  product_type: DeliverySubscription['productType'];
  quantity_litres: number;
  shift: DeliverySubscription['shift'];
  rate_per_litre: number;
  billing_preference: DeliverySubscription['billingPreference'];
  delivery_instructions: string | null;
  status: DeliverySubscription['status'];
  start_date: string;
  pause_until_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

interface DeliveryRow extends RowDataPacket {
  id: string;
  business_date: string;
  subscription_id: string;
  customer_contact_id: string;
  product_type: MilkDelivery['productType'];
  shift: MilkDelivery['shift'];
  scheduled_quantity_litres: number;
  actual_delivered_litres: number;
  rate_per_litre: number;
  total_billed_amount: number;
  status: DeliveryStatus;
  skip_or_failure_reason: string | null;
  delivery_notes: string | null;
  delivered_at: string | null;
  recorded_by: string;
}

function mapSubscriptionRow(row: SubscriptionRow): DeliverySubscription {
  return {
    id: row.id,
    customerContactId: row.customer_contact_id,
    productType: row.product_type,
    quantityLitres: row.quantity_litres,
    shift: row.shift,
    ratePerLitre: row.rate_per_litre,
    billingPreference: row.billing_preference,
    deliveryInstructions: row.delivery_instructions ?? undefined,
    status: row.status,
    startDate: row.start_date,
    pauseUntilDate: row.pause_until_date ?? undefined,
    endDate: row.end_date ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDeliveryRow(row: DeliveryRow): MilkDelivery {
  return {
    id: row.id,
    businessDate: row.business_date,
    subscriptionId: row.subscription_id,
    customerContactId: row.customer_contact_id,
    productType: row.product_type,
    shift: row.shift,
    scheduledQuantityLitres: row.scheduled_quantity_litres,
    actualDeliveredLitres: row.actual_delivered_litres,
    ratePerLitre: row.rate_per_litre,
    totalBilledAmount: row.total_billed_amount,
    status: row.status,
    skipOrFailureReason: row.skip_or_failure_reason ?? undefined,
    deliveryNotes: row.delivery_notes ?? undefined,
    deliveredAt: row.delivered_at ?? undefined,
    recordedBy: row.recorded_by,
  };
}

export async function getSubscriptions(pool: Pool = getPool()!): Promise<DeliverySubscription[]> {
  const [rows] = await pool.query<SubscriptionRow[]>('SELECT * FROM delivery_subscriptions');
  return rows.map(mapSubscriptionRow);
}

export async function createSubscription(
  sub: DeliverySubscription,
  pool: Pool = getPool()!
): Promise<DeliverySubscription> {
  await pool.execute(
    `INSERT INTO delivery_subscriptions (
      id, customer_contact_id, product_type, quantity_litres, shift, rate_per_litre,
      billing_preference, delivery_instructions, status, start_date, pause_until_date, end_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sub.id, sub.customerContactId, sub.productType, sub.quantityLitres, sub.shift, sub.ratePerLitre,
      sub.billingPreference, sub.deliveryInstructions ?? null, sub.status, sub.startDate,
      sub.pauseUntilDate ?? null, sub.endDate ?? null,
    ]
  );

  await recordAudit(
    {
      actor: 'Staff',
      action: 'CREATED_SUBSCRIPTION',
      entityType: 'SUBSCRIPTION',
      entityId: sub.id,
      details: `New recurring subscription for customer ${sub.customerContactId} (${sub.quantityLitres}L ${sub.productType})`,
    },
    pool
  );

  return sub;
}

export async function getDeliveries(date: string = getTodayBusinessDate(), pool: Pool = getPool()!): Promise<MilkDelivery[]> {
  const [rows] = await pool.query<DeliveryRow[]>('SELECT * FROM milk_deliveries WHERE business_date = ?', [date]);
  return rows.map(mapDeliveryRow);
}

export async function generateDailyDeliveries(
  date: string = getTodayBusinessDate(),
  shift: 'MORNING' | 'EVENING' = 'MORNING',
  recordedBy = 'Manager',
  pool: Pool = getPool()!
): Promise<MilkDelivery[]> {
  const [existingRows] = await pool.query<RowDataPacket[]>(
    'SELECT subscription_id FROM milk_deliveries WHERE business_date = ? AND shift = ?',
    [date, shift]
  );
  const existingSubIds = new Set(existingRows.map((r: any) => r.subscription_id));

  const [subRows] = await pool.query<SubscriptionRow[]>(
    "SELECT * FROM delivery_subscriptions WHERE status = 'ACTIVE' AND shift = ?",
    [shift]
  );
  const activeSubs = subRows.map(mapSubscriptionRow).filter((s) => !existingSubIds.has(s.id));

  const generated: MilkDelivery[] = activeSubs.map((sub) => ({
    id: `DEL-${date}-${sub.id}-${shift.substring(0, 1)}`,
    businessDate: date,
    subscriptionId: sub.id,
    customerContactId: sub.customerContactId,
    productType: sub.productType,
    shift: sub.shift,
    scheduledQuantityLitres: sub.quantityLitres,
    actualDeliveredLitres: sub.quantityLitres,
    ratePerLitre: sub.ratePerLitre,
    totalBilledAmount: sub.quantityLitres * sub.ratePerLitre,
    status: 'PLANNED',
    recordedBy,
  }));

  if (generated.length > 0) {
    await withTransaction(async (conn) => {
      for (const d of generated) {
        await conn.execute(
          `INSERT INTO milk_deliveries (
            id, business_date, subscription_id, customer_contact_id, product_type, shift,
            scheduled_quantity_litres, actual_delivered_litres, rate_per_litre, total_billed_amount,
            status, recorded_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            d.id, d.businessDate, d.subscriptionId, d.customerContactId, d.productType, d.shift,
            d.scheduledQuantityLitres, d.actualDeliveredLitres, d.ratePerLitre, d.totalBilledAmount,
            d.status, d.recordedBy,
          ]
        );
      }
    }, pool);

    await recordAudit(
      {
        actor: recordedBy,
        action: 'GENERATED_DELIVERIES',
        entityType: 'DELIVERY',
        entityId: `BATCH-${date}-${shift}`,
        details: `Generated ${generated.length} planned deliveries for ${date} (${shift})`,
      },
      pool
    );
  }

  return generated;
}

export async function updateDeliveryStatus(
  id: string,
  status: DeliveryStatus,
  actualLitres?: number,
  skipReason?: string,
  recordedBy = 'Delivery Boy',
  pool: Pool = getPool()!
): Promise<MilkDelivery | undefined> {
  const [rows] = await pool.query<DeliveryRow[]>('SELECT * FROM milk_deliveries WHERE id = ?', [id]);
  const existing = rows[0] ? mapDeliveryRow(rows[0]) : undefined;
  if (!existing) return undefined;

  const actualDeliveredLitres = actualLitres !== undefined ? actualLitres : existing.actualDeliveredLitres;
  const totalBilledAmount = actualLitres !== undefined ? actualLitres * existing.ratePerLitre : existing.totalBilledAmount;
  const deliveredAt = status === 'DELIVERED' ? new Date() : existing.deliveredAt ?? null;

  await pool.execute(
    `UPDATE milk_deliveries SET
      status = ?, actual_delivered_litres = ?, total_billed_amount = ?,
      skip_or_failure_reason = COALESCE(?, skip_or_failure_reason),
      delivered_at = ?, recorded_by = ?
     WHERE id = ?`,
    [status, actualDeliveredLitres, totalBilledAmount, skipReason || null, deliveredAt, recordedBy, id]
  );

  const [updatedRows] = await pool.query<DeliveryRow[]>('SELECT * FROM milk_deliveries WHERE id = ?', [id]);
  return updatedRows[0] ? mapDeliveryRow(updatedRows[0]) : undefined;
}
