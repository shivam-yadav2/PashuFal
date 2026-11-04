import { Pool, RowDataPacket } from 'mysql2/promise';
import { getPool } from '../mysql';
import { recordAudit } from './auditRepository';
import { Enquiry, EnquiryStatus } from '../../../types/domain';

interface EnquiryRow extends RowDataPacket {
  id: string;
  customer_name: string;
  contact_person: string | null;
  phone: string;
  email: string | null;
  location: string;
  enquiry_type: Enquiry['enquiryType'];
  animal_id: string | null;
  animal_type: Enquiry['animalType'];
  preferred_breed: string | null;
  requested_quantity: number;
  preferred_milk_yield: string | null;
  budget_per_animal: number | null;
  total_budget: number | null;
  delivery_location: string;
  required_delivery_date: string | null;
  additional_instructions: string | null;
  status: EnquiryStatus;
  assigned_staff: string | null;
  quotation_amount: number | null;
  transport_quotation: number | null;
  quotation_notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: EnquiryRow): Enquiry {
  return {
    id: row.id,
    customerName: row.customer_name,
    contactPerson: row.contact_person ?? undefined,
    phone: row.phone,
    email: row.email ?? undefined,
    location: row.location,
    enquiryType: row.enquiry_type,
    animalId: row.animal_id ?? undefined,
    animalType: row.animal_type,
    preferredBreed: row.preferred_breed ?? undefined,
    requestedQuantity: row.requested_quantity,
    preferredMilkYield: row.preferred_milk_yield ?? undefined,
    budgetPerAnimal: row.budget_per_animal ?? undefined,
    totalBudget: row.total_budget ?? undefined,
    deliveryLocation: row.delivery_location,
    requiredDeliveryDate: row.required_delivery_date ?? undefined,
    additionalInstructions: row.additional_instructions ?? undefined,
    status: row.status,
    assignedStaff: row.assigned_staff ?? undefined,
    quotationAmount: row.quotation_amount ?? undefined,
    transportQuotation: row.transport_quotation ?? undefined,
    quotationNotes: row.quotation_notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getEnquiries(status?: string, pool: Pool = getPool()!): Promise<Enquiry[]> {
  if (!status || status === 'ALL') {
    const [rows] = await pool.query<EnquiryRow[]>('SELECT * FROM enquiries ORDER BY created_at DESC');
    return rows.map(mapRow);
  }
  const [rows] = await pool.query<EnquiryRow[]>(
    'SELECT * FROM enquiries WHERE status = ? ORDER BY created_at DESC',
    [status]
  );
  return rows.map(mapRow);
}

export async function getEnquiryById(id: string, pool: Pool = getPool()!): Promise<Enquiry | undefined> {
  const [rows] = await pool.query<EnquiryRow[]>('SELECT * FROM enquiries WHERE id = ?', [id]);
  return rows[0] ? mapRow(rows[0]) : undefined;
}

export async function createEnquiry(data: Partial<Enquiry>, pool: Pool = getPool()!): Promise<Enquiry> {
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const year = new Date().getFullYear();
  const id = `ENQ-${year}-${randomSuffix}`;
  const now = new Date().toISOString();

  const enquiry: Enquiry = {
    id,
    customerName: data.customerName || 'Anonymous Enquirer',
    contactPerson: data.contactPerson || data.customerName || '',
    phone: data.phone || '',
    email: data.email,
    location: data.location || 'Deoria / Gorakhpur Region',
    enquiryType: data.enquiryType || 'INDIVIDUAL',
    animalId: data.animalId,
    animalType: data.animalType || 'BUFFALO',
    preferredBreed: data.preferredBreed,
    requestedQuantity: data.requestedQuantity || 1,
    preferredMilkYield: data.preferredMilkYield,
    budgetPerAnimal: data.budgetPerAnimal,
    totalBudget: data.totalBudget,
    deliveryLocation: data.deliveryLocation || data.location || 'Khardaha Nilkanth, Lar, Deoria',
    requiredDeliveryDate: data.requiredDeliveryDate,
    additionalInstructions: data.additionalInstructions,
    status: 'NEW_ENQUIRY',
    createdAt: now,
    updatedAt: now,
  };

  await pool.execute(
    `INSERT INTO enquiries (
      id, customer_name, contact_person, phone, email, location, enquiry_type, animal_id,
      animal_type, preferred_breed, requested_quantity, preferred_milk_yield, budget_per_animal,
      total_budget, delivery_location, required_delivery_date, additional_instructions, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      enquiry.id, enquiry.customerName, enquiry.contactPerson || null, enquiry.phone,
      enquiry.email ?? null, enquiry.location, enquiry.enquiryType, enquiry.animalId ?? null,
      enquiry.animalType, enquiry.preferredBreed ?? null, enquiry.requestedQuantity,
      enquiry.preferredMilkYield ?? null, enquiry.budgetPerAnimal ?? null, enquiry.totalBudget ?? null,
      enquiry.deliveryLocation, enquiry.requiredDeliveryDate ?? null, enquiry.additionalInstructions ?? null,
      enquiry.status,
    ]
  );

  await recordAudit(
    {
      actor: enquiry.customerName,
      action: 'RECEIVED_ENQUIRY',
      entityType: 'ENQUIRY',
      entityId: enquiry.id,
      details: `New ${enquiry.enquiryType} enquiry from ${enquiry.customerName} (${enquiry.phone}) for ${enquiry.requestedQuantity}x ${enquiry.animalType}.`,
    },
    pool
  );

  return enquiry;
}

export async function updateEnquiryStatus(
  id: string,
  status: EnquiryStatus,
  notes?: string,
  quotationAmount?: number,
  transportQuotation?: number,
  assignedStaff?: string,
  pool: Pool = getPool()!
): Promise<Enquiry | undefined> {
  const existing = await getEnquiryById(id, pool);
  if (!existing) return undefined;

  await pool.execute(
    `UPDATE enquiries SET
      status = ?, updated_at = NOW(),
      quotation_notes = COALESCE(?, quotation_notes),
      quotation_amount = COALESCE(?, quotation_amount),
      transport_quotation = COALESCE(?, transport_quotation),
      assigned_staff = COALESCE(?, assigned_staff)
     WHERE id = ?`,
    [status, notes ?? null, quotationAmount ?? null, transportQuotation ?? null, assignedStaff ?? null, id]
  );

  await recordAudit(
    {
      actor: assignedStaff || 'Staff',
      action: 'UPDATED_ENQUIRY_STATUS',
      entityType: 'ENQUIRY',
      entityId: id,
      details: `Enquiry #${id} status changed to ${status}.`,
    },
    pool
  );

  return getEnquiryById(id, pool);
}
