# Purvanchal Dairy & Pashu Kendra — Livestock Trading & Dairy Management Platform

A high-integrity, full-stack web application designed for a 25+ year established agricultural enterprise in Gorakhpur, Uttar Pradesh. The platform bridges public discovery for prospective buyers and household milk consumers with an operational back-office for livestock inventory, brokerage transactions, daily milk collection, recurring delivery runs, and ledger accounting.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural and branding parameters confirmed in Phase 1 have been integrated as first-class constraints.

- **Enterprise & Proprietor Identity**: Configured centrally as **Purvanchal Dairy & Pashu Kendra**, founded and stewarded by **Shri Ram Yadav** (25+ years experience in Gorakhpur, Uttar Pradesh, India).
- **Architecture Strategy**: Full-stack Node.js Express server orchestrator with Vite middleware in development, exposing type-safe REST endpoints (`/api/*`) with modular domain services, and hosting the React client.
- **Workflow Staging**: Phase-one implementation prioritizes the **Livestock catalogue, animal listings, and brokerage workflows**, backed by the complete foundational schema for dairy operations (milk collection, stock movements, subscriptions, and deliveries).
- **Currency & Localization**: Indian Rupee (`₹` INR) formatted with Indian numbering conventions (`₹1,25,000`), Gorakhpur location anchoring, and bilingual-ready architecture (English default with Hindi operational labels).

---

## 1. Overview & Core Concept

### What It Does
Purvanchal Dairy & Pashu Kendra delivers two interconnected operational experiences within a unified full-stack system:
1. **Public Discovery Website**: A high-trust, image-led digital showroom where buyers discover verified dairy cattle (Murrah, Sahiwal, Gir, Tharparkar, Jaffarabadi, Crossbreds), view verified lactation & milk yield records, calculate realistic transport estimates, and initiate structured direct WhatsApp or phone inquiries. Household visitors can also explore dairy subscription options.
2. **Private Operations Console**: Role-gated management workspace for the **Owner** (full administrative authority, financial ledger, user roles, pricing rules) and **Manager** (daily livestock status updates, brokerage tracking, milk collection intake, delivery confirmations).

### Target Personas
- **Prospective Cattle Buyers & Farmers**: Regional dairy farmers and commercial buyers seeking healthy milch cows and buffaloes with verified milk yields and clear ownership/brokerage provenance.
- **Dairy Consumers & Institutional Buyers**: Local Gorakhpur families subscribing to daily raw/toned milk deliveries and sweet shops/vendors purchasing bulk milk batches.
- **Shri Ram Yadav (Owner)**: Requires bird's-eye visibility over inventory valuation, brokerage commissions, daily milk inflows vs outflows, and outstanding customer/supplier balances.
- **Operations Manager**: Executes animal intake, recording photos, marking reservations, noting farmer milk collection weights, and updating morning delivery runs.

---

## 2. User Experience & Visual Design

### Key User Flows

#### A. Public Animal Discovery to WhatsApp Negotiation
```
[Homepage / Hero] ──> [Filter Catalogue: Murrah Buffalo, 14-18L/day] 
       │
       ▼
[Animal Detail View] ──> [Inspect Gallery, Lactation, Calving & Video]
       │
       ▼
[WhatsApp Enquiry CTA] ──> Pre-composed message with Animal ID (e.g. #PK-2026-BUF-04),
                           breed, asking price, and buyer question.
```

#### B. Livestock Intake, Publication & Sale Lifecycle
```
[Admin: New Animal Entry] ──> [Record Species, Breed, Lactation, Ownership (Owned vs Brokerage)]
       │
       ▼
[Upload Photos & Set Indicative Price] ──> [Status: AVAILABLE]
       │
       ▼
[Buyer Approached] ──> [Mark RESERVED with Buyer Contact & Advance Token]
       │
       ▼
[Sale Finalized] ──> [Record Sale Price, Settlement, Brokerage Commission (if applicable)]
       │
       ▼
[Status: SOLD] (Automatically de-listed from public discovery) ──> [Archive / Transaction Log]
```

#### C. Dairy Daily Intake & Delivery Workflow
```
[Farmer Collection Gate] ──> [Log Supplier, Gross Ltr, Fat/SNF, Accepted Ltr] ──> [Stock Ledger + Inflow]
       │
       ▼
[Own Production Log] ──> [Morning/Evening Milking Inflow] ──> [Stock Ledger + Inflow]
       │
       ▼
[Daily Delivery Run] ──> [Idempotent Delivery Generation from Active Subscriptions]
       │
       ▼
[Route Execution] ──> [Delivered / Partially Delivered / Skipped] ──> [Stock Outflow & Customer Invoices]
```

