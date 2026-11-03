import { 
  Animal, 
  Contact, 
  MilkCollectionEntry, 
  MilkProductionEntry, 
  MilkInventoryMovement, 
  DeliverySubscription, 
  MilkDelivery, 
  DeliveryStatus,
  LivestockTransaction,
  PaymentRecord,
  AuditEvent,
  Enquiry,
  EnquiryStatus,
  LivestockOrder
} from '../types/domain';
import { getTodayBusinessDate } from '../lib/dates';

const today = getTodayBusinessDate();

export interface DatabaseState {
  contacts: Contact[];
  animals: Animal[];
  transactions: LivestockTransaction[];
  productionEntries: MilkProductionEntry[];
  collectionEntries: MilkCollectionEntry[];
  inventoryMovements: MilkInventoryMovement[];
  subscriptions: DeliverySubscription[];
  deliveries: MilkDelivery[];
  payments: PaymentRecord[];
  auditLogs: AuditEvent[];
  enquiries: Enquiry[];
  orders: LivestockOrder[];
}

export const initialContacts: Contact[] = [
  {
    id: "CONT-001",
    name: "Dinesh Chaudhary",
    phone: "+91 94152 34011",
    whatsapp: "919415234011",
    location: "Khorabar, Deoria Road, Gorakhpur",
    roles: ["MILK_SUPPLIER"],
    active: true,
    notes: "Regular supplier of high fat Murrah buffalo milk (40-50 LPD daily).",
    createdAt: "2024-03-10",
    updatedAt: "2026-09-01",
  },
  {
    id: "CONT-002",
    name: "Rameshwar Prasad Pandey",
    phone: "+91 98380 77123",
    whatsapp: "919838077123",
    location: "Khalilabad, Sant Kabir Nagar (Near Basti)",
    roles: ["LIVESTOCK_SELLER"],
    active: true,
    notes: "Progressive livestock breeder; sends top pedigree Murrah and Sahiwal for brokerage.",
    createdAt: "2023-11-15",
    updatedAt: "2026-10-12",
  },
  {
    id: "CONT-003",
    name: "Dr. Arvind Tiwari",
    phone: "+91 94500 88231",
    whatsapp: "919450088231",
    location: "Betiahata, Near Civil Court, Gorakhpur",
    roles: ["DAIRY_CUSTOMER"],
    active: true,
    notes: "Requires 2 litres pure buffalo milk daily at 6:30 AM without fail.",
    createdAt: "2025-01-05",
    updatedAt: "2026-10-01",
  },
  {
    id: "CONT-004",
    name: "Manoj Kumar Verma",
    phone: "+91 97920 44109",
    whatsapp: "919792044109",
    location: "Hata, Kushinagar",
    roles: ["LIVESTOCK_BUYER"],
    active: true,
    notes: "Dairy farm owner expanding herd; interested in Gir and Sahiwal cows with verified milk pail tests.",
    createdAt: "2026-02-18",
    updatedAt: "2026-10-24",
  },
  {
    id: "CONT-005",
    name: "Shashi Kant Jaiswal (Hotel Vrindavan Sweets)",
    phone: "+91 94158 99042",
    whatsapp: "919415899042",
    location: "Golghar Commercial Center, Gorakhpur",
    roles: ["BULK_BUYER", "DAIRY_CUSTOMER"],
    active: true,
    notes: "Purchases 25-30 litres buffalo milk every morning for paneer and mawa production.",
    createdAt: "2024-06-20",
    updatedAt: "2026-10-25",
  },
  {
    id: "CONT-006",
    name: "Sunita Devi",
    phone: "+91 91400 55821",
    whatsapp: "919140055821",
    location: "Taramandal Colony, Gorakhpur",
    roles: ["DAIRY_CUSTOMER"],
    active: true,
    notes: "Monthly milk subscription: 1.5 litres Sahiwal Desi cow milk for children.",
    createdAt: "2025-08-14",
    updatedAt: "2026-10-15",
  }
];

