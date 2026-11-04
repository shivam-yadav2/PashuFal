import { Pool, RowDataPacket } from 'mysql2/promise';
import { getPool, withTransaction } from '../mysql';
import { recordAudit } from './auditRepository';
import { nextId } from '../idGen';
import { getTodayBusinessDate } from '../../../lib/dates';
import { MilkProductionEntry, MilkCollectionEntry, MilkInventoryMovement } from '../../../types/domain';

interface ProductionRow extends RowDataPacket {
  id: string;
  business_date: string;
  shift: MilkProductionEntry['shift'];
  herd_source: string;
  quantity_litres: number;
  recorded_by: string;
  notes: string | null;
  created_at: string;
}

interface CollectionRow extends RowDataPacket {
  id: string;
  supplier_contact_id: string;
  business_date: string;
  shift: MilkCollectionEntry['shift'];
  product_type: MilkCollectionEntry['productType'];
  gross_litres_received: number;
  accepted_litres: number;
  rejected_litres: number;
  rejection_reason: string | null;
  fat_percentage: number | null;
  snf_percentage: number | null;
  purchase_rate_per_litre: number;
  total_cost: number;
  payment_status: MilkCollectionEntry['paymentStatus'];
  recorded_by: string;
  notes: string | null;
  created_at: string;
}

interface MovementRow extends RowDataPacket {
  id: string;
  business_date: string;
  product_type: MilkInventoryMovement['productType'];
  movement_type: MilkInventoryMovement['movementType'];
  direction: MilkInventoryMovement['direction'];
  quantity_litres: number;
  source_record_id: string | null;
  notes: string | null;
  recorded_by: string;
  timestamp: string;
}

