# Purvanchal Dairy & Pashu Kendra (चम्पा डेयरी एवं पशु केंद्र)

> **B2C & B2B Online Livestock Marketplace and Comprehensive Dairy Management ERP**  
> Operating in honor of **Dadi Champa**, stewarded by **Parmeshwar Kushwaha**  
> **Headquarters**: Khardaha Nilkanth, Lar, Deoria, Uttar Pradesh (PIN: 274502)  
> **Direct Helpline & WhatsApp**: +91 97928 20684  
> **Service Coverage**: Whole Deoria District, Gorakhpur (GKP), and East Uttar Pradesh & Bihar borders.

---

## 📌 Table of Contents
1. [Overview & Product Vision](#-overview--product-vision)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [Project Directory Structure](#-project-directory-structure)
5. [Local Development Setup (Step-by-Step)](#-local-development-setup-step-by-step)
6. [MySQL Database Setup](#-mysql-database-setup)
7. [Environment Variables (.env)](#-environment-variables-env)
8. [API Endpoints Reference](#-api-endpoints-reference)
9. [Production Build & Deployment](#-production-build--deployment)
10. [Documentation Links](#-documentation-links)

---

## 🌟 Overview & Product Vision

**Purvanchal Dairy & Pashu Kendra** is a hybrid livestock marketplace and dairy operations platform designed to solve the real problems faced by cattle buyers and commercial dairy farm owners:
1. **Live Milking Verification (दोहाई जांच)**: Elimination of fraudulent milk yield claims by mandating a 2-time morning and evening live pail milking inspection before sale.
2. **Pedigree & Veterinary Transparency**: Certified Murrah buffaloes and Vedic dairy cows with government veterinary fitness certificates from Lar Veterinary Hospital.
3. **Safe Animal Transportation**: Specialized straw-bedded vehicles equipped with water troughs and transit permits across Deoria, Gorakhpur, and Pan-India.
4. **Commercial Bulk Procurement**: Custom herd sourcing for dairy farms (5, 10, 20, 50+ cattle) with volume pricing and phased dispatch.
5. **Integrated Dairy Operations ERP**: Real-time morning/evening herd milk logging, village milk collection, retail doorstep delivery subscriptions, and cash/UPI financial reconciliations.

---

## ✨ Key Features

### 🛍️ Public Cattle Marketplace & Customer Portal
- **Cinematic Pastoral Hero**: Real-world pasture visuals with carousel navigation and flowing organic milk wave divider.
- **Murrah Buffalo & Cow Catalog**: Filter by species (`BUFFALO` / `COW`), breed, price range, daily milk yield (LPD), and lactation stage.
- **Transparent Animal Detail**: Real photos, age, lactation history, ear tag number, pregnancy status, and direct WhatsApp / call inquiry buttons.
- **Bulk Order Sourcing**: Dedicated form for dairy farm entrepreneurs specifying quantity (5–50+), target yield, and delivery timeline.
- **Doorstep Safe Transport Calculator**: Route and carrier quotations for Deoria, Gorakhpur, and Bihar borders.
- **Bilingual Support**: Instant toggle between Hindi (हिंदी) and English.

### 📊 Admin Operations & ERP Dashboard
- **Livestock Inventory Management**: Add, update, reserve, release, or mark cattle as sold.
- **Order & Enquiry Lifecycle Tracking**: 9-stage workflow (`New Enquiry` ➔ `Contacted` ➔ `Quotation Sent` ➔ `Order Confirmed` ➔ `Vet Check` ➔ `Transport Arranged` ➔ `Dispatched` ➔ `Delivered`).
- **Daily Milk Production Log**: Morning & evening shift milk yield tracking.
- **Supplier Milk Collection**: Fat %, SNF %, rate calculation, accepted vs. rejected litres.
- **Daily Milk Reconciliation**: Automatic balance calculation (`Inflow - Outflow = Stock`).
- **Doorstep Delivery Subscriptions**: Morning/evening household milk subscription runs.
- **Financial Ledger**: Cash, UPI, and bank transfer receipts and payouts.
- **Audit Log**: Immutable compliance trail of all farm operations.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
|---|---|---|
| **Frontend Framework** | **React 19** + **Vite 8** | Ultra-fast SPA with functional components & custom hooks |
| **Language** | **TypeScript 5.8+** | Strict typing across client, server, and database models |
| **Styling** | **Tailwind CSS 4** | Emerald-900 & Amber-300 palette, modern responsive layout |
| **Backend Server** | **Node.js** + **Express 4** | Clean REST API serving both data endpoints and Vite SPA |
| **Database** | **MySQL 8.0+** / **MariaDB** | 16 relational tables with foreign keys, JSON types & indexes |
| **Database Driver** | **mysql2/promise** | High-performance connection pooling with async/await |
| **Icons & Media** | **Lucide React** + Photographic Assets | Scalable SVG icons and optimized livestock imagery |

---

## 📂 Project Directory Structure

```text
purvanchal-dairy/
├── database/                    # MySQL Database Definitions & Scripts
│   ├── schema.sql               # Complete MySQL 8.x DDL Schema (16 tables)
│   ├── seed.sql                 # Realistic initial seed data for Lar, Deoria
│   └── init-db.sh               # One-click bash script to create and seed DB
│
├── docs/                        # In-Depth Guides & Architecture
│   ├── DATABASE_GUIDE.md        # ER diagram, table dictionary, queries, backup
│   └── ARCHITECTURE_GUIDE.md    # API docs, business rules, workflows, deployment
│
├── public/                      # Static Assets (Images, Icons, Favicons)
│   └── assets/                  # High-resolution livestock & logo assets
│
├── src/
│   ├── components/              # Modular UI Components
│   │   ├── admin/               # Admin sidebar, layout, and control components
│   │   ├── layout/              # Navbar, footer, and language switchers
│   │   ├── livestock/           # AnimalCard, filters, and media displays
│   │   └── ui/                  # Reusable buttons, badges, modals, RealisticCattlePhoto
│   │
│   ├── config/
│   │   └── business.ts          # Central source of truth: Parmeshwar Kushwaha, Lar, Deoria
│   │
│   ├── context/
│   │   ├── AuthContext.tsx      # Admin authentication & role guard
│   │   └── LanguageContext.tsx  # Hindi / English bilingual dictionary
│   │
│   ├── pages/
│   │   ├── admin/               # Admin Dashboard, Livestock, Dairy, Orders, Enquiries
│   │   └── public/              # HomePage, CattleCatalog, BulkOrder, Transport, Contact
│   │
│   ├── server/
│   │   ├── db/
│   │   │   └── mysql.ts         # MySQL connection pool with auto-fallback
│   │   └── mockDb.ts            # Resilient in-memory fallback store
│   │
│   ├── services/
│   │   └── api.ts               # Client-side API fetch client
│   │
│   ├── types/
│   │   └── domain.ts            # TypeScript interfaces for all business models
│   │
│   ├── App.tsx                  # Root application router and view controller
│   ├── index.css                # Tailwind CSS 4 directives & global typography
│   └── main.tsx                 # React entry point
│
├── .env.example                 # Environment variables template
├── package.json                 # Project dependencies & npm scripts
├── server.ts                    # Full-stack Express server with Vite middleware
├── tsconfig.json                # TypeScript compiler configuration
└── vite.config.ts               # Vite configuration
```

---

## 💻 Local Development Setup (Step-by-Step)

### Step 1: Clone Repository & Install Dependencies
Make sure you have **Node.js 20+** and **npm** installed on your system.

```bash
# Clone the repository
git clone <your-repo-url>
cd purvanchal-dairy

# Install dependencies
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Open `.env` and fill in your local MySQL credentials:

```ini
PORT=3000
NODE_ENV=development

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_local_mysql_password
MYSQL_DATABASE=purvanchal_dairy
```

---

## 🗄️ MySQL Database Setup

### Option A: Automatic Setup (Recommended via bash script)
If you are on Linux, macOS, or WSL (Windows):

```bash
# Run the database initialization script
DB_USER=root DB_PASS="your_password" bash database/init-db.sh
```

### Option B: Manual Setup via MySQL CLI
1. Open your terminal and log into MySQL:
   ```bash
   mysql -u root -p
   ```
2. Create the database:
   ```sql
   CREATE DATABASE purvanchal_dairy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   EXIT;
   ```
3. Run the schema and seed scripts:
   ```bash
   mysql -u root -p purvanchal_dairy < database/schema.sql
   mysql -u root -p purvanchal_dairy < database/seed.sql
   ```

### Option C: Setup via MySQL Workbench / phpMyAdmin / DBeaver
1. Open MySQL Workbench or your favorite GUI tool.
2. Open and execute `database/schema.sql`.
3. Open and execute `database/seed.sql`.

---

## 🚀 Running the Application

### Start Development Server
```bash
npm run dev
```
Open your browser and navigate to:  
👉 **`http://localhost:3000`**

### Check System & Database Health
Verify that your local MySQL connection is active by visiting:  
👉 **`http://localhost:3000/api/health`**

Response should return:
```json
{
  "status": "healthy",
  "mysql": {
    "enabled": true,
    "host": "localhost",
    "database": "purvanchal_dairy",
    "port": 3306
  },
  "location": "खरदहा नीलकंठ, लार, देवरिया (उत्तर प्रदेश)"
}
```

> **Note on Graceful Fallback**: If MySQL credentials are not supplied or the database server is offline, the app automatically runs in memory-store mode so you can continue testing without interruptions!

---

## 🔑 Default Admin Credentials

To access the Admin Portal (`/admin`):
- **URL**: Navigate to **Admin Panel** via the top navigation bar or footer.
- **Default Username**: `admin`
- **Default Password**: `password123`
- **Owner Role**: Full access to Livestock, Enquiries, Orders, Daily Milk Logging, Subscriptions, and Financials.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System status and MySQL connection info |
| `GET` | `/api/business` | Farm details, contacts, and coverage areas |
| `GET` | `/api/livestock` | List animals with filtering (species, breed, price) |
| `GET` | `/api/livestock/:id` | Get individual animal details & media |
| `POST` | `/api/livestock` | Register a new animal in inventory |
| `POST` | `/api/livestock/:id/reserve` | Reserve cattle with token deposit |
| `POST` | `/api/livestock/:id/sell` | Complete sale and generate ledger entry |
| `GET` | `/api/enquiries` | Fetch customer enquiries & bulk RFQs |
| `POST` | `/api/enquiries` | Submit new buyer or bulk farm enquiry |
| `PATCH` | `/api/enquiries/:id/status` | Update enquiry status & send quotation |
| `GET` | `/api/orders` | List confirmed orders and transit status |
| `POST` | `/api/orders` | Convert enquiry into confirmed order |
| `GET` | `/api/dairy/production` | Fetch daily morning/evening milk production |
| `POST` | `/api/dairy/production` | Record herd milk production entry |
| `GET` | `/api/dairy/collection` | Supplier milk intake with fat % & SNF % |
| `GET` | `/api/dairy/reconciliation` | Daily stock balance & variance calculation |
| `GET` | `/api/dairy/subscriptions` | Doorstep milk delivery subscriptions |
| `GET` | `/api/finance/summary` | Net cash flow, receivables & payables |

---

## 📦 Production Build & Deployment

### Build for Production
```bash
npm run build
```
This generates the optimized client bundle in the `/dist` folder.

### Run in Production Mode
```bash
npm start
```
`server.ts` will serve the optimized production static files and mount the Express API routes.

### Production Deployment Options
- **Docker**: Containerize the app using Node.js 20 Alpine and run alongside a MySQL container.
- **PM2 on VPS (Ubuntu/Debian)**:
  ```bash
  npm run build
  pm2 start server.ts --name "purvanchal-dairy" --interpreter tsx
  pm2 save
  pm2 startup
  ```
- **Nginx Reverse Proxy**:
  Configure Nginx to reverse proxy port `80/443` to `http://localhost:3000` with SSL via Let's Encrypt.

---

## 📖 Documentation Links

For comprehensive architectural and database details, see:
- 📑 **[MySQL Database Guide](docs/DATABASE_GUIDE.md)**: Full Entity Relationship Diagram (ERD), table dictionary, and sample SQL analytics queries.
- 🏗️ **[Architecture & Operations Guide](docs/ARCHITECTURE_GUIDE.md)**: Detailed business workflows, milking test protocol, and order management.

---

**Purvanchal Dairy & Pashu Kendra**  
*Steward: Parmeshwar Kushwaha | Khardaha Nilkanth, Lar, Deoria, Uttar Pradesh*  
*Contact: +91 97928 20684*