export const initialAnimals: Animal[] = [
  {
    id: "PDPK-BUF-01",
    tagNumber: "UP-DEO-8812",
    species: "BUFFALO",
    breed: "High Milking Buffalo",
    gender: "FEMALE",
    ageYears: 5,
    ageMonths: 2,
    lactationNumber: 2,
    calvingDetails: "Calved 22 days ago, robust female calf at foot",
    pregnancyStatus: "Open (Milking Peak)",
    reportedMilkYieldLpd: 17.5,
    milkYieldUnit: "LPD",
    ownershipType: "OWNED",
    internalNotes: "High milk yielder, tested 17.5 L/day. Pail test verified.",
    healthNotes: "Vaccinated (FMD + HS), dewormed. Udder soft and pliable.",
    createdAt: "2026-10-05T08:00:00Z",
    updatedAt: "2026-10-24T10:00:00Z",
    version: 1,
    listing: {
      title: "High Milking Buffalo with Female Calf (17.5 L/Day)",
      description: "Exceptional quality milch buffalo in peak lactation. Calm temperament, easy hand or machine milking. Two-time Dohai milking verification welcome at farm.",
      priceMin: 135000,
      priceMax: 148000,
      currency: "INR",
      status: "AVAILABLE",
      location: "Khardaha Nilkanth, Lar, Deoria",
      publishedAt: "2026-10-06T09:00:00Z",
      lastVerifiedAt: "2026-10-25",
    },
    images: [
      {
        id: "img-01",
        animalId: "PDPK-BUF-01",
        url: "/assets/buffalo_1.jpg",
        displayOrder: 1,
        altText: "High Milking Buffalo Side View",
        isPrimary: true
      }
    ]
  },
  {
    id: "PDPK-COW-02",
    tagNumber: "UP-DEO-7104",
    species: "COW",
    breed: "Milch Cow",
    gender: "FEMALE",
    ageYears: 4,
    ageMonths: 8,
    lactationNumber: 2,
    calvingDetails: "Calved 28 days ago, male calf at foot",
    pregnancyStatus: "Open (Milking Peak)",
    reportedMilkYieldLpd: 14.5,
    milkYieldUnit: "LPD",
    ownershipType: "OWNED",
    internalNotes: "Vedic A2 lineage with sweet milk, testing 4.6% fat.",
    healthNotes: "Completely healthy, gentle with household handlers.",
    createdAt: "2026-10-08T09:30:00Z",
    updatedAt: "2026-10-22T14:00:00Z",
    version: 1,
    listing: {
      title: "High Yield Milch Cow (14.5 Litres/Day Daily Tested)",
      description: "High quality dairy cow with rich A2 milk yield. Docile, healthy, and tested on-farm.",
      priceMin: 84000,
      priceMax: 92000,
      currency: "INR",
      status: "AVAILABLE",
      location: "Khardaha Nilkanth, Lar, Deoria",
      publishedAt: "2026-10-09T10:00:00Z",
      lastVerifiedAt: "2026-10-24",
    },
    images: [
      {
        id: "img-02",
        animalId: "PDPK-COW-02",
        url: "/assets/cow_1.jpg",
        displayOrder: 1,
        altText: "Milch Cow Profile View",
        isPrimary: true
      }
    ]
  },
  {
    id: "PDPK-BUF-03",
    tagNumber: "UP-DEO-4491",
    species: "BUFFALO",
    breed: "High Milking Buffalo",
    gender: "FEMALE",
    ageYears: 6,
    ageMonths: 0,
    lactationNumber: 3,
    calvingDetails: "Calved 14 days ago, female calf at foot",
    pregnancyStatus: "Milking Peak",
    reportedMilkYieldLpd: 19.5,
    milkYieldUnit: "LPD",
    ownershipType: "BROKERAGE",
    sellerContactId: "CONT-002",
    brokerageCommission: 2000,
    internalNotes: "Brokerage listing for progressive breeder. Verified 9.5L morning and 10L evening.",
    healthNotes: "Vigorously feeding, udder perfectly divided into 4 symmetric quarters.",
    createdAt: "2026-10-12T11:00:00Z",
    updatedAt: "2026-10-24T16:00:00Z",
    version: 2,
    listing: {
      title: "Heavy Dairy Buffalo (19.5 L/Day Tested Milk Yield)",
      description: "Top-tier high milking buffalo. Verified morning and evening dohai test. Inspection available at farm in Lar, Deoria.",
      priceMin: 160000,
      priceMax: 175000,
      currency: "INR",
      status: "AVAILABLE",
      location: "Khardaha Nilkanth, Lar, Deoria",
      publishedAt: "2026-10-13T08:00:00Z",
      lastVerifiedAt: "2026-10-25",
    },
    images: [
      {
        id: "img-03",
        animalId: "PDPK-BUF-03",
        url: "/assets/buffalo_heavy.jpg",
        displayOrder: 1,
        altText: "Heavy Dairy Buffalo in Enclosure",
        isPrimary: true
      }
    ]
  },
  {
    id: "PDPK-COW-04",
    tagNumber: "UP-DEO-6229",
    species: "COW",
    breed: "Milch Cow",
    gender: "FEMALE",
    ageYears: 4,
    ageMonths: 4,
    lactationNumber: 2,
    calvingDetails: "Calved 35 days ago, female calf at foot",
    pregnancyStatus: "Open",
    reportedMilkYieldLpd: 13.0,
    milkYieldUnit: "LPD",
    ownershipType: "OWNED",
    internalNotes: "Token advance received. Inspection scheduled at Lar farm.",
    healthNotes: "All veterinary health checkup certificates completed.",
    createdAt: "2026-10-01T10:00:00Z",
    updatedAt: "2026-10-24T12:00:00Z",
    version: 3,
    listing: {
      title: "Gentle A2 Milch Cow (Token Advance Accepted)",
      description: "High quality dairy cow with pure A2 milk, gentle temperament, and verified yield.",
      priceMin: 95000,
      priceMax: 105000,
      currency: "INR",
      status: "RESERVED",
      location: "Khardaha Nilkanth, Lar, Deoria",
      publishedAt: "2026-10-02T10:00:00Z",
      lastVerifiedAt: "2026-10-24",
      reservationDeposit: 10000,
      reservedForContactId: "CONT-004",
      reservedAt: "2026-10-24T11:45:00Z",
    },
    images: [
      {
        id: "img-04",
        animalId: "PDPK-COW-04",
        url: "/assets/cow_2.jpg",
        displayOrder: 1,
        altText: "Milch Cow in Shed",
        isPrimary: true
      }
    ]
  },
  {
    id: "PDPK-BUF-05",
    tagNumber: "UP-DEO-5011",
    species: "BUFFALO",
    breed: "High Milking Buffalo",
    gender: "FEMALE",
    ageYears: 4,
    ageMonths: 1,
    lactationNumber: 1,
    calvingDetails: "First calver (Heifer), calved 45 days ago",
    pregnancyStatus: "Open",
    reportedMilkYieldLpd: 15.0,
    milkYieldUnit: "LPD",
    ownershipType: "OWNED",
    internalNotes: "Sold and dispatched to Deoria farmer. Settlement received in full.",
    healthNotes: "Fitness certificate issued by veterinary officer.",
    createdAt: "2026-09-15T08:00:00Z",
    updatedAt: "2026-10-20T17:30:00Z",
    version: 4,
    listing: {
      title: "First Calver Dairy Buffalo (Sold to Deoria Farmer)",
      description: "Young first-time calver buffalo. Sold after on-farm morning-evening dohai inspection.",
      priceMin: 120000,
      priceMax: 130000,
      currency: "INR",
      status: "SOLD",
      location: "Khardaha Nilkanth, Lar, Deoria",
      publishedAt: "2026-09-16T09:00:00Z",
      lastVerifiedAt: "2026-10-20",
      soldPrice: 126000,
      soldToContactId: "CONT-004",
      soldAt: "2026-10-20T17:00:00Z",
    },
    images: [
      {
        id: "img-05",
        animalId: "PDPK-BUF-05",
        url: "/assets/buffalo_heifer.jpg",
        displayOrder: 1,
        altText: "First Calver Dairy Buffalo",
        isPrimary: true
      }
    ]
  },
  {
    id: "PDPK-COW-06",
    tagNumber: "UP-DEO-9023",
    species: "COW",
    breed: "Milch Cow",
    gender: "FEMALE",
    ageYears: 5,
    ageMonths: 6,
    lactationNumber: 3,
    calvingDetails: "Calved 18 days ago, white calf",
    pregnancyStatus: "Milking Peak",
    reportedMilkYieldLpd: 12.0,
    milkYieldUnit: "LPD",
    ownershipType: "OWNED",
    internalNotes: "Sturdy native breed cow, highly disease resistant.",
    healthNotes: "Dewormed and verified healthy.",
    createdAt: "2026-10-14T10:00:00Z",
    updatedAt: "2026-10-25T11:00:00Z",
    version: 1,
    listing: {
      title: "Native Milch Cow (12 L/Day Capacity)",
      description: "Pure indigenous milch cow known for hardiness and nutritious A2 milk.",
      priceMin: 68000,
      priceMax: 76000,
      currency: "INR",
      status: "AVAILABLE",
      location: "Khardaha Nilkanth, Lar, Deoria",
      publishedAt: "2026-10-15T10:00:00Z",
      lastVerifiedAt: "2026-10-25",
    },
    images: [
      {
        id: "img-06",
        animalId: "PDPK-COW-06",
        url: "/assets/cow_white.jpg",
        displayOrder: 1,
        altText: "Native Milch Cow",
        isPrimary: true
      }
    ]
  },
  {
    id: "PDPK-BUF-07",
    tagNumber: "UP-DEO-3199",
    species: "BUFFALO",
    breed: "High Milking Buffalo",
    gender: "FEMALE",
    ageYears: 6,
    ageMonths: 2,
    lactationNumber: 3,
    calvingDetails: "Calved 1 month ago, male calf",
    pregnancyStatus: "Open",
    reportedMilkYieldLpd: 18.0,
    milkYieldUnit: "LPD",
    ownershipType: "BROKERAGE",
    sellerContactId: "CONT-001",
    brokerageCommission: 1500,
    internalNotes: "Heavy frame, high fat milk content (7.8% fat).",
    healthNotes: "Sound health pass.",
    createdAt: "2026-10-18T09:00:00Z",
    updatedAt: "2026-10-24T15:00:00Z",
    version: 1,
    listing: {
      title: "Heavy High Milking Buffalo (18 L/Day / 7.8% Fat)",
      description: "Direct breeder cattle. High milk solids suitable for dairy businesses making ghee and sweets.",
      priceMin: 142000,
      priceMax: 152000,
      currency: "INR",
      status: "AVAILABLE",
      location: "Khardaha Nilkanth, Lar, Deoria",
      publishedAt: "2026-10-19T08:00:00Z",
      lastVerifiedAt: "2026-10-24",
    },
    images: [
      {
        id: "img-07",
        animalId: "PDPK-BUF-07",
        url: "/assets/buffalo_fat.jpg",
        displayOrder: 1,
        altText: "High Fat Dairy Buffalo",
        isPrimary: true
      }
    ]
  },
  {
    id: "PDPK-COW-08",
    tagNumber: "UP-DEO-1188",
    species: "COW",
    breed: "Milch Cow",
    gender: "FEMALE",
    ageYears: 4,
    ageMonths: 9,
    lactationNumber: 2,
    calvingDetails: "Calved 16 days ago, female calf",
    pregnancyStatus: "Peak Milking",
    reportedMilkYieldLpd: 22.0,
    milkYieldUnit: "LPD",
    ownershipType: "OWNED",
    internalNotes: "High milk volume yielder for dairy supply.",
    healthNotes: "Sound hoof health and healthy udder.",
    createdAt: "2026-10-19T10:00:00Z",
    updatedAt: "2026-10-25T14:00:00Z",
    version: 1,
    listing: {
      title: "Heavy Output Dairy Cow (22 Litres/Day Daily Tested)",
      description: "High milk producing dairy cow. Tested on-farm with two-time dohai inspection.",
      priceMin: 72000,
      priceMax: 80000,
      currency: "INR",
      status: "AVAILABLE",
      location: "Khardaha Nilkanth, Lar, Deoria",
      publishedAt: "2026-10-20T09:00:00Z",
      lastVerifiedAt: "2026-10-25",
    },
    images: [
      {
        id: "img-08",
        animalId: "PDPK-COW-08",
        url: "/assets/hf_cross_cow.jpg",
        displayOrder: 1,
        altText: "HF Cross Cow in Barn",
        isPrimary: true
      }
    ]
  }
];

