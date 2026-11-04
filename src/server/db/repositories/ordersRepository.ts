import { Pool, RowDataPacket } from 'mysql2/promise';
import { getPool, withTransaction } from '../mysql';
import { recordAudit } from './auditRepository';
import { nextId } from '../idGen';
import { LivestockOrder, EnquiryStatus } from '../../../types/domain';

interface OrderRow extends RowDataPacket {
  id: string;
  enquiry_id: string | null;
  customer_name: string;
  phone: string;
  delivery_address: string;
  agreed_price: number;
  transport_quote: number;
  total_amount: number;
  payment_status: LivestockOrder['paymentStatus'];
  advance_amount_paid: number;
  veterinary_check_passed: number;
  delivery_status: LivestockOrder['deliveryStatus'];
  order_status: EnquiryStatus;
  transporter_details: string | null;
  dispatch_date: string | null;
  delivery_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderAnimalRow extends RowDataPacket {
  order_id: string;
  animal_id: string;
}

async function attachAnimalIds(rows: OrderRow[], pool: Pool): Promise<LivestockOrder[]> {
  if (rows.length === 0) return [];
  const orderIds = rows.map((r) => r.id);
  const [junctionRows] = await pool.query<OrderAnimalRow[]>(
    `SELECT order_id, animal_id FROM order_animals WHERE order_id IN (${orderIds.map(() => '?').join(',')})`,
    orderIds
  );
  const idsByOrder = new Map<string, string[]>();
  for (const j of junctionRows) {
    const list = idsByOrder.get(j.order_id) || [];
    list.push(j.animal_id);
    idsByOrder.set(j.order_id, list);
  }
  return rows.map((row) => mapOrderRow(row, idsByOrder.get(row.id) || []));
}

function mapOrderRow(row: OrderRow, animalIds: string[]): LivestockOrder {
  return {
    id: row.id,
    enquiryId: row.enquiry_id ?? undefined,
    customerName: row.customer_name,
    phone: row.phone,
    deliveryAddress: row.delivery_address,
    animalIds,
    agreedPrice: row.agreed_price,
    transportQuote: row.transport_quote,
    totalAmount: row.total_amount,
    paymentStatus: row.payment_status,
    advanceAmountPaid: row.advance_amount_paid,
    veterinaryCheckPassed: Boolean(row.veterinary_check_passed),
    deliveryStatus: row.delivery_status,
    orderStatus: row.order_status,
    transporterDetails: row.transporter_details ?? undefined,
    dispatchDate: row.dispatch_date ?? undefined,
    deliveryDate: row.delivery_date ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getOrders(pool: Pool = getPool()!): Promise<LivestockOrder[]> {
  const [rows] = await pool.query<OrderRow[]>('SELECT * FROM livestock_orders ORDER BY created_at DESC');
  return attachAnimalIds(rows, pool);
}

export async function getOrderById(id: string, pool: Pool = getPool()!): Promise<LivestockOrder | undefined> {
  const [rows] = await pool.query<OrderRow[]>('SELECT * FROM livestock_orders WHERE id = ?', [id]);
  const [order] = await attachAnimalIds(rows, pool);
  return order;
}

export async function createOrder(data: Partial<LivestockOrder>, pool: Pool = getPool()!): Promise<LivestockOrder> {
  const id = nextId(`ORD-${new Date().getFullYear()}`);
  const now = new Date().toISOString();
  const agreedPrice = data.agreedPrice || 0;
  const transportQuote = data.transportQuote || 0;

  const order: LivestockOrder = {
    id,
    enquiryId: data.enquiryId,
    customerName: data.customerName || 'Farm Customer',
    phone: data.phone || '',
    deliveryAddress: data.deliveryAddress || 'Deoria District, UP',
    animalIds: data.animalIds || [],
    agreedPrice,
    transportQuote,
    totalAmount: agreedPrice + transportQuote,
    paymentStatus: data.paymentStatus || 'PENDING',
    advanceAmountPaid: data.advanceAmountPaid || 0,
    veterinaryCheckPassed: data.veterinaryCheckPassed || false,
    deliveryStatus: data.deliveryStatus || 'PENDING_VET',
    orderStatus: data.orderStatus || 'ORDER_CONFIRMED',
    transporterDetails: data.transporterDetails,
    dispatchDate: data.dispatchDate,
    deliveryDate: data.deliveryDate,
    notes: data.notes,
    createdAt: now,
    updatedAt: now,
  };

  await withTransaction(async (conn) => {
    await conn.execute(
      `INSERT INTO livestock_orders (
        id, enquiry_id, customer_name, phone, delivery_address, agreed_price, transport_quote,
        total_amount, payment_status, advance_amount_paid, veterinary_check_passed, delivery_status,
        order_status, transporter_details, dispatch_date, delivery_date, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order.id, order.enquiryId ?? null, order.customerName, order.phone, order.deliveryAddress,
        order.agreedPrice, order.transportQuote, order.totalAmount, order.paymentStatus,
        order.advanceAmountPaid, order.veterinaryCheckPassed, order.deliveryStatus, order.orderStatus,
        order.transporterDetails ?? null, order.dispatchDate ?? null, order.deliveryDate ?? null,
        order.notes ?? null,
      ]
    );

    for (const animalId of order.animalIds) {
      await conn.execute('INSERT INTO order_animals (order_id, animal_id) VALUES (?, ?)', [order.id, animalId]);
    }
  }, pool);

  await recordAudit(
    {
      actor: 'Owner',
      action: 'CREATED_ORDER',
      entityType: 'ORDER',
      entityId: order.id,
      details: `Livestock order #${order.id} confirmed for ${order.customerName}: ₹${order.totalAmount.toLocaleString('en-IN')}`,
    },
    pool
  );

  return order;
}

export async function updateOrderStatus(
  id: string,
  status: EnquiryStatus,
  deliveryStatus?: LivestockOrder['deliveryStatus'],
  transporterDetails?: string,
  pool: Pool = getPool()!
): Promise<LivestockOrder | undefined> {
  const existing = await getOrderById(id, pool);
  if (!existing) return undefined;

  await pool.execute(
    `UPDATE livestock_orders SET
      order_status = ?, updated_at = NOW(),
      delivery_status = COALESCE(?, delivery_status),
      transporter_details = COALESCE(?, transporter_details)
     WHERE id = ?`,
    [status, deliveryStatus ?? null, transporterDetails ?? null, id]
  );

  const updated = await getOrderById(id, pool);
  if (!updated) return undefined;

  await recordAudit(
    {
      actor: 'Owner',
      action: 'UPDATED_ORDER_STATUS',
      entityType: 'ORDER',
      entityId: id,
      details: `Order #${id} updated: status=${status}, delivery=${updated.deliveryStatus}`,
    },
    pool
  );

  return updated;
}
