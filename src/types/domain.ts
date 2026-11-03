/**
 * Core Domain Models for Purvanchal Dairy Pashu Kendra (Champa Dairy)
 * Aligned with PRD 1.0 (B2C & B2B Livestock Marketplace)
 */

export type Species = 'COW' | 'BUFFALO';
export type Gender = 'FEMALE' | 'MALE';
export type OwnershipType = 'OWNED' | 'BROKERAGE';
export type ListingStatus = 'DRAFT' | 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'ARCHIVED';

export interface AnimalMedia {
  id: string;
  animalId: string;
  url: string;
  displayOrder: number;
  altText: string;
  isPrimary?: boolean;
  videoUrl?: string;
}

export interface Animal {
  id: string; // e.g. "PDPK-BUF-01"
  tagNumber: string; // Ear tag or farm ID
  species: Species;
  breed: string; // "High Milking Buffalo", "Milch Cow", etc.
  gender: Gender;
  ageYears: number;
  ageMonths?: number;
  lactationNumber?: number; // 1st, 2nd, 3rd, 4th lactation
  calvingDetails?: string; // "Calved 22 days ago, female calf at foot"
  pregnancyStatus?: string; // "Open (Milking Peak)", "Pregnant 3 months"
  reportedMilkYieldLpd?: number; // Litres per day
  milkYieldUnit: 'LPD' | 'LITRES_PER_DAY';
  yieldVerificationDate?: string; // "2026-10-24"
  yieldVerificationStatus?: 'VERIFIED_ON_FARM' | 'SELLER_DECLARED';
  hasVeterinaryCheck?: boolean;
  veterinaryNotes?: string;
  ownershipType: OwnershipType;
  sellerContactId?: string;
  brokerageCommission?: number;
  internalNotes?: string;
  healthNotes?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  
  listing: {
    title: string;
    description: string;
    priceMin: number;
    priceMax: number;
    contactForPrice?: boolean;
    currency: 'INR';
    status: ListingStatus;
    location: string;
    publishedAt?: string;
    lastVerifiedAt: string;
    reservationDeposit?: number;
    reservedForContactId?: string;
    reservedAt?: string;
    soldPrice?: number;
    soldToContactId?: string;
    soldAt?: string;
  };
  
  images: AnimalMedia[];
}

export type ContactRole = 
  | 'LIVESTOCK_BUYER' 
  | 'LIVESTOCK_SELLER' 
  | 'DAIRY_CUSTOMER' 
  | 'MILK_SUPPLIER' 
  | 'BULK_BUYER';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  location: string;
  roles: ContactRole[];
  active: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------- PRD ENQUIRIES & BULK ORDERS -----------------

export type EnquiryStatus = 
  | 'NEW_ENQUIRY'
  | 'CONTACTED'
  | 'REQUIREMENT_CONFIRMED'
  | 'QUOTATION_SENT'
  | 'NEGOTIATION'
  | 'AWAITING_BUYER_CONFIRMATION'
  | 'ORDER_CONFIRMED'
  | 'VETERINARY_CHECK'
  | 'TRANSPORT_ARRANGED'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'CLOSED';