function mapProductionRow(row: ProductionRow): MilkProductionEntry {
  return {
    id: row.id,
    businessDate: row.business_date,
    shift: row.shift,
    herdSource: row.herd_source,
    quantityLitres: row.quantity_litres,
    recordedBy: row.recorded_by,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

function mapCollectionRow(row: CollectionRow): MilkCollectionEntry {
  return {
    id: row.id,
    supplierContactId: row.supplier_contact_id,
    businessDate: row.business_date,
    shift: row.shift,
    productType: row.product_type,
    grossLitresReceived: row.gross_litres_received,
    acceptedLitres: row.accepted_litres,
    rejectedLitres: row.rejected_litres,
    rejectionReason: row.rejection_reason ?? undefined,
    fatPercentage: row.fat_percentage ?? undefined,
    snfPercentage: row.snf_percentage ?? undefined,
    purchaseRatePerLitre: row.purchase_rate_per_litre,
    totalCost: row.total_cost,
    paymentStatus: row.payment_status,
    recordedBy: row.recorded_by,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

function mapMovementRow(row: MovementRow): MilkInventoryMovement {
  return {
    id: row.id,
    businessDate: row.business_date,
    productType: row.product_type,
    movementType: row.movement_type,
    direction: row.direction,
    quantityLitres: row.quantity_litres,
    sourceRecordId: row.source_record_id ?? undefined,
    notes: row.notes ?? undefined,
    recordedBy: row.recorded_by,
    timestamp: row.timestamp,
  };
}

export async function getProductionEntries(date?: string, pool: Pool = getPool()!): Promise<MilkProductionEntry[]> {
  if (date) {
    const [rows] = await pool.query<ProductionRow[]>('SELECT * FROM milk_production_entries WHERE business_date = ?', [date]);
    return rows.map(mapProductionRow);
  }
  const [rows] = await pool.query<ProductionRow[]>('SELECT * FROM milk_production_entries');
  return rows.map(mapProductionRow);
}

export async function addProductionEntry(entry: MilkProductionEntry, pool: Pool = getPool()!): Promise<MilkProductionEntry> {
  const herdLower = entry.herdSource.toLowerCase();
  const productType = herdLower.includes('cow') || herdLower.includes('sahiwal') || herdLower.includes('gir')
    ? 'COW_MILK'
    : 'BUFFALO_MILK';

  await withTransaction(async (conn) => {
    await conn.execute(
      'INSERT INTO milk_production_entries (id, business_date, shift, herd_source, quantity_litres, recorded_by, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [entry.id, entry.businessDate, entry.shift, entry.herdSource, entry.quantityLitres, entry.recordedBy, entry.notes ?? null]
    );

    await conn.execute(
      `INSERT INTO milk_inventory_movements (id, business_date, product_type, movement_type, direction, quantity_litres, source_record_id, notes, recorded_by)
       VALUES (?, ?, ?, 'OWN_PRODUCTION', 'INFLOW', ?, ?, ?, ?)`,
      [
        nextId('MOV'), entry.businessDate, productType, entry.quantityLitres, entry.id,
        entry.notes || `Own production from ${entry.herdSource}`, entry.recordedBy,
      ]
    );
  }, pool);

  await recordAudit(
    {
      actor: entry.recordedBy,
      action: 'POSTED_PRODUCTION',
      entityType: 'PRODUCTION',
      entityId: entry.id,
      details: `Added ${entry.quantityLitres}L own milk production (${entry.shift})`,
    },
    pool
  );

  return entry;
}

export async function getCollectionEntries(date?: string, pool: Pool = getPool()!): Promise<MilkCollectionEntry[]> {
  if (date) {
    const [rows] = await pool.query<CollectionRow[]>('SELECT * FROM milk_collection_entries WHERE business_date = ?', [date]);
    return rows.map(mapCollectionRow);
  }
  const [rows] = await pool.query<CollectionRow[]>('SELECT * FROM milk_collection_entries');
  return rows.map(mapCollectionRow);
}

export async function addCollectionEntry(entry: MilkCollectionEntry, pool: Pool = getPool()!): Promise<MilkCollectionEntry> {
  await withTransaction(async (conn) => {
    await conn.execute(
      `INSERT INTO milk_collection_entries (
        id, supplier_contact_id, business_date, shift, product_type, gross_litres_received,
        accepted_litres, rejected_litres, rejection_reason, fat_percentage, snf_percentage,
        purchase_rate_per_litre, total_cost, payment_status, recorded_by, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.id, entry.supplierContactId, entry.businessDate, entry.shift, entry.productType,
        entry.grossLitresReceived, entry.acceptedLitres, entry.rejectedLitres,
        entry.rejectionReason ?? null, entry.fatPercentage ?? null, entry.snfPercentage ?? null,
        entry.purchaseRatePerLitre, entry.totalCost, entry.paymentStatus, entry.recordedBy,
        entry.notes ?? null,
      ]
    );

    if (entry.acceptedLitres > 0) {
      await conn.execute(
        `INSERT INTO milk_inventory_movements (id, business_date, product_type, movement_type, direction, quantity_litres, source_record_id, notes, recorded_by)
         VALUES (?, ?, ?, 'PURCHASED_ACCEPTED', 'INFLOW', ?, ?, ?, ?)`,
        [
          nextId('MOV'), entry.businessDate, entry.productType, entry.acceptedLitres, entry.id,
          `Intake from supplier ${entry.supplierContactId} (${entry.fatPercentage || 0}% Fat)`, entry.recordedBy,
        ]
      );
    }
  }, pool);

  await recordAudit(
    {
      actor: entry.recordedBy,
      action: 'RECORDED_COLLECTION',
      entityType: 'COLLECTION',
      entityId: entry.id,
      details: `Intake: ${entry.grossLitresReceived}L received, ${entry.acceptedLitres}L accepted @ ₹${entry.purchaseRatePerLitre}/L`,
    },
    pool
  );

  return entry;
}

export async function getInventoryMovements(date?: string, pool: Pool = getPool()!): Promise<MilkInventoryMovement[]> {
  if (date) {
    const [rows] = await pool.query<MovementRow[]>('SELECT * FROM milk_inventory_movements WHERE business_date = ?', [date]);
    return rows.map(mapMovementRow);
  }
  const [rows] = await pool.query<MovementRow[]>('SELECT * FROM milk_inventory_movements');
  return rows.map(mapMovementRow);
}

export async function getStockReconciliation(date: string = getTodayBusinessDate(), pool: Pool = getPool()!) {
  const movements = await getInventoryMovements(date, pool);

  let openingBuffalo = 0;
  let openingCow = 0;
  let productionBuffalo = 0;
  let productionCow = 0;
  let purchasedBuffalo = 0;
  let purchasedCow = 0;
  let deliveredBuffalo = 0;
  let deliveredCow = 0;
  let wasteBuffalo = 0;
  let wasteCow = 0;

  for (const m of movements) {
    if (m.productType === 'BUFFALO_MILK') {
      if (m.movementType === 'OPENING_STOCK') openingBuffalo += m.quantityLitres;
      else if (m.movementType === 'OWN_PRODUCTION') productionBuffalo += m.quantityLitres;
      else if (m.movementType === 'PURCHASED_ACCEPTED') purchasedBuffalo += m.quantityLitres;
      else if (m.movementType === 'RETAIL_DELIVERY' || m.movementType === 'BULK_SALE') deliveredBuffalo += m.quantityLitres;
      else if (m.movementType === 'WASTE_SPOILAGE') wasteBuffalo += m.quantityLitres;
    } else {
      if (m.movementType === 'OPENING_STOCK') openingCow += m.quantityLitres;
      else if (m.movementType === 'OWN_PRODUCTION') productionCow += m.quantityLitres;
      else if (m.movementType === 'PURCHASED_ACCEPTED') purchasedCow += m.quantityLitres;
      else if (m.movementType === 'RETAIL_DELIVERY' || m.movementType === 'BULK_SALE') deliveredCow += m.quantityLitres;
      else if (m.movementType === 'WASTE_SPOILAGE') wasteCow += m.quantityLitres;
    }
  }

  const availableBuffalo = openingBuffalo + productionBuffalo + purchasedBuffalo;
  const closingBuffalo = availableBuffalo - deliveredBuffalo - wasteBuffalo;

  const availableCow = openingCow + productionCow + purchasedCow;
  const closingCow = availableCow - deliveredCow - wasteCow;

  return {
    date,
    buffalo: {
      opening: openingBuffalo,
      production: productionBuffalo,
      purchased: purchasedBuffalo,
      available: availableBuffalo,
      soldOrDelivered: deliveredBuffalo,
      waste: wasteBuffalo,
      calculatedClosing: closingBuffalo,
    },
    cow: {
      opening: openingCow,
      production: productionCow,
      purchased: purchasedCow,
      available: availableCow,
      soldOrDelivered: deliveredCow,
      waste: wasteCow,
      calculatedClosing: closingCow,
    },
    totalAvailableLitres: availableBuffalo + availableCow,
    totalDispatchedLitres: deliveredBuffalo + deliveredCow,
    totalClosingLitres: closingBuffalo + closingCow,
  };
}