### Visual Identity & Theme
- **Aesthetic Direction**: *Authentic Agricultural Trust*. Earthy, grounded, and functional. Avoids both artificial neon gradients and rustic, unpolished amateur styles.
- **Color Discipline (60-30-10 Rule)**:
  - **60% Dominant Canvas**: Clean warm parchment (`#FAF8F5`) for public pages, crisp neutral slate-50 (`#F8FAFC`) for admin workspace.
  - **30% Structural Surfaces**: Deep forest hunter green (`#1E3A2F` / `#142921`) for high-contrast headers, dark footers, and card borders; clean white (`#FFFFFF`) for elevated cards and data sheets.
  - **10% Intent Accents**: Warm mustard amber (`#D97706` / `#B45309`) and terracotta clay (`#C2410C`) for primary CTAs, availability indicators, and verified badges.
- **Typography**:
  - *Display / Headings*: **Plus Jakarta Sans** (SemiBold / Bold) for modern authority and clarity.
  - *Body Prose*: **Plus Jakarta Sans** / **DM Sans** (15px–16px, 1.6 line height).
  - *Data & Financials*: Tabular monospace figures (`tabular-nums font-mono`) for prices, milk quantities (Litres), FAT%, and outstanding balances.
- **Zero-Pill Discipline**:
  - Category and status information rendered as unboxed editorial text separated by quiet middle dots (`·`) or refined hairline containers.
  - No decorative status dots or mock telemetry tickers.

---

## 3. Key Product Decisions & Trade-Offs

### 1. Unified Full-Stack Architecture (`server.ts` + Express + Vite)
- *Chosen Approach*: Single repository with Express handling API endpoints (`/api/*`) and serving Vite's dev middleware in development and static bundle in production.
- *Why*: Gives full server-side capability (validation, file handling, transactional integrity) while remaining zero-hassle to run locally with `npm run dev` or deploy to Google Cloud Run.
- *Alternatives Considered*: Pure client SPA with mocked browser storage was rejected because user explicitly requested a deployable, full-stack codebase matching standard production conventions.

### 2. Livestock Ownership Separation (Owned vs Brokerage)
- *Chosen Approach*: Animal entity models explicit `ownershipType` (`OWNED` vs `BROKERAGE`). For brokerage animals, the original farmer/seller contact, agreed commission structure (% or fixed ₹/head), and settlement status are tracked independently of the sale price.
- *Why*: Indian cattle trading relies heavily on reputable brokers who facilitate physical inspection without taking balance-sheet ownership of the cattle.

### 3. Strict Finite State Lifecycle for Livestock Listings
- *Chosen Approach*: `DRAFT` $\to$ `AVAILABLE` $\to$ `RESERVED` $\to$ `SOLD` $\to$ `ARCHIVED`. Transitions are enforced by domain rules: sold animals are immediately removed from public queries, and reservation cancellations require explicit release notes.
- *Why*: Eliminates phantom inventory where sold animals linger on websites, misleading traveling buyers.