export const initialTransactions: LivestockTransaction[] = [
  {
    id: "TXN-2026-088",
    animalId: "PDPK-BUF-05",
    listingReferenceTitle: "First Calver Murrah Heifer",
    buyerContactId: "CONT-004",
    sellerContactId: undefined, // Owned inventory
    ownershipType: "OWNED",
    agreedPrice: 126000,
    saleDate: "2026-10-20",
    status: "COMPLETED",
    amountPaid: 126000,
    outstandingBalance: 0,
    notes: "Full payment received in cash and direct UPI transfer. Animal transported via buyer's vehicle.",
    recordedBy: "Parmeshwar Kushwaha (Owner)"
  }
];

export const initialProductionEntries: MilkProductionEntry[] = [
  {
    id: "PROD-2026-1026-M",
    businessDate: today,
    shift: "MORNING",
    herdSource: "Main Dairy Shed A (Murrah Herd)",
    quantityLitres: 146.5,
    recordedBy: "Ramesh (Manager)",
    notes: "Smooth morning milking. 12 buffaloes milked.",
    createdAt: `${today}T06:30:00Z`
  },
  {
    id: "PROD-2026-1026-M2",
    businessDate: today,
    shift: "MORNING",
    herdSource: "Shed B (Desi Sahiwal & Gir Herd)",
    quantityLitres: 52.0,
    recordedBy: "Ramesh (Manager)",
    notes: "Pure A2 cow milk segregated into clean stainless cans.",
    createdAt: `${today}T06:45:00Z`
  }
];

export const initialCollectionEntries: MilkCollectionEntry[] = [
  {
    id: "COL-2026-1026-01",
    supplierContactId: "CONT-001", // Dinesh Chaudhary
    businessDate: today,
    shift: "MORNING",
    productType: "BUFFALO_MILK",
    grossLitresReceived: 45.0,
    acceptedLitres: 45.0,
    rejectedLitres: 0.0,
    fatPercentage: 7.4,
    snfPercentage: 9.2,
    purchaseRatePerLitre: 58.0,
    totalCost: 2610.0, // 45 * 58
    paymentStatus: "PENDING",
    recordedBy: "Ramesh (Manager)",
    notes: "Lactometer test clear, high quality fresh milk.",
    createdAt: `${today}T06:15:00Z`
  }
];

