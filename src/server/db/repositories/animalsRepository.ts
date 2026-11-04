import { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise';
import { getPool, withTransaction } from '../mysql';
import { recordAudit } from './auditRepository';
import { BusinessError } from '../../errors';
import { nextId } from '../idGen';
import { Animal, AnimalMedia, LivestockTransaction } from '../../../types/domain';

export interface AnimalFilters {
  species?: string;
  breed?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  search?: string;
}

interface AnimalListingRow extends RowDataPacket {
  id: string;
  tag_number: string;
  species: Animal['species'];
  breed: string;
  gender: Animal['gender'];
  age_years: number;
  age_months: number;
  lactation_number: number | null;
  calving_details: string | null;
  pregnancy_status: string | null;
  reported_milk_yield_lpd: number | null;
  milk_yield_unit: Animal['milkYieldUnit'];
  yield_verification_date: string | null;
  yield_verification_status: Animal['yieldVerificationStatus'] | null;
  has_veterinary_check: number;
  veterinary_notes: string | null;
  ownership_type: Animal['ownershipType'];
  seller_contact_id: string | null;
  brokerage_commission: number | null;
  internal_notes: string | null;
  health_notes: string | null;
  a_created_at: string;
  a_updated_at: string;
  version: number;
  title: string;
  description: string;
  price_min: number;
  price_max: number;
  contact_for_price: number;
  currency: 'INR';
  status: Animal['listing']['status'];
  location: string;
  published_at: string | null;
  last_verified_at: string;
  reservation_deposit: number | null;
  reserved_for_contact_id: string | null;
  reserved_at: string | null;
  sold_price: number | null;
  sold_to_contact_id: string | null;
  sold_at: string | null;
}

interface AnimalMediaRow extends RowDataPacket {
  id: string;
  animal_id: string;
  url: string;
  video_url: string | null;
  display_order: number;
  alt_text: string;
  is_primary: number;
}

interface LivestockTransactionRow extends RowDataPacket {
  id: string;
  animal_id: string;
  listing_reference_title: string;
  buyer_contact_id: string;
  seller_contact_id: string | null;
  ownership_type: Animal['ownershipType'];
  agreed_price: number;
  commission_amount: number | null;
  commission_settled: number | null;
  sale_date: string;
  status: LivestockTransaction['status'];
  amount_paid: number;
  outstanding_balance: number;
  notes: string | null;
  recorded_by: string;
}

const JOIN_SELECT = `
  SELECT
    a.id, a.tag_number, a.species, a.breed, a.gender, a.age_years, a.age_months,
    a.lactation_number, a.calving_details, a.pregnancy_status, a.reported_milk_yield_lpd,
    a.milk_yield_unit, a.yield_verification_date, a.yield_verification_status,
    a.has_veterinary_check, a.veterinary_notes, a.ownership_type, a.seller_contact_id,
    a.brokerage_commission, a.internal_notes, a.health_notes, a.version,
    a.created_at AS a_created_at, a.updated_at AS a_updated_at,
    l.title, l.description, l.price_min, l.price_max, l.contact_for_price, l.currency,
    l.status, l.location, l.published_at, l.last_verified_at, l.reservation_deposit,
    l.reserved_for_contact_id, l.reserved_at, l.sold_price, l.sold_to_contact_id, l.sold_at
  FROM animals a JOIN animal_listings l ON l.animal_id = a.id
`;

async function attachMedia(rows: AnimalListingRow[], pool: Pool): Promise<Animal[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const [mediaRows] = await pool.query<AnimalMediaRow[]>(
    `SELECT * FROM animal_media WHERE animal_id IN (${ids.map(() => '?').join(',')}) ORDER BY display_order`,
    ids
  );
  const mediaByAnimal = new Map<string, AnimalMedia[]>();
  for (const m of mediaRows) {
    const list = mediaByAnimal.get(m.animal_id) || [];
    list.push({
      id: m.id,
      animalId: m.animal_id,
      url: m.url,
      displayOrder: m.display_order,
      altText: m.alt_text,
      isPrimary: Boolean(m.is_primary),
      videoUrl: m.video_url ?? undefined,
    });
    mediaByAnimal.set(m.animal_id, list);
  }
  return rows.map((row) => mapAnimalRow(row, mediaByAnimal.get(row.id) || []));
}

function mapAnimalRow(row: AnimalListingRow, images: AnimalMedia[]): Animal {
  return {
    id: row.id,
    tagNumber: row.tag_number,
    species: row.species,
    breed: row.breed,
    gender: row.gender,
    ageYears: row.age_years,
    ageMonths: row.age_months,
    lactationNumber: row.lactation_number ?? undefined,
    calvingDetails: row.calving_details ?? undefined,
    pregnancyStatus: row.pregnancy_status ?? undefined,
    reportedMilkYieldLpd: row.reported_milk_yield_lpd ?? undefined,
    milkYieldUnit: row.milk_yield_unit,
    yieldVerificationDate: row.yield_verification_date ?? undefined,
    yieldVerificationStatus: row.yield_verification_status ?? undefined,
    hasVeterinaryCheck: Boolean(row.has_veterinary_check),
    veterinaryNotes: row.veterinary_notes ?? undefined,
    ownershipType: row.ownership_type,
    sellerContactId: row.seller_contact_id ?? undefined,
    brokerageCommission: row.brokerage_commission ?? undefined,
    internalNotes: row.internal_notes ?? undefined,
    healthNotes: row.health_notes ?? undefined,
    createdAt: row.a_created_at,
    updatedAt: row.a_updated_at,
    version: row.version,
    listing: {
      title: row.title,
      description: row.description,
      priceMin: row.price_min,
      priceMax: row.price_max,
      contactForPrice: Boolean(row.contact_for_price),
      currency: row.currency,
      status: row.status,
      location: row.location,
      publishedAt: row.published_at ?? undefined,
      lastVerifiedAt: row.last_verified_at,
      reservationDeposit: row.reservation_deposit ?? undefined,
      reservedForContactId: row.reserved_for_contact_id ?? undefined,
      reservedAt: row.reserved_at ?? undefined,
      soldPrice: row.sold_price ?? undefined,
      soldToContactId: row.sold_to_contact_id ?? undefined,
      soldAt: row.sold_at ?? undefined,
    },
    images,
  };
}

export async function getAnimals(filters: AnimalFilters = {}, pool: Pool = getPool()!): Promise<Animal[]> {
  const clauses: string[] = [];
  const params: any[] = [];

  if (filters.species && filters.species !== 'ALL') {
    clauses.push('a.species = ?');
    params.push(filters.species);
  }
  if (filters.breed && filters.breed !== 'ALL') {
    clauses.push('LOWER(a.breed) LIKE ?');
    params.push(`%${filters.breed.toLowerCase()}%`);
  }
  if (filters.status && filters.status !== 'ALL') {
    clauses.push('l.status = ?');
    params.push(filters.status);
  }
  if (filters.minPrice !== undefined) {
    clauses.push('l.price_min >= ?');
    params.push(filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    clauses.push('l.price_max <= ?');
    params.push(filters.maxPrice);
  }
  if (filters.search) {
    const q = `%${filters.search.toLowerCase()}%`;
    clauses.push(
      '(LOWER(a.id) LIKE ? OR LOWER(a.breed) LIKE ? OR LOWER(a.tag_number) LIKE ? OR LOWER(l.title) LIKE ? OR LOWER(l.location) LIKE ?)'
    );
    params.push(q, q, q, q, q);
  }

  const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
  const [rows] = await pool.query<AnimalListingRow[]>(JOIN_SELECT + where, params);
  return attachMedia(rows, pool);
}

export async function getPublicAnimals(pool: Pool = getPool()!): Promise<Animal[]> {
  const [rows] = await pool.query<AnimalListingRow[]>(
    JOIN_SELECT + " WHERE l.status IN ('AVAILABLE', 'RESERVED')"
  );
  return attachMedia(rows, pool);
}

export async function getAnimalById(id: string, pool: Pool = getPool()!): Promise<Animal | undefined> {
  const [rows] = await pool.query<AnimalListingRow[]>(JOIN_SELECT + ' WHERE a.id = ?', [id]);
  const [animal] = await attachMedia(rows, pool);
  return animal;
}

export async function createAnimal(
  animal: Animal,
  actor = 'Parmeshwar Kushwaha (Owner)',
  pool: Pool = getPool()!
): Promise<Animal> {
  await withTransaction(async (conn) => {
    await conn.execute(
      `INSERT INTO animals (
        id, tag_number, species, breed, gender, age_years, age_months, lactation_number,
        calving_details, pregnancy_status, reported_milk_yield_lpd, milk_yield_unit,
        yield_verification_date, yield_verification_status, has_veterinary_check,
        veterinary_notes, ownership_type, seller_contact_id, brokerage_commission,
        internal_notes, health_notes, version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        animal.id, animal.tagNumber, animal.species, animal.breed, animal.gender,
        animal.ageYears, animal.ageMonths ?? 0, animal.lactationNumber ?? 1,
        animal.calvingDetails ?? null, animal.pregnancyStatus ?? null,
        animal.reportedMilkYieldLpd ?? null, animal.milkYieldUnit,
        animal.yieldVerificationDate ?? null, animal.yieldVerificationStatus ?? 'VERIFIED_ON_FARM',
        animal.hasVeterinaryCheck ?? false, animal.veterinaryNotes ?? null,
        animal.ownershipType, animal.sellerContactId ?? null,
        animal.brokerageCommission ?? null, animal.internalNotes ?? null,
        animal.healthNotes ?? null, animal.version,
      ]
    );

    await conn.execute(
      `INSERT INTO animal_listings (
        id, animal_id, title, description, price_min, price_max, contact_for_price,
        currency, status, location, published_at, last_verified_at, reservation_deposit,
        reserved_for_contact_id, reserved_at, sold_price, sold_to_contact_id, sold_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `LIST-${animal.id}`, animal.id, animal.listing.title, animal.listing.description,
        animal.listing.priceMin, animal.listing.priceMax, animal.listing.contactForPrice ?? false,
        animal.listing.currency, animal.listing.status, animal.listing.location,
        toDbValue('publishedAt', animal.listing.publishedAt), animal.listing.lastVerifiedAt,
        animal.listing.reservationDeposit ?? null, animal.listing.reservedForContactId ?? null,
        toDbValue('reservedAt', animal.listing.reservedAt), animal.listing.soldPrice ?? null,
        animal.listing.soldToContactId ?? null, toDbValue('soldAt', animal.listing.soldAt),
      ]
    );

    for (const image of animal.images) {
      await conn.execute(
        `INSERT INTO animal_media (id, animal_id, url, video_url, display_order, alt_text, is_primary)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [image.id, animal.id, image.url, image.videoUrl ?? null, image.displayOrder, image.altText, image.isPrimary ?? false]
      );
    }
  }, pool);

  await recordAudit(
    {
      actor,
      action: 'CREATED_ANIMAL',
      entityType: 'ANIMAL',
      entityId: animal.id,
      details: `Created new ${animal.species} (${animal.breed}) listing ${animal.id}`,
    },
    pool
  );

  return (await getAnimalById(animal.id, pool))!;
}

const ANIMAL_FIELD_TO_COLUMN: Record<string, string> = {
  tagNumber: 'tag_number', species: 'species', breed: 'breed', gender: 'gender',
  ageYears: 'age_years', ageMonths: 'age_months', lactationNumber: 'lactation_number',
  calvingDetails: 'calving_details', pregnancyStatus: 'pregnancy_status',
  reportedMilkYieldLpd: 'reported_milk_yield_lpd', milkYieldUnit: 'milk_yield_unit',
  yieldVerificationDate: 'yield_verification_date', yieldVerificationStatus: 'yield_verification_status',
  hasVeterinaryCheck: 'has_veterinary_check', veterinaryNotes: 'veterinary_notes',
  ownershipType: 'ownership_type', sellerContactId: 'seller_contact_id',
  brokerageCommission: 'brokerage_commission', internalNotes: 'internal_notes', healthNotes: 'health_notes',
};

const LISTING_FIELD_TO_COLUMN: Record<string, string> = {
  title: 'title', description: 'description', priceMin: 'price_min', priceMax: 'price_max',
  contactForPrice: 'contact_for_price', currency: 'currency', status: 'status', location: 'location',
  publishedAt: 'published_at', lastVerifiedAt: 'last_verified_at', reservationDeposit: 'reservation_deposit',
  reservedForContactId: 'reserved_for_contact_id', reservedAt: 'reserved_at', soldPrice: 'sold_price',
  soldToContactId: 'sold_to_contact_id', soldAt: 'sold_at',
};

// animal_listings.published_at/reserved_at/sold_at are TIMESTAMP columns. The
// frontend sends these as UTC ISO strings (`new Date().toISOString()`); a
// string bound directly stores its numeric digits verbatim, which this
// server's convention (NOW(), dateStrings:true reads, lib/dates.ts display)
// treats as local wall-clock, not UTC. Converting to a real Date object lets
// mysql2 serialize it in the connection's local time, matching everything else.
const TIMESTAMP_LISTING_FIELDS = new Set(['publishedAt', 'reservedAt', 'soldAt']);

function toDbValue(field: string, value: any): any {
  if (value == null) return null;
  if (TIMESTAMP_LISTING_FIELDS.has(field) && typeof value === 'string') {
    return new Date(value);
  }
  return value;
}

function buildSetClause(updates: Record<string, any>, fieldMap: Record<string, string>): { sql: string; params: any[] } {
  const columns: string[] = [];
  const params: any[] = [];
  for (const [field, value] of Object.entries(updates)) {
    const column = fieldMap[field];
    if (!column) continue;
    columns.push(`${column} = ?`);
    params.push(toDbValue(field, value));
  }
  return { sql: columns.join(', '), params };
}

export async function updateAnimal(
  id: string,
  updates: Partial<Animal>,
  actor = 'Parmeshwar Kushwaha (Owner)',
  pool: Pool = getPool()!
): Promise<Animal | undefined> {
  const { listing, images, ...animalFields } = updates;

  await withTransaction(async (conn) => {
    const animalSet = buildSetClause(animalFields, ANIMAL_FIELD_TO_COLUMN);
    if (animalSet.sql) {
      await conn.execute(
        `UPDATE animals SET ${animalSet.sql}, updated_at = NOW(), version = version + 1 WHERE id = ?`,
        [...animalSet.params, id]
      );
    } else {
      await conn.execute('UPDATE animals SET updated_at = NOW(), version = version + 1 WHERE id = ?', [id]);
    }

    if (listing) {
      const listingSet = buildSetClause(listing, LISTING_FIELD_TO_COLUMN);
      if (listingSet.sql) {
        await conn.execute(`UPDATE animal_listings SET ${listingSet.sql} WHERE animal_id = ?`, [
          ...listingSet.params,
          id,
        ]);
      }
    }
  }, pool);

  const updated = await getAnimalById(id, pool);
  if (!updated) return undefined;

  await recordAudit(
    {
      actor,
      action: 'UPDATED_ANIMAL',
      entityType: 'ANIMAL',
      entityId: id,
      details: `Updated details for ${id} (status: ${updated.listing.status})`,
    },
    pool
  );

  return updated;
}

async function lockAnimalStatus(conn: PoolConnection, id: string): Promise<{ status: string } | undefined> {
  const [rows] = await conn.query<RowDataPacket[]>(
    'SELECT l.status FROM animals a JOIN animal_listings l ON l.animal_id = a.id WHERE a.id = ? FOR UPDATE',
    [id]
  );
  return rows[0] as { status: string } | undefined;
}

async function assertContactExists(conn: PoolConnection, contactId: string, label: string): Promise<void> {
  const [rows] = await conn.query<RowDataPacket[]>('SELECT id FROM contacts WHERE id = ?', [contactId]);
  if (rows.length === 0) {
    throw new BusinessError(`${label} ${contactId} does not exist.`);
  }
}

export async function reserveAnimal(
  id: string,
  deposit: number,
  contactId: string,
  actor = 'Parmeshwar Kushwaha (Owner)',
  pool: Pool = getPool()!
): Promise<Animal | undefined> {
  await withTransaction(async (conn) => {
    const current = await lockAnimalStatus(conn, id);
    if (!current) return;

    await assertContactExists(conn, contactId, 'Contact');

    const [result] = await conn.execute(
      `UPDATE animal_listings SET status = 'RESERVED', reservation_deposit = ?, reserved_for_contact_id = ?, reserved_at = NOW()
       WHERE animal_id = ? AND status = 'AVAILABLE'`,
      [deposit, contactId, id]
    );
    if ((result as any).affectedRows === 0) {
      throw new BusinessError(`Cannot reserve animal in '${current.status}' status. Only AVAILABLE animals can be reserved.`);
    }
  }, pool);

  const updated = await getAnimalById(id, pool);
  if (!updated) return undefined;

  await recordAudit(
    { actor, action: 'UPDATED_ANIMAL', entityType: 'ANIMAL', entityId: id, details: `Updated details for ${id} (status: ${updated.listing.status})` },
    pool
  );
  return updated;
}

export async function releaseReservation(
  id: string,
  actor = 'Parmeshwar Kushwaha (Owner)',
  pool: Pool = getPool()!
): Promise<Animal | undefined> {
  await withTransaction(async (conn) => {
    const current = await lockAnimalStatus(conn, id);
    if (!current) return;

    const [result] = await conn.execute(
      `UPDATE animal_listings SET status = 'AVAILABLE', reservation_deposit = NULL, reserved_for_contact_id = NULL, reserved_at = NULL
       WHERE animal_id = ? AND status = 'RESERVED'`,
      [id]
    );
    if ((result as any).affectedRows === 0) {
      throw new BusinessError(`Cannot release animal in '${current.status}' status.`);
    }
  }, pool);

  const updated = await getAnimalById(id, pool);
  if (!updated) return undefined;

  await recordAudit(
    { actor, action: 'UPDATED_ANIMAL', entityType: 'ANIMAL', entityId: id, details: `Updated details for ${id} (status: ${updated.listing.status})` },
    pool
  );
  return updated;
}

export async function completeSale(
  id: string,
  buyerContactId: string,
  agreedPrice: number,
  notes?: string,
  actor = 'Parmeshwar Kushwaha (Owner)',
  pool: Pool = getPool()!
): Promise<LivestockTransaction | undefined> {
  const animal = await getAnimalById(id, pool);
  if (!animal) return undefined;

  const txn: LivestockTransaction = await withTransaction(async (conn) => {
    const current = await lockAnimalStatus(conn, id);
    if (current && current.status === 'SOLD') {
      throw new BusinessError(`Animal ${id} is already marked as SOLD.`);
    }

    await assertContactExists(conn, buyerContactId, 'Buyer contact');

    await conn.execute(
      `UPDATE animal_listings SET status = 'SOLD', sold_price = ?, sold_to_contact_id = ?, sold_at = NOW() WHERE animal_id = ?`,
      [agreedPrice, buyerContactId, id]
    );

    const txnId = nextId(`TXN-${new Date().getFullYear()}`);
    const commissionAmount = animal.ownershipType === 'BROKERAGE' ? (animal.brokerageCommission || 1500) : null;
    const commissionSettled = animal.ownershipType === 'BROKERAGE' ? false : null;
    const saleDate = new Date().toISOString().split('T')[0];

    await conn.execute(
      `INSERT INTO livestock_transactions (
        id, animal_id, listing_reference_title, buyer_contact_id, seller_contact_id,
        ownership_type, agreed_price, commission_amount, commission_settled, sale_date,
        status, amount_paid, outstanding_balance, notes, recorded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'COMPLETED', ?, 0, ?, ?)`,
      [
        txnId, id, animal.listing.title, buyerContactId, animal.sellerContactId ?? null,
        animal.ownershipType, agreedPrice, commissionAmount, commissionSettled ?? false, saleDate,
        agreedPrice, notes || `Direct completed sale recorded by ${actor}`, actor,
      ]
    );

    return {
      id: txnId,
      animalId: id,
      listingReferenceTitle: animal.listing.title,
      buyerContactId,
      sellerContactId: animal.sellerContactId,
      ownershipType: animal.ownershipType,
      agreedPrice,
      commissionAmount: commissionAmount ?? undefined,
      commissionSettled: commissionSettled ?? undefined,
      saleDate,
      status: 'COMPLETED',
      amountPaid: agreedPrice,
      outstandingBalance: 0,
      notes: notes || `Direct completed sale recorded by ${actor}`,
      recordedBy: actor,
    };
  }, pool);

  await recordAudit(
    {
      actor,
      action: 'COMPLETED_SALE',
      entityType: 'ANIMAL',
      entityId: id,
      details: `Sold ${id} for ₹${agreedPrice.toLocaleString('en-IN')} to buyer ${buyerContactId}`,
    },
    pool
  );

  return txn;
}

export async function getTransactions(pool: Pool = getPool()!): Promise<LivestockTransaction[]> {
  const [rows] = await pool.query<LivestockTransactionRow[]>(
    'SELECT * FROM livestock_transactions ORDER BY created_at DESC'
  );
  return rows.map((row) => ({
    id: row.id,
    animalId: row.animal_id,
    listingReferenceTitle: row.listing_reference_title,
    buyerContactId: row.buyer_contact_id,
    sellerContactId: row.seller_contact_id ?? undefined,
    ownershipType: row.ownership_type,
    agreedPrice: row.agreed_price,
    commissionAmount: row.commission_amount ?? undefined,
    commissionSettled: row.commission_settled === null ? undefined : Boolean(row.commission_settled),
    saleDate: row.sale_date,
    status: row.status,
    amountPaid: row.amount_paid,
    outstandingBalance: row.outstanding_balance,
    notes: row.notes ?? undefined,
    recordedBy: row.recorded_by,
  }));
}