### 4. Idempotent Dairy Delivery Engine
- *Chosen Approach*: Delivery generation uses a deterministic compound key (`subscriptionId` + `deliveryDate`). Running generation multiple times for the same morning never creates duplicate delivery entries.
- *Why*: Protects milk boys and delivery managers from double-dispatching milk or double-billing household accounts.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT APPLICATION                              │
│                                                                        │
│  ┌──────────────────────────────┐   ┌───────────────────────────────┐  │
│  │     Public Storefront        │   │    Admin Operations Suite     │  │
│  │  - TopBar & Navigation       │   │  - Auth Guard & Role Switcher │  │
│  │  - Hero & Trust Proof        │   │  - Livestock Inventory Grid   │  │
│  │  - Filterable Animal Catalog │   │  - Animal Intake & Edit Modal │  │
│  │  - Animal Detail View        │   │  - Brokerage & Sale Registry  │  │
│  │  - Dairy Subscription Info   │   │  - Dairy Stock & Deliveries   │  │
│  │  - WhatsApp Enquiry Engine   │   │  - Shared Contacts Directory  │  │
│  └──────────────┬───────────────┘   └──────────────┬────────────────┘  │
│                 │                                  │                   │
│                 └─────────────────┬────────────────┘                   │
│                                   ▼                                    │
│                 ┌──────────────────────────────────┐                   │
│                 │      Type-Safe API Client        │                   │
│                 │       (React Hooks & SWR)        │                   │
│                 └─────────────────┬────────────────┘                   │
└───────────────────────────────────┼────────────────────────────────────┘
                                    │ HTTP Fetch (/api/*)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      EXPRESS BACKEND (server.ts)                       │
│                                                                        │
│  ┌──────────────────────────────┐   ┌───────────────────────────────┐  │
│  │   Vite Dev Middleware (HMR)  │   │     Security & Auth Filter    │  │
│  └──────────────────────────────┘   └──────────────┬────────────────┘  │
│                                                    ▼                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                       API Route Controllers                      │  │
│  │  /api/livestock   /api/dairy   /api/contacts   /api/reports      │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
│                                    ▼                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      Modular Domain Services                     │  │
│  │  - LivestockService: filtering, price ranges, status transitions │  │
│  │  - DairyService: production, collection, stock ledger balance    │  │
│  │  - DeliveryService: idempotent daily run generation              │  │
│  │  - FinancialService: customer/supplier ledger & allocations      │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
│                                    ▼                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │               Data Repository / Persistence Layer                │  │
│  │  - In-memory seeded database with mock persistence               │  │
│  │  - Prisma/MySQL schema definition ready for production DB         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Core Domain Entities

```typescript
// 1. Livestock Domain
interface Animal {
  id: string;                    // e.g. "PK-COW-101"
  species: 'COW' | 'BUFFALO';
  breed: string;                 // e.g. "Sahiwal", "Murrah", "Gir"
  gender: 'FEMALE' | 'MALE';
  ageYears: number;
  lactationNumber?: number;      // 1st, 2nd, 3rd lactation
  calvingStatus?: string;        // "Calved 15 days ago", "Pregnant 4 months"
  reportedMilkYieldLpd?: number; // Litres per day (e.g. 16.5)
  ownershipType: 'OWNED' | 'BROKERAGE';
  brokerageDetails?: {
    sellerContactId: string;
    expectedCommission: number;
    commissionType: 'FIXED' | 'PERCENTAGE';
  };
  healthStatus: 'HEALTHY' | 'UNDER_TREATMENT';
  images: Array<{ url: string; isPrimary: boolean; alt: string }>;
  listing: {
    status: 'DRAFT' | 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'ARCHIVED';
    priceMin: number;
    priceMax: number;
    currency: 'INR';
    location: string;
    description: string;
    publishedAt?: string;
  };
}

// 2. Dairy Operations Domain
interface MilkCollectionEntry {
  id: string;
  supplierId: string;
  timestamp: string;
  shift: 'MORNING' | 'EVENING';
  grossQuantityLtr: number;
  acceptedQuantityLtr: number;
  rejectedQuantityLtr: number;
  fatPercentage?: number;
  snfPercentage?: number;
  ratePerLitre: number;
  totalCost: number;
  paymentStatus: 'PENDING' | 'PAID';
}

interface MilkDelivery {
  id: string;
  subscriptionId: string;
  customerId: string;
  deliveryDate: string;          // YYYY-MM-DD
  scheduledQuantityLtr: number;
  actualDeliveredQuantityLtr: number;
  status: 'PLANNED' | 'PREPARED' | 'DISPATCHED' | 'DELIVERED' | 'PARTIAL' | 'SKIPPED' | 'FAILED';
  skipReason?: string;
}
```

### Interactive Component & State Mapping

| Component View | User Interaction | State Transition & Handler |
| :--- | :--- | :--- |
| **Public Livestock Catalog** | Select Breed / Price / Milk Yield Filter | Instant client-side memoized filter or URL search query update. |
| **Animal Detail View** | Click "Enquire via WhatsApp" | Synthesizes listing ID, breed, and direct inquiry link formatted for official business WhatsApp number. |
| **Admin Animal Intake** | Submit New Animal Form | Validates fields via Zod, checks min $\le$ max price, posts to `/api/livestock`, emits audit entry, refreshes table. |
| **Listing Status Action** | Mark Reserved / Completed Sale | Opens modal for buyer name, agreed price & deposit. Updates listing status, transitions to `RESERVED` or `SOLD`. |
| **Dairy Collection Entry** | Enter Gross Litres & Quality (Fat/SNF) | Computes accepted volume and calculated payout in real time, logs stock movement. |
| **Delivery Run Manager** | Click "Generate Morning Deliveries" | Executes idempotent subscription query for selected date, populates driver checklist. |
| **Role Switcher** | Toggle "Owner" / "Manager" / "Public" | Switches active context and UI privilege level instantly across navigation and action buttons. |

---

## 5. Verification & Implementation Roadmap

1. **Phase 0 & 1**: Setup full-stack structure (`server.ts` Express + Vite middleware), business configuration (`Purvanchal Dairy & Pashu Kendra`), domain models, and public storefront with catalog & filters.
2. **Phase 2 & 3**: Admin workspace with role guard, livestock inventory table, animal creation/editing forms, status lifecycle transitions, and brokerage settlement tracking.
3. **Phase 4 & 5**: Dairy foundation (milk collection register, own production logs, stock ledger reconciliation, subscriptions, and daily delivery runs).
4. **Phase 6 & 7**: Financial ledger (customer receipts, supplier payables), operational dashboard with real-time KPI metrics, and complete compilation verification.