export const initialSubscriptions: DeliverySubscription[] = [
  {
    id: "SUB-001",
    customerContactId: "CONT-003", // Dr. Arvind Tiwari
    productType: "BUFFALO_MILK",
    quantityLitres: 2.0,
    shift: "MORNING",
    ratePerLitre: 70,
    billingPreference: "MONTHLY",
    deliveryInstructions: "Leave in steel container outside gate before 6:30 AM",
    status: "ACTIVE",
    startDate: "2025-01-05",
    createdAt: "2025-01-05",
    updatedAt: "2026-10-01"
  },
  {
    id: "SUB-002",
    customerContactId: "CONT-006", // Sunita Devi
    productType: "COW_MILK",
    quantityLitres: 1.5,
    shift: "MORNING",
    ratePerLitre: 62,
    billingPreference: "MONTHLY",
    deliveryInstructions: "Bell once and hand over directly to family",
    status: "ACTIVE",
    startDate: "2025-08-14",
    createdAt: "2025-08-14",
    updatedAt: "2026-10-15"
  },
  {
    id: "SUB-003",
    customerContactId: "CONT-005", // Hotel Vrindavan Sweets
    productType: "BUFFALO_MILK",
    quantityLitres: 25.0,
    shift: "MORNING",
    ratePerLitre: 68,
    billingPreference: "WEEKLY",
    deliveryInstructions: "Deliver directly to kitchen sweet section at Golghar by 7:00 AM",
    status: "ACTIVE",
    startDate: "2024-06-20",
    createdAt: "2024-06-20",
    updatedAt: "2026-10-25"
  }
];

export const initialDeliveries: MilkDelivery[] = [
  {
    id: `DEL-${today}-001`,
    businessDate: today,
    subscriptionId: "SUB-001",
    customerContactId: "CONT-003",
    productType: "BUFFALO_MILK",
    shift: "MORNING",
    scheduledQuantityLitres: 2.0,
    actualDeliveredLitres: 2.0,
    ratePerLitre: 70,
    totalBilledAmount: 140,
    status: "DELIVERED",
    deliveredAt: `${today}T06:22:00Z`,
    recordedBy: "Babloo (Delivery Staff)"
  },
  {
    id: `DEL-${today}-002`,
    businessDate: today,
    subscriptionId: "SUB-002",
    customerContactId: "CONT-006",
    productType: "COW_MILK",
    shift: "MORNING",
    scheduledQuantityLitres: 1.5,
    actualDeliveredLitres: 1.5,
    ratePerLitre: 62,
    totalBilledAmount: 93,
    status: "DELIVERED",
    deliveredAt: `${today}T06:40:00Z`,
    recordedBy: "Babloo (Delivery Staff)"
  },
  {
    id: `DEL-${today}-003`,
    businessDate: today,
    subscriptionId: "SUB-003",
    customerContactId: "CONT-005",
    productType: "BUFFALO_MILK",
    shift: "MORNING",
    scheduledQuantityLitres: 25.0,
    actualDeliveredLitres: 25.0,
    ratePerLitre: 68,
    totalBilledAmount: 1700,
    status: "DELIVERED",
    deliveredAt: `${today}T06:55:00Z`,
    recordedBy: "Babloo (Delivery Staff)"
  }
];

export const initialInventoryMovements: MilkInventoryMovement[] = [
  {
    id: "MOV-001",
    businessDate: today,
    productType: "BUFFALO_MILK",
    movementType: "OPENING_STOCK",
    direction: "INFLOW",
    quantityLitres: 18.0,
    notes: "Chilled carryover from yesterday evening",
    recordedBy: "System",
    timestamp: `${today}T04:00:00Z`
  },
  {
    id: "MOV-002",
    businessDate: today,
    productType: "COW_MILK",
    movementType: "OPENING_STOCK",
    direction: "INFLOW",
    quantityLitres: 8.5,
    notes: "Chilled carryover cow milk",
    recordedBy: "System",
    timestamp: `${today}T04:00:00Z`
  },
  {
    id: "MOV-003",
    businessDate: today,
    productType: "BUFFALO_MILK",
    movementType: "OWN_PRODUCTION",
    direction: "INFLOW",
    quantityLitres: 146.5,
    sourceRecordId: "PROD-2026-1026-M",
    notes: "Morning buffalo production",
    recordedBy: "Ramesh (Manager)",
    timestamp: `${today}T06:30:00Z`
  },
  {
    id: "MOV-004",
    businessDate: today,
    productType: "COW_MILK",
    movementType: "OWN_PRODUCTION",
    direction: "INFLOW",
    quantityLitres: 52.0,
    sourceRecordId: "PROD-2026-1026-M2",
    notes: "Morning cow production",
    recordedBy: "Ramesh (Manager)",
    timestamp: `${today}T06:45:00Z`
  },
  {
    id: "MOV-005",
    businessDate: today,
    productType: "BUFFALO_MILK",
    movementType: "PURCHASED_ACCEPTED",
    direction: "INFLOW",
    quantityLitres: 45.0,
    sourceRecordId: "COL-2026-1026-01",
    notes: "Intake from Dinesh Chaudhary",
    recordedBy: "Ramesh (Manager)",
    timestamp: `${today}T06:15:00Z`
  },
  {
    id: "MOV-006",
    businessDate: today,
    productType: "BUFFALO_MILK",
    movementType: "RETAIL_DELIVERY",
    direction: "OUTFLOW",
    quantityLitres: 27.0, // 2L + 25L
    notes: "Morning deliveries fulfilled",
    recordedBy: "Babloo (Delivery Staff)",
    timestamp: `${today}T07:15:00Z`
  },
  {
    id: "MOV-007",
    businessDate: today,
    productType: "COW_MILK",
    movementType: "RETAIL_DELIVERY",
    direction: "OUTFLOW",
    quantityLitres: 1.5,
    notes: "Morning cow milk deliveries fulfilled",
    recordedBy: "Babloo (Delivery Staff)",
    timestamp: `${today}T07:15:00Z`
  }
];

export const initialPayments: PaymentRecord[] = [
  {
    id: "PAY-001",
    direction: "CUSTOMER_RECEIPT",
    contactId: "CONT-005", // Hotel Vrindavan Sweets
    amount: 11500,
    currency: "INR",
    paymentMethod: "UPI",
    transactionDate: "2026-10-24",
    referenceNumber: "UPI/629810334/VRIN",
    notes: "Weekly milk settlement",
    status: "POSTED",
    recordedBy: "Parmeshwar Kushwaha (Owner)",
    createdAt: "2026-10-24T18:00:00Z"
  },
  {
    id: "PAY-002",
    direction: "SUPPLIER_PAYMENT",
    contactId: "CONT-001", // Dinesh Chaudhary
    amount: 15000,
    currency: "INR",
    paymentMethod: "CASH",
    transactionDate: "2026-10-22",
    referenceNumber: "CASH-SLIP-841",
    notes: "Bi-weekly milk collection payout",
    status: "POSTED",
    recordedBy: "Parmeshwar Kushwaha (Owner)",
    createdAt: "2026-10-22T17:30:00Z"
  }
];

