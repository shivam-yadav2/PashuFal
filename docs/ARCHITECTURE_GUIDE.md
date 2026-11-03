# Purvanchal Dairy & Pashu Kendra — Architecture & Operations Guide

> **Organization**: Champa Dairy & Pashu Kendra  
> **Steward**: Parmeshwar Kushwaha  
> **Operational Base**: Khardaha Nilkanth, Lar, Deoria, Uttar Pradesh  
> **System Scope**: B2C/B2B Cattle Marketplace + Dairy Processing & Delivery ERP

---

## 1. System Architectural Topology

```text
               +--------------------------------------------+
               |        Client Web Application (SPA)        |
               |      React 19 + TypeScript + Tailwind 4    |
               +--------------------------------------------+
                                     |
                          REST API HTTP Requests
                                     |
               +--------------------------------------------+
               |        Backend Application Server          |
               |       Node.js 20+ Express Full-Stack       |
               +--------------------------------------------+
                    |                                  |
         Database Connection Pool             In-Memory Fallback
              (mysql2/promise)                  (mockDb Store)
                    |                                  |
   +---------------------------------+  +-------------------------------+
   |   Production MySQL 8.0 Engine   |  | Local / Dev Fallback Store    |
   |   - 16 Relational Tables        |  | (Activated if MySQL offline)  |
   |   - Foreign Keys & Constraints  |  +-------------------------------+
   |   - InnoDB utf8mb4 Engine       |
   +---------------------------------+
```

---

## 2. Core Business Workflows

### 2.1 The 9-Stage Cattle Order Lifecycle

```text
[1. New Enquiry]
       │
       ▼
[2. Contacted] ────────── Customer verified via phone/WhatsApp (+91 97928 20684)
       │
       ▼
[3. Requirement Confirmed] ── Specific animal or bulk herd (5–50+ head) locked
       │
       ▼
[4. Quotation Sent] ───── Animal unit price + vehicle route transit cost estimated
       │
       ▼
[5. Order Confirmed] ──── 10–20% token deposit received via Cash or UPI
       │
       ▼
[6. Veterinary Check] ─── Health check, deworming & fitness certificate at Lar Vet Hospital
       │
       ▼
[7. Transport Arranged] ─ Straw-bedded carrier assigned with driver details
       │
       ▼
[8. Dispatched] ───────── En route to customer's farm shed
       │
       ▼
[9. Delivered] ────────── Physical handover, live milk check, remaining balance settled
```

### 2.2 Live Dohai (Two-Time Milking Verification) Protocol
To prevent buyer disputes and build long-term generational trust:
1. **Morning Dohai**: Conducted between **4:30 AM and 7:00 AM**. The animal is milked into a clean steel pail directly in the customer's presence.
2. **Evening Dohai**: Conducted between **4:30 PM and 7:00 PM** (12-hour interval).
3. **Yield Certification**: Both morning and evening weights/litres are recorded on the animal's physical docket and updated in the system (`yield_verification_date` and `reported_milk_yield_lpd`).
4. **Token Policy**: No non-refundable advance is demanded until the customer has verified the live milking.

### 2.3 Safe Animal Transit Protocol
- **Authorized Areas**:
  - Entire Deoria District (Lar, Salempur, Bhatpar Rani, Deoria Sadar, Barhaj, Rudrapur).
  - Gorakhpur (GKP) metropolitan and rural dairy farms.
  - Neighboring Bihar border areas (Siwan, Gopalganj).
  - Pan-India multi-animal container logistics for commercial farms.
- **Vehicle Preparation**: Clean straw bedding (पुआल), non-slip rubber mats, partitions for lactating mothers with calves, and onboard water troughs.
- **Documentation**: Official transit fitness certificate from veterinary officer (पशु चिकित्साधिकारी) in Lar.

---

## 3. Daily Dairy Management Workflow

```text
Morning Shift (4:30 AM - 7:30 AM)
 ├── 1. Farm Herd Milking -> Recorded in `milk_production_entries`
 ├── 2. Supplier Village Intake -> Tested for Fat/SNF in `milk_collection_entries`
 ├── 3. Stock Aggregation -> Inflow logged in `milk_inventory_movements`
 └── 4. Doorstep Delivery Run -> Executed via `milk_deliveries`

Midday Reconciliation
 └── Automated check: Total Litres Received = Total Litres Dispatched + Stored Inventory

Evening Shift (4:30 PM - 7:30 PM)
 ├── 1. Second Herd Milking & Supplier Collection
 └── 2. Evening Delivery Run to Sweet Shops, Hotels & Subscribed Families
```

---

## 4. Admin Role-Based Access Control (RBAC)

| Role | Permissions |
|---|---|
| **OWNER** (Parmeshwar Kushwaha) | Complete unrestricted access: Price adjustments, reservation releases, financial ledger, audit logs, user management. |
| **MANAGER** (Farm Manager) | Cattle inventory updates, enquiry quotation submissions, vet check confirmations, daily milk logging, delivery dispatch. |
| **STAFF** (Delivery & Stable Crew) | Daily delivery run status updates (`DELIVERED`/`SKIPPED`), daily milking quantity entries. |

---

## 5. Production Deployment Best Practices

### 5.1 Systemd Service (Linux Server)
Create `/etc/systemd/system/purvanchal-dairy.service`:

```ini
[Unit]
Description=Purvanchal Dairy & Pashu Kendra Application
After=network.target mysql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/var/www/purvanchal-dairy
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=MYSQL_HOST=localhost
Environment=MYSQL_PORT=3306
Environment=MYSQL_USER=purvanchal_user
Environment=MYSQL_PASSWORD=strong_password_here
Environment=MYSQL_DATABASE=purvanchal_dairy

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable purvanchal-dairy
sudo systemctl start purvanchal-dairy
```

### 5.2 Nginx Reverse Proxy with HTTPS
```nginx
server {
    server_name dairy.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 80;
}
```
Install SSL via Certbot:
```bash
sudo certbot --nginx -d dairy.yourdomain.com
```