export interface Enquiry {
  id: string; // e.g. "ENQ-2026-101"
  customerName: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  location: string;
  enquiryType: 'INDIVIDUAL' | 'BULK_COMMERCIAL' | 'TRANSPORT_INQUIRY' | 'INSPECTION_REQUEST';
  animalId?: string; // Optional specific animal
  animalType: 'BUFFALO' | 'COW' | 'ANY';
  preferredBreed?: string;
  requestedQuantity: number;
  preferredMilkYield?: string;
  budgetPerAnimal?: number;
  totalBudget?: number;
  deliveryLocation: string;
  requiredDeliveryDate?: string;
  additionalInstructions?: string;
  status: EnquiryStatus;
  assignedStaff?: string;
  quotationAmount?: number;
  transportQuotation?: number;
  quotationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LivestockOrder {
  id: string; // e.g. "ORD-2026-088"
  enquiryId?: string;
  customerName: string;
  phone: string;
  deliveryAddress: string;
  animalIds: string[];
  agreedPrice: number;
  transportQuote: number;
  totalAmount: number;
  paymentStatus: 'PENDING' | 'PARTIAL_ADVANCE' | 'PAID_IN_FULL';
  advanceAmountPaid: number;
  veterinaryCheckPassed: boolean;
  deliveryStatus: 'PENDING_VET' | 'VET_PASSED' | 'TRANSPORT_ASSIGNED' | 'DISPATCHED' | 'DELIVERED';
  orderStatus: EnquiryStatus;
  transporterDetails?: string;
  dispatchDate?: string;
  deliveryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LivestockTransaction {
  id: string;
  animalId: string;
  listingReferenceTitle: string;
  buyerContactId: string;
  sellerContactId?: string;
  ownershipType: OwnershipType;
  agreedPrice: number;
  commissionAmount?: number;
  commissionSettled?: boolean;
  saleDate: string;
  status: 'PENDING_DELIVERY' | 'COMPLETED' | 'CANCELLED';
  amountPaid: number;
  outstandingBalance: number;
  notes?: string;
  recordedBy: string;
}

// ----------------- DAIRY DOMAIN -----------------

export type MilkShift = 'MORNING' | 'EVENING';
export type MilkProductType = 'BUFFALO_MILK' | 'COW_MILK' | 'MIXED_MILK';

export interface MilkProductionEntry {
  id: string;
  businessDate: string;
  shift: MilkShift;
  herdSource: string;
  quantityLitres: number;
  recordedBy: string;
  notes?: string;
  createdAt: string;
}

export interface MilkCollectionEntry {
  id: string;
  supplierContactId: string;
  businessDate: string;
  shift: MilkShift;
  productType: MilkProductType;
  grossLitresReceived: number;
  acceptedLitres: number;
  rejectedLitres: number;
  rejectionReason?: string;
  fatPercentage?: number;
  snfPercentage?: number;
  purchaseRatePerLitre: number;
  totalCost: number;
  paymentStatus: 'PENDING' | 'PAID' | 'PARTIALLY_PAID';
  recordedBy: string;
  notes?: string;
  createdAt: string;
}

export type MovementType = 
  | 'OPENING_STOCK'
  | 'OWN_PRODUCTION'
  | 'PURCHASED_ACCEPTED'
  | 'RETAIL_DELIVERY'
  | 'BULK_SALE'
  | 'WASTE_SPOILAGE'
  | 'AUTHORIZED_ADJUSTMENT';

export interface MilkInventoryMovement {
  id: string;
  businessDate: string;
  productType: MilkProductType;
  movementType: MovementType;
  direction: 'INFLOW' | 'OUTFLOW';
  quantityLitres: number;
  sourceRecordId?: string;
  notes?: string;
  recordedBy: string;
  timestamp: string;
}

export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'ENDED';

export interface DeliverySubscription {
  id: string;
  customerContactId: string;
  productType: MilkProductType;
  quantityLitres: number;
  shift: MilkShift;
  ratePerLitre: number;
  billingPreference: 'MONTHLY' | 'WEEKLY' | 'PREPAID';
  deliveryInstructions?: string;
  status: SubscriptionStatus;
  startDate: string;
  pauseUntilDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type DeliveryStatus = 
  | 'PLANNED' 
  | 'PREPARED' 
  | 'DISPATCHED' 
  | 'DELIVERED' 
  | 'PARTIALLY_DELIVERED' 
  | 'SKIPPED' 
  | 'FAILED';

export interface MilkDelivery {
  id: string;
  businessDate: string;
  subscriptionId: string;
  customerContactId: string;
  productType: MilkProductType;
  shift: MilkShift;
  scheduledQuantityLitres: number;
  actualDeliveredLitres: number;
  ratePerLitre: number;
  totalBilledAmount: number;
  status: DeliveryStatus;
  skipOrFailureReason?: string;
  deliveryNotes?: string;
  deliveredAt?: string;
  recordedBy: string;
}

export interface PaymentRecord {
  id: string;
  direction: 'CUSTOMER_RECEIPT' | 'SUPPLIER_PAYMENT';
  contactId: string;
  amount: number;
  currency: 'INR';
  paymentMethod: 'CASH' | 'UPI' | 'BANK_TRANSFER';
  transactionDate: string;
  referenceNumber?: string;
  notes?: string;
  status: 'POSTED' | 'REVERSED';
  recordedBy: string;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  entityType: 'ANIMAL' | 'LISTING' | 'COLLECTION' | 'PRODUCTION' | 'DELIVERY' | 'PAYMENT' | 'SUBSCRIPTION' | 'ENQUIRY' | 'ORDER';
  entityId: string;
  timestamp: string;
  details: string;
}

export type UserRole = 'OWNER' | 'MANAGER' | 'PUBLIC';
export type Language = 'HI' | 'EN';