export const initialAuditLogs: AuditEvent[] = [
  {
    id: "AUD-001",
    actor: "Parmeshwar Kushwaha (Owner)",
    action: "CREATED_LISTING",
    entityType: "ANIMAL",
    entityId: "PDPK-BUF-01",
    timestamp: "2026-10-06T09:00:00Z",
    details: "Published prime Murrah buffalo listing with 17.5 LPD verified yield."
  },
  {
    id: "AUD-002",
    actor: "Parmeshwar Kushwaha (Owner)",
    action: "RESERVED_ANIMAL",
    entityType: "ANIMAL",
    entityId: "PDPK-COW-04",
    timestamp: "2026-10-24T11:45:00Z",
    details: "Accepted ₹10,000 token deposit from Manoj Kumar Verma for Gir cow."
  },
  {
    id: "AUD-003",
    actor: "Parmeshwar Kushwaha (Owner)",
    action: "COMPLETED_SALE",
    entityType: "ANIMAL",
    entityId: "PDPK-BUF-05",
    timestamp: "2026-10-20T17:00:00Z",
    details: "Recorded completed sale of Murrah Heifer for ₹1,26,000 to Suresh Yadav."
  }
];

export const initialEnquiries: Enquiry[] = [
  {
    id: "ENQ-2026-101",
    customerName: "Parijat Commercial Dairy Farm (Sudhir Dubey)",
    contactPerson: "Sudhir Dubey",
    phone: "9839120445",
    email: "parijat.dairy@gmail.com",
    location: "Rudrapur, Deoria District",
    enquiryType: "BULK_COMMERCIAL",
    animalType: "BUFFALO",
    preferredBreed: "High Milking Buffalo (16-18 LPD)",
    requestedQuantity: 10,
    preferredMilkYield: "16-18 LPD",
    budgetPerAnimal: 140000,
    totalBudget: 1400000,
    deliveryLocation: "Rudrapur Farm Site, Deoria",
    requiredDeliveryDate: "2026-11-15",
    additionalInstructions: "Require 2nd lactation, healthy female calves at foot. Pail test (dohai) mandatory for all 10 heads.",
    status: "QUOTATION_SENT",
    assignedStaff: "Parmeshwar Kushwaha (Owner)",
    quotationAmount: 1380000,
    transportQuotation: 18000,
    quotationNotes: "Supplying 10 selected high-milking buffaloes with veterinary fit-to-travel certificate and 2-day on-farm test period.",
    createdAt: "2026-10-22T11:30:00Z",
    updatedAt: "2026-10-24T15:20:00Z",
  },
  {
    id: "ENQ-2026-102",
    customerName: "Manoj Kumar Verma",
    contactPerson: "Manoj Verma",
    phone: "9792044109",
    location: "Hata, Kushinagar (Near Deoria Border)",
    enquiryType: "INSPECTION_REQUEST",
    animalId: "PDPK-BUF-01",
    animalType: "BUFFALO",
    requestedQuantity: 1,
    deliveryLocation: "Hata, Kushinagar",
    additionalInstructions: "Would like to visit Khardaha Nilkanth, Lar farm tomorrow morning 6:00 AM for live milking test of PDPK-BUF-01.",
    status: "CONTACTED",
    assignedStaff: "Parmeshwar Kushwaha (Owner)",
    createdAt: "2026-10-25T14:10:00Z",
    updatedAt: "2026-10-25T16:00:00Z",
  },
  {
    id: "ENQ-2026-103",
    customerName: "Kisan Pragatisheel Gaushala (Ramakant Yadav)",
    contactPerson: "Ramakant Yadav",
    phone: "9451088721",
    location: "Salempur, Deoria",
    enquiryType: "BULK_COMMERCIAL",
    animalType: "BUFFALO",
    requestedQuantity: 5,
    preferredMilkYield: "15-18 LPD",
    budgetPerAnimal: 135000,
    totalBudget: 675000,
    deliveryLocation: "Salempur bypass dairy shed, Deoria",
    requiredDeliveryDate: "2026-11-05",
    additionalInstructions: "Prompt delivery with veterinary immunization documents.",
    status: "ORDER_CONFIRMED",
    assignedStaff: "Parmeshwar Kushwaha (Owner)",
    quotationAmount: 660000,
    transportQuotation: 9000,
    quotationNotes: "Order confirmed with 10% advance. Loading vehicle arranged.",
    createdAt: "2026-10-18T09:45:00Z",
    updatedAt: "2026-10-24T18:10:00Z",
  },
  {
    id: "ENQ-2026-104",
    customerName: "Chaudhary Dudh Utpadak Sangh",
    contactPerson: "Santosh Chaudhary",
    phone: "9415877662",
    location: "Gorakhpur Road, Deoria",
    enquiryType: "TRANSPORT_INQUIRY",
    animalType: "ANY",
    requestedQuantity: 4,
    deliveryLocation: "Pipraich / Gorakhpur Border",
    additionalInstructions: "Need dedicated 14-ft canter with straw bedding and attendant.",
    status: "REQUIREMENT_CONFIRMED",
    assignedStaff: "Manager",
    transportQuotation: 12500,
    createdAt: "2026-10-26T08:15:00Z",
    updatedAt: "2026-10-26T10:00:00Z",
  }
];

export const initialOrders: LivestockOrder[] = [
  {
    id: "ORD-2026-088",
    enquiryId: "ENQ-2026-103",
    customerName: "Kisan Pragatisheel Gaushala (Ramakant Yadav)",
    phone: "9451088721",
    deliveryAddress: "Salempur bypass dairy shed, Deoria",
    animalIds: ["PDPK-BUF-01", "PDPK-BUF-02", "PDPK-BUF-03"],
    agreedPrice: 410000,
    transportQuote: 9000,
    totalAmount: 419000,
    paymentStatus: "PARTIAL_ADVANCE",
    advanceAmountPaid: 50000,
    veterinaryCheckPassed: true,
    deliveryStatus: "TRANSPORT_ASSIGNED",
    orderStatus: "TRANSPORT_ARRANGED",
    transporterDetails: "Vehicle UP-52-T-4910 (Bolero Pickup with rubber matting and shade canvas)",
    dispatchDate: "2026-10-28",
    notes: "Veterinary fitness certificate issued by Dr. S. K. Singh (Lar Veterinary Hospital). Balance payable upon arrival inspection.",
    createdAt: "2026-10-24T18:15:00Z",
    updatedAt: "2026-10-26T11:00:00Z"
  }
];

/**
 * In-memory repository with singleton state
 */
class MockDatabase {
  private state: DatabaseState;

