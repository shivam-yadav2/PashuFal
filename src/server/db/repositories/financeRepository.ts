import { Pool, RowDataPacket } from 'mysql2/promise';
import { getPool } from '../mysql';
import { recordAudit } from './auditRepository';
import { PaymentRecord } from '../../../types/domain';

interface PaymentRow extends RowDataPacket {
  id: string;
  direction: PaymentRecord['direction'];
  contact_id: string;
  amount: number;
  currency: PaymentRecord['currency'];
  payment_method: PaymentRecord['paymentMethod'];
  transaction_date: string;
  reference_number: string | null;
  notes: string | null;
  status: PaymentRecord['status'];
  recorded_by: string;
  created_at: string;
}

function mapRow(row: PaymentRow): PaymentRecord {
  return {
    id: row.id,
    direction: row.direction,
    contactId: row.contact_id,
    amount: row.amount,
    currency: row.currency,
    paymentMethod: row.payment_method,
    transactionDate: row.transaction_date,
    referenceNumber: row.reference_number ?? undefined,
    notes: row.notes ?? undefined,
    status: row.status,
    recordedBy: row.recorded_by,
    createdAt: row.created_at,
  };
}

export interface FinancialSummary {
  customerOutstanding: number;
  supplierPayable: number;
  livestockSalesRevenue: number;
  customerPaymentsReceived: number;
  supplierPayoutsMade: number;
}

export async function getFinancialSummary(pool: Pool = getPool()!): Promise<FinancialSummary> {
  const [[billedRow]] = await pool.query<RowDataPacket[]>(
    "SELECT COALESCE(SUM(total_billed_amount), 0) AS total FROM milk_deliveries WHERE status IN ('DELIVERED', 'PARTIALLY_DELIVERED')"
  );
  const [[receivedRow]] = await pool.query<RowDataPacket[]>(
    "SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE direction = 'CUSTOMER_RECEIPT' AND status = 'POSTED'"
  );
  const [[purchasedRow]] = await pool.query<RowDataPacket[]>(
    'SELECT COALESCE(SUM(total_cost), 0) AS total FROM milk_collection_entries'
  );
  const [[payoutRow]] = await pool.query<RowDataPacket[]>(
    "SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE direction = 'SUPPLIER_PAYMENT' AND status = 'POSTED'"
  );
  const [[revenueRow]] = await pool.query<RowDataPacket[]>(
    "SELECT COALESCE(SUM(agreed_price), 0) AS total FROM livestock_transactions WHERE status = 'COMPLETED'"
  );

  const totalDeliveriesBilled = (billedRow as any).total;
  const customerPaymentsReceived = (receivedRow as any).total;
  const totalPurchasedMilkCost = (purchasedRow as any).total;
  const supplierPayoutsMade = (payoutRow as any).total;
  const livestockSalesRevenue = (revenueRow as any).total;

  return {
    customerOutstanding: Math.max(0, totalDeliveriesBilled - customerPaymentsReceived),
    supplierPayable: Math.max(0, totalPurchasedMilkCost - supplierPayoutsMade),
    livestockSalesRevenue,
    customerPaymentsReceived,
    supplierPayoutsMade,
  };
}

export async function getPayments(pool: Pool = getPool()!): Promise<PaymentRecord[]> {
  const [rows] = await pool.query<PaymentRow[]>('SELECT * FROM payments ORDER BY created_at DESC');
  return rows.map(mapRow);
}

export async function addPayment(payment: PaymentRecord, pool: Pool = getPool()!): Promise<PaymentRecord> {
  await pool.execute(
    `INSERT INTO payments (
      id, direction, contact_id, amount, currency, payment_method, transaction_date,
      reference_number, notes, status, recorded_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payment.id, payment.direction, payment.contactId, payment.amount, payment.currency,
      payment.paymentMethod, payment.transactionDate, payment.referenceNumber ?? null,
      payment.notes ?? null, payment.status, payment.recordedBy,
    ]
  );

  await recordAudit(
    {
      actor: payment.recordedBy,
      action: 'POSTED_PAYMENT',
      entityType: 'PAYMENT',
      entityId: payment.id,
      details: `${payment.direction === 'CUSTOMER_RECEIPT' ? 'Received from' : 'Paid to'} contact ${payment.contactId}: ₹${payment.amount.toLocaleString('en-IN')}`,
    },
    pool
  );

  return payment;
}
