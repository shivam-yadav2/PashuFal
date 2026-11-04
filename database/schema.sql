-- ============================================================================
-- Purvanchal Dairy & Pashu Kendra (Champa Dairy) — Production MySQL Schema
-- Location: Khardaha Nilkanth, Lar, Deoria, Uttar Pradesh
-- Steward: Parmeshwar Kushwaha | Brand: Dadi Champa Dairy
-- Dialect: MySQL 8.0+ / MariaDB 10.5+
-- Charset: utf8mb4 / Collation: utf8mb4_unicode_ci
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Contacts Directory (Buyers, Sellers, Dairy Customers, Milk Suppliers)
DROP TABLE IF EXISTS contacts;
CREATE TABLE contacts (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    whatsapp VARCHAR(32) NULL,
    location VARCHAR(255) NOT NULL,
    roles JSON NOT NULL COMMENT 'Array: ["LIVESTOCK_BUYER","LIVESTOCK_SELLER","DAIRY_CUSTOMER","MILK_SUPPLIER","BULK_BUYER"]',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_contacts_phone (phone),
    INDEX idx_contacts_active (active),
    INDEX idx_contacts_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Livestock Master (Animal Biological & Provenance Data)
DROP TABLE IF EXISTS animals;
CREATE TABLE animals (
    id VARCHAR(64) PRIMARY KEY,
    tag_number VARCHAR(64) NOT NULL UNIQUE,
    species ENUM('COW', 'BUFFALO') NOT NULL,
    breed VARCHAR(100) NOT NULL,
    gender ENUM('FEMALE', 'MALE') NOT NULL DEFAULT 'FEMALE',
    age_years INT NOT NULL,
    age_months INT NOT NULL DEFAULT 0,
    lactation_number INT NOT NULL DEFAULT 1,
    calving_details VARCHAR(255) NULL,
    pregnancy_status VARCHAR(100) NULL,
    reported_milk_yield_lpd DECIMAL(5,2) NULL COMMENT 'Litres per day',
    milk_yield_unit ENUM('LPD', 'LITRES_PER_DAY') NOT NULL DEFAULT 'LPD',
    yield_verification_date DATE NULL,
    yield_verification_status ENUM('VERIFIED_ON_FARM', 'SELLER_DECLARED') NOT NULL DEFAULT 'VERIFIED_ON_FARM',
    has_veterinary_check BOOLEAN NOT NULL DEFAULT FALSE,
    veterinary_notes TEXT NULL,
    ownership_type ENUM('OWNED', 'BROKERAGE') NOT NULL DEFAULT 'OWNED',
    seller_contact_id VARCHAR(64) NULL,
    brokerage_commission DECIMAL(10,2) NULL DEFAULT 0.00,
    internal_notes TEXT NULL,
    health_notes TEXT NULL,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_animals_seller FOREIGN KEY (seller_contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
    INDEX idx_animals_species (species),
    INDEX idx_animals_breed (breed),
    INDEX idx_animals_tag (tag_number),
    INDEX idx_animals_ownership (ownership_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Livestock Marketplace Listings (Public View & Price Controls)
DROP TABLE IF EXISTS animal_listings;
CREATE TABLE animal_listings (
    id VARCHAR(64) PRIMARY KEY,
    animal_id VARCHAR(64) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price_min DECIMAL(12,2) NOT NULL,
    price_max DECIMAL(12,2) NOT NULL,
    contact_for_price BOOLEAN NOT NULL DEFAULT FALSE,
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    status ENUM('DRAFT', 'AVAILABLE', 'RESERVED', 'SOLD', 'ARCHIVED') NOT NULL DEFAULT 'AVAILABLE',
    location VARCHAR(255) NOT NULL DEFAULT 'Khardaha Nilkanth, Lar, Deoria',
    published_at TIMESTAMP NULL,
    last_verified_at DATE NOT NULL,
    reservation_deposit DECIMAL(10,2) NULL,
    reserved_for_contact_id VARCHAR(64) NULL,
    reserved_at TIMESTAMP NULL,
    sold_price DECIMAL(12,2) NULL,
    sold_to_contact_id VARCHAR(64) NULL,
    sold_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_listings_animal FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE,
    CONSTRAINT fk_listings_reserved_contact FOREIGN KEY (reserved_for_contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
    CONSTRAINT fk_listings_sold_contact FOREIGN KEY (sold_to_contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
    INDEX idx_listings_status (status),
    INDEX idx_listings_price (price_min, price_max),
    INDEX idx_listings_last_verified (last_verified_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Animal Photos & Media Gallery
DROP TABLE IF EXISTS animal_media;
CREATE TABLE animal_media (
    id VARCHAR(64) PRIMARY KEY,
    animal_id VARCHAR(64) NOT NULL,
    url VARCHAR(512) NOT NULL,
    video_url VARCHAR(512) NULL,
    display_order INT NOT NULL DEFAULT 1,
    alt_text VARCHAR(255) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_media_animal FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE,
    INDEX idx_media_animal_order (animal_id, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Customer Enquiries & Bulk Farm Purchase Requests
DROP TABLE IF EXISTS enquiries;
CREATE TABLE enquiries (
    id VARCHAR(64) PRIMARY KEY,
    customer_name VARCHAR(191) NOT NULL,
    contact_person VARCHAR(191) NULL,
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(191) NULL,
    location VARCHAR(255) NOT NULL,
    enquiry_type ENUM('INDIVIDUAL', 'BULK_COMMERCIAL', 'TRANSPORT_INQUIRY', 'INSPECTION_REQUEST') NOT NULL DEFAULT 'INDIVIDUAL',
    animal_id VARCHAR(64) NULL,
    animal_type ENUM('BUFFALO', 'COW', 'ANY') NOT NULL DEFAULT 'BUFFALO',
    preferred_breed VARCHAR(100) NULL,
    requested_quantity INT NOT NULL DEFAULT 1,
    preferred_milk_yield VARCHAR(100) NULL,
    budget_per_animal DECIMAL(12,2) NULL,
    total_budget DECIMAL(12,2) NULL,
    delivery_location VARCHAR(255) NOT NULL,
    required_delivery_date DATE NULL,
    additional_instructions TEXT NULL,
    status ENUM(
        'NEW_ENQUIRY',
        'CONTACTED',
        'REQUIREMENT_CONFIRMED',
        'QUOTATION_SENT',
        'NEGOTIATION',
        'AWAITING_BUYER_CONFIRMATION',
        'ORDER_CONFIRMED',
        'VETERINARY_CHECK',
        'TRANSPORT_ARRANGED',
        'DISPATCHED',
        'DELIVERED',
        'CANCELLED',
        'CLOSED'
    ) NOT NULL DEFAULT 'NEW_ENQUIRY',
    assigned_staff VARCHAR(100) NULL,
    quotation_amount DECIMAL(12,2) NULL,
    transport_quotation DECIMAL(10,2) NULL,
    quotation_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_enquiries_animal FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE SET NULL,
    INDEX idx_enquiries_status (status),
    INDEX idx_enquiries_phone (phone),
    INDEX idx_enquiries_type (enquiry_type),
    INDEX idx_enquiries_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Confirmed Livestock Orders & Delivery Fulfillment
DROP TABLE IF EXISTS livestock_orders;
CREATE TABLE livestock_orders (
    id VARCHAR(64) PRIMARY KEY,
    enquiry_id VARCHAR(64) NULL,
    customer_name VARCHAR(191) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    delivery_address TEXT NOT NULL,
    agreed_price DECIMAL(12,2) NOT NULL,
    transport_quote DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL,
    payment_status ENUM('PENDING', 'PARTIAL_ADVANCE', 'PAID_IN_FULL') NOT NULL DEFAULT 'PENDING',
    advance_amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    veterinary_check_passed BOOLEAN NOT NULL DEFAULT FALSE,
    delivery_status ENUM('PENDING_VET', 'VET_PASSED', 'TRANSPORT_ASSIGNED', 'DISPATCHED', 'DELIVERED') NOT NULL DEFAULT 'PENDING_VET',
    order_status ENUM(
        'NEW_ENQUIRY',
        'ORDER_CONFIRMED',
        'VETERINARY_CHECK',
        'TRANSPORT_ARRANGED',
        'DISPATCHED',
        'DELIVERED',
        'CANCELLED'
    ) NOT NULL DEFAULT 'ORDER_CONFIRMED',
    transporter_details VARCHAR(255) NULL,
    dispatch_date DATE NULL,
    delivery_date DATE NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_enquiry FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE SET NULL,
    INDEX idx_orders_phone (phone),
    INDEX idx_orders_status (order_status),
    INDEX idx_orders_delivery_status (delivery_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Order-to-Animal Junction (Supports multi-animal bulk orders)
DROP TABLE IF EXISTS order_animals;
CREATE TABLE order_animals (
    order_id VARCHAR(64) NOT NULL,
    animal_id VARCHAR(64) NOT NULL,
    assigned_price DECIMAL(12,2) NULL,
    PRIMARY KEY (order_id, animal_id),
    CONSTRAINT fk_order_animals_order FOREIGN KEY (order_id) REFERENCES livestock_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_animals_animal FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Livestock Sales & Financial Transactions
DROP TABLE IF EXISTS livestock_transactions;
CREATE TABLE livestock_transactions (
    id VARCHAR(64) PRIMARY KEY,
    animal_id VARCHAR(64) NOT NULL,
    listing_reference_title VARCHAR(255) NOT NULL,
    buyer_contact_id VARCHAR(64) NOT NULL,
    seller_contact_id VARCHAR(64) NULL,
    ownership_type ENUM('OWNED', 'BROKERAGE') NOT NULL,
    agreed_price DECIMAL(12,2) NOT NULL,
    commission_amount DECIMAL(10,2) NULL DEFAULT 0.00,
    commission_settled BOOLEAN NOT NULL DEFAULT FALSE,
    sale_date DATE NOT NULL,
    status ENUM('PENDING_DELIVERY', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING_DELIVERY',
    amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    outstanding_balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    notes TEXT NULL,
    recorded_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_txns_animal FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE RESTRICT,
    CONSTRAINT fk_txns_buyer FOREIGN KEY (buyer_contact_id) REFERENCES contacts(id) ON DELETE RESTRICT,
    CONSTRAINT fk_txns_seller FOREIGN KEY (seller_contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
    INDEX idx_txns_sale_date (sale_date),
    INDEX idx_txns_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Daily Farm Herd Milk Production Entries
DROP TABLE IF EXISTS milk_production_entries;
CREATE TABLE milk_production_entries (
    id VARCHAR(64) PRIMARY KEY,
    business_date DATE NOT NULL,
    shift ENUM('MORNING', 'EVENING') NOT NULL,
    herd_source VARCHAR(100) NOT NULL DEFAULT 'Lar Farm Owned Herd',
    quantity_litres DECIMAL(8,2) NOT NULL,
    recorded_by VARCHAR(100) NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_prod_date_shift (business_date, shift)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Milk Collection from Local Rural Suppliers (Lar & Nearby Villages)
DROP TABLE IF EXISTS milk_collection_entries;
CREATE TABLE milk_collection_entries (
    id VARCHAR(64) PRIMARY KEY,
    supplier_contact_id VARCHAR(64) NOT NULL,
    business_date DATE NOT NULL,
    shift ENUM('MORNING', 'EVENING') NOT NULL,
    product_type ENUM('BUFFALO_MILK', 'COW_MILK', 'MIXED_MILK') NOT NULL DEFAULT 'BUFFALO_MILK',
    gross_litres_received DECIMAL(8,2) NOT NULL,
    accepted_litres DECIMAL(8,2) NOT NULL,
    rejected_litres DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    rejection_reason VARCHAR(255) NULL,
    fat_percentage DECIMAL(4,2) NULL COMMENT 'Murrah buffalo target 6.5 - 8.5%',
    snf_percentage DECIMAL(4,2) NULL,
    purchase_rate_per_litre DECIMAL(6,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    payment_status ENUM('PENDING', 'PAID', 'PARTIALLY_PAID') NOT NULL DEFAULT 'PENDING',
    recorded_by VARCHAR(100) NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_collection_supplier FOREIGN KEY (supplier_contact_id) REFERENCES contacts(id) ON DELETE RESTRICT,
    INDEX idx_collection_date_shift (business_date, shift),
    INDEX idx_collection_supplier (supplier_contact_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Milk Inventory Daily Ledger & Stock Reconciliation
DROP TABLE IF EXISTS milk_inventory_movements;
CREATE TABLE milk_inventory_movements (
    id VARCHAR(64) PRIMARY KEY,
    business_date DATE NOT NULL,
    product_type ENUM('BUFFALO_MILK', 'COW_MILK', 'MIXED_MILK') NOT NULL DEFAULT 'BUFFALO_MILK',
    movement_type ENUM(
        'OPENING_STOCK',
        'OWN_PRODUCTION',
        'PURCHASED_ACCEPTED',
        'RETAIL_DELIVERY',
        'BULK_SALE',
        'WASTE_SPOILAGE',
        'AUTHORIZED_ADJUSTMENT'
    ) NOT NULL,
    direction ENUM('INFLOW', 'OUTFLOW') NOT NULL,
    quantity_litres DECIMAL(8,2) NOT NULL,
    source_record_id VARCHAR(64) NULL,
    notes TEXT NULL,
    recorded_by VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_movements_date (business_date),
    INDEX idx_movements_type (movement_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Retail & Commercial Milk Delivery Subscriptions
DROP TABLE IF EXISTS delivery_subscriptions;
CREATE TABLE delivery_subscriptions (
    id VARCHAR(64) PRIMARY KEY,
    customer_contact_id VARCHAR(64) NOT NULL,
    product_type ENUM('BUFFALO_MILK', 'COW_MILK', 'MIXED_MILK') NOT NULL DEFAULT 'BUFFALO_MILK',
    quantity_litres DECIMAL(6,2) NOT NULL,
    shift ENUM('MORNING', 'EVENING') NOT NULL DEFAULT 'MORNING',
    rate_per_litre DECIMAL(6,2) NOT NULL,
    billing_preference ENUM('MONTHLY', 'WEEKLY', 'PREPAID') NOT NULL DEFAULT 'MONTHLY',
    delivery_instructions TEXT NULL,
    status ENUM('ACTIVE', 'PAUSED', 'ENDED') NOT NULL DEFAULT 'ACTIVE',
    start_date DATE NOT NULL,
    pause_until_date DATE NULL,
    end_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_subscriptions_customer FOREIGN KEY (customer_contact_id) REFERENCES contacts(id) ON DELETE RESTRICT,
    INDEX idx_subs_customer (customer_contact_id),
    INDEX idx_subs_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Daily Doorstep Milk Delivery Runs
DROP TABLE IF EXISTS milk_deliveries;
CREATE TABLE milk_deliveries (
    id VARCHAR(64) PRIMARY KEY,
    business_date DATE NOT NULL,
    subscription_id VARCHAR(64) NOT NULL,
    customer_contact_id VARCHAR(64) NOT NULL,
    product_type ENUM('BUFFALO_MILK', 'COW_MILK', 'MIXED_MILK') NOT NULL DEFAULT 'BUFFALO_MILK',
    shift ENUM('MORNING', 'EVENING') NOT NULL,
    scheduled_quantity_litres DECIMAL(6,2) NOT NULL,
    actual_delivered_litres DECIMAL(6,2) NOT NULL,
    rate_per_litre DECIMAL(6,2) NOT NULL,
    total_billed_amount DECIMAL(10,2) NOT NULL,
    status ENUM(
        'PLANNED',
        'PREPARED',
        'DISPATCHED',
        'DELIVERED',
        'PARTIALLY_DELIVERED',
        'SKIPPED',
        'FAILED'
    ) NOT NULL DEFAULT 'PLANNED',
    skip_or_failure_reason VARCHAR(255) NULL,
    delivery_notes TEXT NULL,
    delivered_at TIMESTAMP NULL,
    recorded_by VARCHAR(100) NOT NULL,
    CONSTRAINT fk_deliveries_sub FOREIGN KEY (subscription_id) REFERENCES delivery_subscriptions(id) ON DELETE CASCADE,
    CONSTRAINT fk_deliveries_customer FOREIGN KEY (customer_contact_id) REFERENCES contacts(id) ON DELETE RESTRICT,
    INDEX idx_deliveries_date_shift (business_date, shift),
    INDEX idx_deliveries_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Financial Receipts & Disbursements Ledger (Cash / UPI / Bank)
DROP TABLE IF EXISTS payments;
CREATE TABLE payments (
    id VARCHAR(64) PRIMARY KEY,
    direction ENUM('CUSTOMER_RECEIPT', 'SUPPLIER_PAYMENT') NOT NULL,
    contact_id VARCHAR(64) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    payment_method ENUM('CASH', 'UPI', 'BANK_TRANSFER') NOT NULL DEFAULT 'UPI',
    transaction_date DATE NOT NULL,
    reference_number VARCHAR(100) NULL,
    notes TEXT NULL,
    status ENUM('POSTED', 'REVERSED') NOT NULL DEFAULT 'POSTED',
    recorded_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_contact FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE RESTRICT,
    INDEX idx_payments_date (transaction_date),
    INDEX idx_payments_contact (contact_id),
    INDEX idx_payments_direction (direction)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Operational Audit Trail (Compliance & Fraud Prevention)
DROP TABLE IF EXISTS audit_logs;
CREATE TABLE audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    actor VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type ENUM(
        'ANIMAL',
        'LISTING',
        'COLLECTION',
        'PRODUCTION',
        'DELIVERY',
        'PAYMENT',
        'SUBSCRIPTION',
        'ENQUIRY',
        'ORDER'
    ) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT NOT NULL,
    INDEX idx_audit_timestamp (timestamp),
    INDEX idx_audit_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Admin & Staff Credentials
DROP TABLE IF EXISTS admin_users;
CREATE TABLE admin_users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(191) NOT NULL,
    role ENUM('OWNER', 'MANAGER', 'STAFF') NOT NULL DEFAULT 'STAFF',
    phone VARCHAR(32) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Admin-editable Site Settings (business info, contact, homepage content, SMTP)
DROP TABLE IF EXISTS site_settings;
CREATE TABLE site_settings (
    setting_key VARCHAR(64) PRIMARY KEY,
    setting_value LONGTEXT NOT NULL COMMENT 'JSON document',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