  constructor() {
    this.state = {
      contacts: [...initialContacts],
      animals: [...initialAnimals],
      transactions: [...initialTransactions],
      productionEntries: [...initialProductionEntries],
      collectionEntries: [...initialCollectionEntries],
      inventoryMovements: [...initialInventoryMovements],
      subscriptions: [...initialSubscriptions],
      deliveries: [...initialDeliveries],
      payments: [...initialPayments],
      auditLogs: [...initialAuditLogs],
      enquiries: [...initialEnquiries],
      orders: [...initialOrders],
    };
  }

  // --- LIVESTOCK ---
  getAnimals(filters?: { species?: string; breed?: string; minPrice?: number; maxPrice?: number; status?: string; search?: string }): Animal[] {
    let result = [...this.state.animals];
    if (!filters) return result;

    if (filters.species && filters.species !== 'ALL') {
      result = result.filter(a => a.species === filters.species);
    }
    if (filters.breed && filters.breed !== 'ALL') {
      result = result.filter(a => a.breed.toLowerCase().includes(filters.breed!.toLowerCase()));
    }
    if (filters.status && filters.status !== 'ALL') {
      result = result.filter(a => a.listing.status === filters.status);
    }
    if (filters.minPrice !== undefined) {
      result = result.filter(a => a.listing.priceMin >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter(a => a.listing.priceMax <= filters.maxPrice!);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(a => 
        a.id.toLowerCase().includes(q) ||
        a.breed.toLowerCase().includes(q) ||
        a.tagNumber.toLowerCase().includes(q) ||
        a.listing.title.toLowerCase().includes(q) ||
        a.listing.location.toLowerCase().includes(q)
      );
    }
    return result;
  }

  getPublicAnimals(): Animal[] {
    // Public queries only show AVAILABLE listings (sold and archived are never available for public discovery)
    return this.state.animals.filter(a => a.listing.status === 'AVAILABLE' || a.listing.status === 'RESERVED');
  }

  getAnimalById(id: string): Animal | undefined {
    return this.state.animals.find(a => a.id === id);
  }

  createAnimal(animal: Animal, actor = "Parmeshwar Kushwaha (Owner)"): Animal {
    this.state.animals.unshift(animal);
    this.addAuditLog({
      actor,
      action: "CREATED_ANIMAL",
      entityType: "ANIMAL",
      entityId: animal.id,
      details: `Created new ${animal.species} (${animal.breed}) listing ${animal.id}`
    });
    return animal;
  }

  updateAnimal(id: string, updates: Partial<Animal>, actor = "Parmeshwar Kushwaha (Owner)"): Animal | undefined {
    const idx = this.state.animals.findIndex(a => a.id === id);
    if (idx === -1) return undefined;

    const current = this.state.animals[idx];
    const updated: Animal = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
      version: current.version + 1,
      listing: {
        ...current.listing,
        ...(updates.listing || {})
      }
    };
    this.state.animals[idx] = updated;

    this.addAuditLog({
      actor,
      action: "UPDATED_ANIMAL",
      entityType: "ANIMAL",
      entityId: id,
      details: `Updated details for ${id} (status: ${updated.listing.status})`
    });

    return updated;
  }

  reserveAnimal(id: string, deposit: number, contactId: string, actor = "Parmeshwar Kushwaha (Owner)"): Animal | undefined {
    const animal = this.getAnimalById(id);
    if (!animal) return undefined;
    if (animal.listing.status !== 'AVAILABLE') {
      throw new Error(`Cannot reserve animal in '${animal.listing.status}' status. Only AVAILABLE animals can be reserved.`);
    }

    const updated = this.updateAnimal(id, {
      listing: {
        ...animal.listing,
        status: 'RESERVED',
        reservationDeposit: deposit,
        reservedForContactId: contactId,
        reservedAt: new Date().toISOString(),
      }
    }, actor);

    return updated;
  }

  releaseReservation(id: string, actor = "Parmeshwar Kushwaha (Owner)"): Animal | undefined {
    const animal = this.getAnimalById(id);
    if (!animal) return undefined;
    if (animal.listing.status !== 'RESERVED') {
      throw new Error(`Cannot release animal in '${animal.listing.status}' status.`);
    }

    const updated = this.updateAnimal(id, {
      listing: {
        ...animal.listing,
        status: 'AVAILABLE',
        reservationDeposit: undefined,
        reservedForContactId: undefined,
        reservedAt: undefined,
      }
    }, actor);

    return updated;
  }

  completeSale(id: string, buyerContactId: string, agreedPrice: number, notes?: string, actor = "Parmeshwar Kushwaha (Owner)"): LivestockTransaction | undefined {
    const animal = this.getAnimalById(id);
    if (!animal) return undefined;
    if (animal.listing.status === 'SOLD') {
      throw new Error(`Animal ${id} is already marked as SOLD.`);
    }

    // Update animal listing status
    this.updateAnimal(id, {
      listing: {
        ...animal.listing,
        status: 'SOLD',
        soldPrice: agreedPrice,
        soldToContactId: buyerContactId,
        soldAt: new Date().toISOString()
      }
    }, actor);

    // Record livestock transaction
    const txn: LivestockTransaction = {
      id: `TXN-${new Date().getFullYear()}-${String(this.state.transactions.length + 1).padStart(3, '0')}`,
      animalId: animal.id,
      listingReferenceTitle: animal.listing.title,
      buyerContactId,
      sellerContactId: animal.sellerContactId,
      ownershipType: animal.ownershipType,
      agreedPrice,
      commissionAmount: animal.ownershipType === 'BROKERAGE' ? (animal.brokerageCommission || 1500) : undefined,
      commissionSettled: animal.ownershipType === 'BROKERAGE' ? false : undefined,
      saleDate: getTodayBusinessDate(),
      status: 'COMPLETED',
      amountPaid: agreedPrice,
      outstandingBalance: 0,
      notes: notes || `Direct completed sale recorded by ${actor}`,
      recordedBy: actor
    };

    this.state.transactions.unshift(txn);

    this.addAuditLog({
      actor,
      action: "COMPLETED_SALE",
      entityType: "ANIMAL",
      entityId: id,
      details: `Sold ${id} for ₹${agreedPrice.toLocaleString('en-IN')} to buyer ${buyerContactId}`
    });

    return txn;
  }

  // --- CONTACTS ---
  getContacts(): Contact[] {
    return this.state.contacts;
  }

  getContactById(id: string): Contact | undefined {
    return this.state.contacts.find(c => c.id === id);
  }

  createContact(contact: Contact): Contact {
    this.state.contacts.push(contact);
    return contact;
  }

  // --- DAIRY OPERATIONS ---
  getProductionEntries(date?: string): MilkProductionEntry[] {
    if (date) {
      return this.state.productionEntries.filter(p => p.businessDate === date);
    }
    return this.state.productionEntries;
  }

  addProductionEntry(entry: MilkProductionEntry): MilkProductionEntry {
    this.state.productionEntries.unshift(entry);
    
    // Create corresponding stock movement ledger entry
    const productType = entry.herdSource.toLowerCase().includes('cow') || entry.herdSource.toLowerCase().includes('sahiwal') || entry.herdSource.toLowerCase().includes('gir')
      ? 'COW_MILK'
      : 'BUFFALO_MILK';

    const movement: MilkInventoryMovement = {
      id: `MOV-${Date.now()}`,
      businessDate: entry.businessDate,
      productType,
      movementType: 'OWN_PRODUCTION',
      direction: 'INFLOW',
      quantityLitres: entry.quantityLitres,
      sourceRecordId: entry.id,
      notes: entry.notes || `Own production from ${entry.herdSource}`,
      recordedBy: entry.recordedBy,
      timestamp: new Date().toISOString()
    };
    this.state.inventoryMovements.unshift(movement);

    this.addAuditLog({
      actor: entry.recordedBy,
      action: "POSTED_PRODUCTION",
      entityType: "PRODUCTION",
      entityId: entry.id,
      details: `Added ${entry.quantityLitres}L own milk production (${entry.shift})`
    });

    return entry;
  }

  getCollectionEntries(date?: string): MilkCollectionEntry[] {
    if (date) {
      return this.state.collectionEntries.filter(c => c.businessDate === date);
    }
    return this.state.collectionEntries;
  }

  addCollectionEntry(entry: MilkCollectionEntry): MilkCollectionEntry {
    this.state.collectionEntries.unshift(entry);

    // Only ACCEPTED milk enters saleable inventory (rejected milk does not increase stock)
    if (entry.acceptedLitres > 0) {
      const movement: MilkInventoryMovement = {
        id: `MOV-${Date.now()}`,
        businessDate: entry.businessDate,
        productType: entry.productType,
        movementType: 'PURCHASED_ACCEPTED',
        direction: 'INFLOW',
        quantityLitres: entry.acceptedLitres,
        sourceRecordId: entry.id,
        notes: `Intake from supplier ${entry.supplierContactId} (${entry.fatPercentage || 0}% Fat)`,
        recordedBy: entry.recordedBy,
        timestamp: new Date().toISOString()
      };
      this.state.inventoryMovements.unshift(movement);
    }

    this.addAuditLog({
      actor: entry.recordedBy,
      action: "RECORDED_COLLECTION",
      entityType: "COLLECTION",
      entityId: entry.id,
      details: `Intake: ${entry.grossLitresReceived}L received, ${entry.acceptedLitres}L accepted @ ₹${entry.purchaseRatePerLitre}/L`
    });

    return entry;
  }

  // --- RECONCILIATION & STOCK LEDGER ---
  getInventoryMovements(date?: string): MilkInventoryMovement[] {
    if (date) {
      return this.state.inventoryMovements.filter(m => m.businessDate === date);
    }
    return this.state.inventoryMovements;
  }

  getStockReconciliation(date: string = today) {
    const movements = this.state.inventoryMovements.filter(m => m.businessDate === date);

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
        calculatedClosing: closingBuffalo
      },
      cow: {
        opening: openingCow,
        production: productionCow,
        purchased: purchasedCow,
        available: availableCow,
        soldOrDelivered: deliveredCow,
        waste: wasteCow,
        calculatedClosing: closingCow
      },
      totalAvailableLitres: availableBuffalo + availableCow,
      totalDispatchedLitres: deliveredBuffalo + deliveredCow,
      totalClosingLitres: closingBuffalo + closingCow,
    };
  }

  // --- SUBSCRIPTIONS & DELIVERIES ---
  getSubscriptions(): DeliverySubscription[] {
    return this.state.subscriptions;
  }

  createSubscription(sub: DeliverySubscription): DeliverySubscription {
    this.state.subscriptions.push(sub);
    this.addAuditLog({
      actor: "Staff",
      action: "CREATED_SUBSCRIPTION",
      entityType: "SUBSCRIPTION",
      entityId: sub.id,
      details: `New recurring subscription for customer ${sub.customerContactId} (${sub.quantityLitres}L ${sub.productType})`
    });
    return sub;
  }

  getDeliveries(date: string = today): MilkDelivery[] {
    return this.state.deliveries.filter(d => d.businessDate === date);
  }

  /**
   * Idempotent daily delivery run generation:
   * Generates deliveries from active subscriptions without duplicating existing entries.
   */
  generateDailyDeliveries(date: string = today, shift: 'MORNING' | 'EVENING' = 'MORNING', recordedBy = "Manager"): MilkDelivery[] {
    const existing = this.getDeliveries(date).filter(d => d.shift === shift);
    const existingSubIds = new Set(existing.map(d => d.subscriptionId));

    const activeSubs = this.state.subscriptions.filter(s => 
      s.status === 'ACTIVE' && 
      s.shift === shift && 
      !existingSubIds.has(s.id)
    );

    const generated: MilkDelivery[] = [];
    for (const sub of activeSubs) {
      const delivery: MilkDelivery = {
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
        recordedBy
      };
      this.state.deliveries.push(delivery);
      generated.push(delivery);
    }

    if (generated.length > 0) {
      this.addAuditLog({
        actor: recordedBy,
        action: "GENERATED_DELIVERIES",
        entityType: "DELIVERY",
        entityId: `BATCH-${date}-${shift}`,
        details: `Generated ${generated.length} planned deliveries for ${date} (${shift})`
      });
    }

    return this.getDeliveries(date);
  }

  updateDeliveryStatus(id: string, status: DeliveryStatus, actualLitres?: number, skipReason?: string, recordedBy = "Delivery Boy"): MilkDelivery | undefined {
    const delivery = this.state.deliveries.find(d => d.id === id);
    if (!delivery) return undefined;

    delivery.status = status;
    if (actualLitres !== undefined) {
      delivery.actualDeliveredLitres = actualLitres;
      delivery.totalBilledAmount = actualLitres * delivery.ratePerLitre;
    }
    if (skipReason) {
      delivery.skipOrFailureReason = skipReason;
    }
    if (status === 'DELIVERED') {
      delivery.deliveredAt = new Date().toISOString();
    }
    delivery.recordedBy = recordedBy;

    return delivery;
  }

  // --- FINANCIALS & AUDIT ---
  getFinancialSummary() {
    // Calculate customer receivables
    const totalDeliveriesBilled = this.state.deliveries
      .filter(d => d.status === 'DELIVERED' || d.status === 'PARTIALLY_DELIVERED')
      .reduce((sum, d) => sum + d.totalBilledAmount, 0);

    const customerPaymentsReceived = this.state.payments
      .filter(p => p.direction === 'CUSTOMER_RECEIPT' && p.status === 'POSTED')
      .reduce((sum, p) => sum + p.amount, 0);

    const customerOutstanding = Math.max(0, 18450 + totalDeliveriesBilled - customerPaymentsReceived);

    // Calculate supplier payables
    const totalPurchasedMilkCost = this.state.collectionEntries
      .reduce((sum, c) => sum + c.totalCost, 0);

    const supplierPayoutsMade = this.state.payments
      .filter(p => p.direction === 'SUPPLIER_PAYMENT' && p.status === 'POSTED')
      .reduce((sum, p) => sum + p.amount, 0);

    const supplierPayable = Math.max(0, 26100 + totalPurchasedMilkCost - supplierPayoutsMade);

    // Livestock sales revenue
    const livestockSalesRevenue = this.state.transactions
      .filter(t => t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.agreedPrice, 0);

    return {
      customerOutstanding,
      supplierPayable,
      livestockSalesRevenue,
      customerPaymentsReceived,
      supplierPayoutsMade,
    };
  }

  getPayments(): PaymentRecord[] {
    return this.state.payments;
  }

  addPayment(payment: PaymentRecord): PaymentRecord {
    this.state.payments.unshift(payment);
    this.addAuditLog({
      actor: payment.recordedBy,
      action: "POSTED_PAYMENT",
      entityType: "PAYMENT",
      entityId: payment.id,
      details: `${payment.direction === 'CUSTOMER_RECEIPT' ? 'Received from' : 'Paid to'} contact ${payment.contactId}: ₹${payment.amount.toLocaleString('en-IN')}`
    });
    return payment;
  }

  getAuditLogs(): AuditEvent[] {
    return this.state.auditLogs;
  }

  // --- ENQUIRIES & BULK ORDERS (PRD 1.0) ---
  getEnquiries(status?: string): Enquiry[] {
    if (!status || status === 'ALL') {
      return this.state.enquiries;
    }
    return this.state.enquiries.filter(e => e.status === status);
  }

  getEnquiryById(id: string): Enquiry | undefined {
    return this.state.enquiries.find(e => e.id === id);
  }

  createEnquiry(data: Partial<Enquiry>): Enquiry {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newId = `ENQ-2026-${randomSuffix}`;
    const now = new Date().toISOString();
    
    const enquiry: Enquiry = {
      id: newId,
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

    this.state.enquiries.unshift(enquiry);
    this.addAuditLog({
      actor: enquiry.customerName,
      action: "RECEIVED_ENQUIRY",
      entityType: "ENQUIRY",
      entityId: enquiry.id,
      details: `New ${enquiry.enquiryType} enquiry from ${enquiry.customerName} (${enquiry.phone}) for ${enquiry.requestedQuantity}x ${enquiry.animalType}.`
    });

    return enquiry;
  }

  updateEnquiryStatus(
    id: string, 
    status: EnquiryStatus, 
    notes?: string, 
    quotationAmount?: number, 
    transportQuotation?: number,
    assignedStaff?: string
  ): Enquiry | undefined {
    const enquiry = this.state.enquiries.find(e => e.id === id);
    if (!enquiry) return undefined;

    enquiry.status = status;
    enquiry.updatedAt = new Date().toISOString();
    if (notes !== undefined) enquiry.quotationNotes = notes;
    if (quotationAmount !== undefined) enquiry.quotationAmount = quotationAmount;
    if (transportQuotation !== undefined) enquiry.transportQuotation = transportQuotation;
    if (assignedStaff !== undefined) enquiry.assignedStaff = assignedStaff;

    this.addAuditLog({
      actor: assignedStaff || 'Staff',
      action: "UPDATED_ENQUIRY_STATUS",
      entityType: "ENQUIRY",
      entityId: id,
      details: `Enquiry #${id} status changed to ${status}.`
    });

    return enquiry;
  }

  // --- LIVESTOCK ORDERS (PRD 1.0) ---
  getOrders(): LivestockOrder[] {
    return this.state.orders;
  }

  getOrderById(id: string): LivestockOrder | undefined {
    return this.state.orders.find(o => o.id === id);
  }

  createOrder(data: Partial<LivestockOrder>): LivestockOrder {
    const id = `ORD-2026-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();
    
    const order: LivestockOrder = {
      id,
      enquiryId: data.enquiryId,
      customerName: data.customerName || 'Farm Customer',
      phone: data.phone || '',
      deliveryAddress: data.deliveryAddress || 'Deoria District, UP',
      animalIds: data.animalIds || [],
      agreedPrice: data.agreedPrice || 0,
      transportQuote: data.transportQuote || 0,
      totalAmount: (data.agreedPrice || 0) + (data.transportQuote || 0),
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

    this.state.orders.unshift(order);
    this.addAuditLog({
      actor: 'Owner',
      action: "CREATED_ORDER",
      entityType: "ORDER",
      entityId: order.id,
      details: `Livestock order #${order.id} confirmed for ${order.customerName}: ₹${order.totalAmount.toLocaleString('en-IN')}`
    });

    return order;
  }

  updateOrderStatus(
    id: string, 
    status: EnquiryStatus, 
    deliveryStatus?: any,
    transporterDetails?: string
  ): LivestockOrder | undefined {
    const order = this.state.orders.find(o => o.id === id);
    if (!order) return undefined;

    order.orderStatus = status;
    order.updatedAt = new Date().toISOString();
    if (deliveryStatus) order.deliveryStatus = deliveryStatus;
    if (transporterDetails) order.transporterDetails = transporterDetails;

    this.addAuditLog({
      actor: 'Owner',
      action: "UPDATED_ORDER_STATUS",
      entityType: "ORDER",
      entityId: id,
      details: `Order #${id} updated: status=${status}, delivery=${order.deliveryStatus}`
    });

    return order;
  }

  private addAuditLog(entry: Omit<AuditEvent, 'id' | 'timestamp'>) {
    const log: AuditEvent = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.state.auditLogs.unshift(log);
  }
}

export const db = new MockDatabase();
