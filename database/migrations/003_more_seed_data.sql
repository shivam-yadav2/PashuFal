-- Additional seed data: more buffaloes/cows for the public catalogue, plus
-- richer dairy operations data (production, collection, subscriptions,
-- deliveries, payments) so the admin dashboard isn't empty on a fresh look.
-- Safe to re-run: every insert uses INSERT IGNORE against a fixed primary key.

-- ----------------- Extra contacts -----------------
INSERT IGNORE INTO contacts (id, name, phone, whatsapp, location, roles, active, notes) VALUES
('CONT-008', 'Suresh Yadav', '+91 98765 11223', '919876511223', 'Barhaj, Deoria', '["DAIRY_CUSTOMER"]', TRUE, 'Daily buffalo milk subscription for household.'),
('CONT-009', 'Ramu Prasad', '+91 97654 33110', '919765433110', 'Salempur, Deoria', '["MILK_SUPPLIER"]', TRUE, 'Evening shift milk supplier, Sahiwal herd.');

-- ----------------- More buffaloes (and a couple more cows) -----------------
INSERT IGNORE INTO animals (
    id, tag_number, species, breed, gender, age_years, age_months,
    lactation_number, calving_details, pregnancy_status, reported_milk_yield_lpd,
    milk_yield_unit, yield_verification_date, yield_verification_status,
    has_veterinary_check, veterinary_notes, ownership_type, seller_contact_id,
    brokerage_commission, internal_notes, health_notes, version
) VALUES
('PDPK-BUF-05', 'UP-DEO-5512', 'BUFFALO', 'Jaffarabadi Cross', 'FEMALE', 6, 0, 3, 'Calved 40 days ago, female calf at foot', 'Open (Milking Peak)', 20.50, 'LPD', CURDATE(), 'VERIFIED_ON_FARM', TRUE, 'Fit for transit, strong frame', 'OWNED', NULL, 0.00, 'Heavy-bodied Jaffarabadi cross, excellent fat content', 'Vaccinated, dewormed', 1),
('PDPK-BUF-06', 'UP-DEO-6633', 'BUFFALO', 'Nili Ravi', 'FEMALE', 5, 2, 2, 'Calved 25 days ago, male calf at foot', 'Open (Milking Peak)', 16.50, 'LPD', CURDATE(), 'VERIFIED_ON_FARM', TRUE, 'Udder soft, no mastitis', 'OWNED', NULL, 0.00, 'Nili Ravi genetics, calm temperament', 'Fully vaccinated', 1),
('PDPK-BUF-07', 'UP-DEO-7744', 'BUFFALO', 'Murrah', 'FEMALE', 3, 8, 1, 'First calver, calved 35 days ago', 'Open', 13.50, 'LPD', CURDATE(), 'VERIFIED_ON_FARM', TRUE, 'Young, healthy first lactation', 'OWNED', NULL, 0.00, 'Good growth potential, 2nd lactation expected higher', 'Dewormed, vitamin supplemented', 1),
('PDPK-BUF-08', 'UP-DEO-8855', 'BUFFALO', 'Desi Buffalo', 'FEMALE', 7, 0, 4, 'Calved 2 months ago, female calf', 'Open', 15.00, 'LPD', CURDATE(), 'SELLER_DECLARED', TRUE, 'Brokerage listing, high fat 8.2%', 'BROKERAGE', 'CONT-002', 2500.00, 'Farmer brokerage, high fat local buffalo', 'Sound health, verified by seller vet', 1),
('PDPK-BUF-09', 'UP-DEO-9966', 'BUFFALO', 'Murrah', 'FEMALE', 4, 6, 2, 'Calved 20 days ago, female calf at foot', 'Open (Milking Peak)', 18.50, 'LPD', CURDATE(), 'VERIFIED_ON_FARM', TRUE, 'Token advance received', 'OWNED', NULL, 0.00, 'Reserved for buyer, inspection completed', 'Veterinary fitness certificate issued', 1),
('PDPK-BUF-10', 'UP-DEO-1077', 'BUFFALO', 'Murrah', 'FEMALE', 5, 0, 3, 'Calved 18 days ago, female calf at foot', 'Milking Peak', 21.00, 'LPD', CURDATE(), 'VERIFIED_ON_FARM', TRUE, 'Top yielder of the herd currently', 'OWNED', NULL, 0.00, 'Prize buffalo, two-time dohai verified 21L', 'Excellent udder conformation', 1),
('PDPK-COW-11', 'UP-DEO-1188', 'COW', 'Sahiwal', 'FEMALE', 4, 0, 2, 'Calved 30 days ago, female calf', 'Open (Milking Peak)', 12.50, 'LPD', CURDATE(), 'VERIFIED_ON_FARM', TRUE, 'Pure Sahiwal, A2 milk', 'OWNED', NULL, 0.00, 'Heat-tolerant, disease resistant breed', 'Healthy, gentle temperament', 1),
('PDPK-COW-12', 'UP-DEO-1299', 'COW', 'HF Cross', 'FEMALE', 5, 0, 3, 'Calved 2 months ago, male calf', 'Open', 17.00, 'LPD', CURDATE(), 'VERIFIED_ON_FARM', TRUE, 'Sold and dispatched', 'OWNED', NULL, 0.00, 'High volume HF cross, sold to repeat buyer', 'Fitness certificate issued pre-sale', 2);

INSERT IGNORE INTO animal_listings (
    id, animal_id, title, description, price_min, price_max, contact_for_price,
    currency, status, location, published_at, last_verified_at,
    reservation_deposit, reserved_for_contact_id, reserved_at,
    sold_price, sold_to_contact_id, sold_at
) VALUES
('LIST-005', 'PDPK-BUF-05', 'Jaffarabadi Cross Buffalo (20.5 L/Day, High Fat)', 'Heavy-bodied Jaffarabadi cross buffalo with excellent fat content, ideal for ghee and sweet-making businesses. Two-time dohai inspection welcome.', 150000.00, 165000.00, FALSE, 'INR', 'AVAILABLE', 'Khardaha Nilkanth, Lar, Deoria', NOW(), CURDATE(), NULL, NULL, NULL, NULL, NULL, NULL),
('LIST-006', 'PDPK-BUF-06', 'Nili Ravi Buffalo (16.5 L/Day)', 'Calm and easy-to-handle Nili Ravi buffalo, good for family dairy operations. Verified milk yield on farm.', 120000.00, 132000.00, FALSE, 'INR', 'AVAILABLE', 'Khardaha Nilkanth, Lar, Deoria', NOW(), CURDATE(), NULL, NULL, NULL, NULL, NULL, NULL),
('LIST-007', 'PDPK-BUF-07', 'First Calver Murrah Buffalo (13.5 L/Day)', 'Young first-lactation Murrah buffalo with strong growth potential. Budget-friendly entry into high-milking buffalo ownership.', 105000.00, 115000.00, FALSE, 'INR', 'AVAILABLE', 'Khardaha Nilkanth, Lar, Deoria', NOW(), CURDATE(), NULL, NULL, NULL, NULL, NULL, NULL),
('LIST-008', 'PDPK-BUF-08', 'High-Fat Desi Buffalo (15 L/Day, 8.2% Fat)', 'Farmer brokerage listing. Exceptional fat percentage, well suited for commercial dairy processing.', 110000.00, 120000.00, FALSE, 'INR', 'AVAILABLE', 'Khardaha Nilkanth, Lar, Deoria', NOW(), CURDATE(), NULL, NULL, NULL, NULL, NULL, NULL),
('LIST-009', 'PDPK-BUF-09', 'Murrah Buffalo (18.5 L/Day) — Token Received', 'High-milking Murrah buffalo, currently reserved with token advance. Contact for waitlist on similar animals.', 140000.00, 150000.00, FALSE, 'INR', 'RESERVED', 'Khardaha Nilkanth, Lar, Deoria', NOW(), CURDATE(), 8000.00, 'CONT-004', NOW(), NULL, NULL, NULL),
('LIST-010', 'PDPK-BUF-10', 'Prize Murrah Buffalo (21 L/Day Peak Yield)', 'Our top-yielding buffalo currently on the farm. Exceptional udder conformation, verified twice daily.', 158000.00, 170000.00, FALSE, 'INR', 'AVAILABLE', 'Khardaha Nilkanth, Lar, Deoria', NOW(), CURDATE(), NULL, NULL, NULL, NULL, NULL, NULL),
('LIST-011', 'PDPK-COW-11', 'Pure Sahiwal Cow (12.5 L/Day, A2 Milk)', 'Heat-tolerant, disease-resistant Sahiwal cow producing pure A2 milk. Gentle and easy to manage.', 78000.00, 85000.00, FALSE, 'INR', 'AVAILABLE', 'Khardaha Nilkanth, Lar, Deoria', NOW(), CURDATE(), NULL, NULL, NULL, NULL, NULL, NULL),
('LIST-012', 'PDPK-COW-12', 'HF Cross Cow (17 L/Day) — Sold', 'High-volume HF cross dairy cow. Sold and dispatched to a repeat commercial buyer after fitness inspection.', 88000.00, 95000.00, FALSE, 'INR', 'SOLD', 'Khardaha Nilkanth, Lar, Deoria', NOW(), CURDATE(), NULL, NULL, NULL, 92000.00, 'CONT-004', NOW());

INSERT IGNORE INTO animal_media (id, animal_id, url, display_order, alt_text, is_primary) VALUES
('MED-005', 'PDPK-BUF-05', 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80', 1, 'Jaffarabadi Cross Buffalo', TRUE),
('MED-006', 'PDPK-BUF-06', 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80', 1, 'Nili Ravi Buffalo', TRUE),
('MED-007', 'PDPK-BUF-07', 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80', 1, 'First Calver Murrah Buffalo', TRUE),
('MED-008', 'PDPK-BUF-08', 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80', 1, 'High-Fat Desi Buffalo', TRUE),
('MED-009', 'PDPK-BUF-09', 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80', 1, 'Murrah Buffalo Reserved', TRUE),
('MED-010', 'PDPK-BUF-10', 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80', 1, 'Prize Murrah Buffalo', TRUE),
('MED-011', 'PDPK-COW-11', 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1000&q=80', 1, 'Pure Sahiwal Cow', TRUE),
('MED-012', 'PDPK-COW-12', 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1000&q=80', 1, 'HF Cross Cow Sold', TRUE);

-- ----------------- Dairy products: production & collection over 2 days -----------------
INSERT IGNORE INTO milk_production_entries (id, business_date, shift, herd_source, quantity_litres, recorded_by, notes) VALUES
('PROD-SEED-01', CURDATE(), 'MORNING', 'Main Dairy Shed A (Murrah Herd)', 162.50, 'Ramesh (Manager)', 'Morning milking, 14 buffaloes milked'),
('PROD-SEED-02', CURDATE(), 'MORNING', 'Shed B (Desi Sahiwal Herd)', 48.00, 'Ramesh (Manager)', 'Morning cow milking'),
('PROD-SEED-03', CURDATE(), 'EVENING', 'Main Dairy Shed A (Murrah Herd)', 141.00, 'Ramesh (Manager)', 'Evening milking shift'),
('PROD-SEED-04', CURDATE(), 'EVENING', 'Shed B (Desi Sahiwal Herd)', 40.50, 'Ramesh (Manager)', 'Evening cow milking'),
('PROD-SEED-05', CURDATE() - INTERVAL 1 DAY, 'MORNING', 'Main Dairy Shed A (Murrah Herd)', 158.00, 'Ramesh (Manager)', 'Morning milking'),
('PROD-SEED-06', CURDATE() - INTERVAL 1 DAY, 'MORNING', 'Shed B (Desi Sahiwal Herd)', 46.50, 'Ramesh (Manager)', 'Morning cow milking'),
('PROD-SEED-07', CURDATE() - INTERVAL 1 DAY, 'EVENING', 'Main Dairy Shed A (Murrah Herd)', 137.50, 'Ramesh (Manager)', 'Evening milking shift'),
('PROD-SEED-08', CURDATE() - INTERVAL 1 DAY, 'EVENING', 'Shed B (Desi Sahiwal Herd)', 39.00, 'Ramesh (Manager)', 'Evening cow milking');

INSERT IGNORE INTO milk_collection_entries (
    id, supplier_contact_id, business_date, shift, product_type, gross_litres_received,
    accepted_litres, rejected_litres, fat_percentage, snf_percentage, purchase_rate_per_litre,
    total_cost, payment_status, recorded_by, notes
) VALUES
('COL-SEED-01', 'CONT-001', CURDATE(), 'MORNING', 'BUFFALO_MILK', 48.00, 48.00, 0.00, 7.50, 9.30, 59.00, 2832.00, 'PENDING', 'Ramesh (Manager)', 'High quality, lactometer clear'),
('COL-SEED-02', 'CONT-006', CURDATE(), 'MORNING', 'BUFFALO_MILK', 26.00, 25.50, 0.50, 7.00, 8.80, 57.00, 1453.50, 'PENDING', 'Ramesh (Manager)', 'Minor rejection due to slight dilution'),
('COL-SEED-03', 'CONT-009', CURDATE() - INTERVAL 1 DAY, 'EVENING', 'COW_MILK', 20.00, 20.00, 0.00, 4.40, 8.60, 48.00, 960.00, 'PAID', 'Ramesh (Manager)', 'Sahiwal cow milk, evening shift'),
('COL-SEED-04', 'CONT-001', CURDATE() - INTERVAL 1 DAY, 'MORNING', 'BUFFALO_MILK', 44.00, 44.00, 0.00, 7.30, 9.10, 58.00, 2552.00, 'PAID', 'Ramesh (Manager)', 'Regular morning intake');

INSERT IGNORE INTO milk_inventory_movements (id, business_date, product_type, movement_type, direction, quantity_litres, source_record_id, notes, recorded_by) VALUES
('MOV-SEED-01', CURDATE(), 'BUFFALO_MILK', 'OWN_PRODUCTION', 'INFLOW', 162.50, 'PROD-SEED-01', 'Morning buffalo production', 'Ramesh (Manager)'),
('MOV-SEED-02', CURDATE(), 'COW_MILK', 'OWN_PRODUCTION', 'INFLOW', 48.00, 'PROD-SEED-02', 'Morning cow production', 'Ramesh (Manager)'),
('MOV-SEED-03', CURDATE(), 'BUFFALO_MILK', 'OWN_PRODUCTION', 'INFLOW', 141.00, 'PROD-SEED-03', 'Evening buffalo production', 'Ramesh (Manager)'),
('MOV-SEED-04', CURDATE(), 'COW_MILK', 'OWN_PRODUCTION', 'INFLOW', 40.50, 'PROD-SEED-04', 'Evening cow production', 'Ramesh (Manager)'),
('MOV-SEED-05', CURDATE() - INTERVAL 1 DAY, 'BUFFALO_MILK', 'OWN_PRODUCTION', 'INFLOW', 158.00, 'PROD-SEED-05', 'Morning buffalo production', 'Ramesh (Manager)'),
('MOV-SEED-06', CURDATE() - INTERVAL 1 DAY, 'COW_MILK', 'OWN_PRODUCTION', 'INFLOW', 46.50, 'PROD-SEED-06', 'Morning cow production', 'Ramesh (Manager)'),
('MOV-SEED-07', CURDATE() - INTERVAL 1 DAY, 'BUFFALO_MILK', 'OWN_PRODUCTION', 'INFLOW', 137.50, 'PROD-SEED-07', 'Evening buffalo production', 'Ramesh (Manager)'),
('MOV-SEED-08', CURDATE() - INTERVAL 1 DAY, 'COW_MILK', 'OWN_PRODUCTION', 'INFLOW', 39.00, 'PROD-SEED-08', 'Evening cow production', 'Ramesh (Manager)'),
('MOV-SEED-09', CURDATE(), 'BUFFALO_MILK', 'PURCHASED_ACCEPTED', 'INFLOW', 48.00, 'COL-SEED-01', 'Intake from Dinesh Chaudhary', 'Ramesh (Manager)'),
('MOV-SEED-10', CURDATE(), 'BUFFALO_MILK', 'PURCHASED_ACCEPTED', 'INFLOW', 25.50, 'COL-SEED-02', 'Intake from Suraj Singh Yadav', 'Ramesh (Manager)'),
('MOV-SEED-11', CURDATE() - INTERVAL 1 DAY, 'COW_MILK', 'PURCHASED_ACCEPTED', 'INFLOW', 20.00, 'COL-SEED-03', 'Intake from Ramu Prasad', 'Ramesh (Manager)'),
('MOV-SEED-12', CURDATE() - INTERVAL 1 DAY, 'BUFFALO_MILK', 'PURCHASED_ACCEPTED', 'INFLOW', 44.00, 'COL-SEED-04', 'Intake from Dinesh Chaudhary', 'Ramesh (Manager)'),
('MOV-SEED-13', CURDATE(), 'BUFFALO_MILK', 'RETAIL_DELIVERY', 'OUTFLOW', 39.50, NULL, 'Morning doorstep deliveries (SUB-001, SUB-002, SUB-004)', 'Babloo (Delivery Staff)');

-- ----------------- Subscriptions & deliveries -----------------
INSERT IGNORE INTO delivery_subscriptions (id, customer_contact_id, product_type, quantity_litres, shift, rate_per_litre, billing_preference, delivery_instructions, status, start_date) VALUES
('SUB-004', 'CONT-008', 'BUFFALO_MILK', 2.50, 'MORNING', 70.00, 'MONTHLY', 'Leave at the gate before 6:45 AM', 'ACTIVE', CURDATE() - INTERVAL 60 DAY);

INSERT IGNORE INTO milk_deliveries (id, business_date, subscription_id, customer_contact_id, product_type, shift, scheduled_quantity_litres, actual_delivered_litres, rate_per_litre, total_billed_amount, status, recorded_by) VALUES
(CONCAT('DEL-', CURDATE(), '-SUB-001-M'), CURDATE(), 'SUB-001', 'CONT-003', 'BUFFALO_MILK', 'MORNING', 2.00, 2.00, 72.00, 144.00, 'DELIVERED', 'Babloo (Delivery Staff)'),
(CONCAT('DEL-', CURDATE(), '-SUB-002-M'), CURDATE(), 'SUB-002', 'CONT-005', 'BUFFALO_MILK', 'MORNING', 35.00, 35.00, 68.00, 2380.00, 'DELIVERED', 'Babloo (Delivery Staff)'),
(CONCAT('DEL-', CURDATE(), '-SUB-004-M'), CURDATE(), 'SUB-004', 'CONT-008', 'BUFFALO_MILK', 'MORNING', 2.50, 2.50, 70.00, 175.00, 'DELIVERED', 'Babloo (Delivery Staff)'),
(CONCAT('DEL-', CURDATE() - INTERVAL 1 DAY, '-SUB-001-M'), CURDATE() - INTERVAL 1 DAY, 'SUB-001', 'CONT-003', 'BUFFALO_MILK', 'MORNING', 2.00, 2.00, 72.00, 144.00, 'DELIVERED', 'Babloo (Delivery Staff)'),
(CONCAT('DEL-', CURDATE() - INTERVAL 1 DAY, '-SUB-004-M'), CURDATE() - INTERVAL 1 DAY, 'SUB-004', 'CONT-008', 'BUFFALO_MILK', 'MORNING', 2.50, 2.50, 70.00, 175.00, 'DELIVERED', 'Babloo (Delivery Staff)');

-- ----------------- Payments -----------------
INSERT IGNORE INTO payments (id, direction, contact_id, amount, currency, payment_method, transaction_date, reference_number, notes, status, recorded_by) VALUES
('PAY-SEED-01', 'CUSTOMER_RECEIPT', 'CONT-008', 2100.00, 'INR', 'UPI', CURDATE(), 'UPI/SEED/0081', 'Monthly subscription payment', 'POSTED', 'Parmeshwar Kushwaha (Owner)'),
('PAY-SEED-02', 'SUPPLIER_PAYMENT', 'CONT-006', 8200.00, 'INR', 'CASH', CURDATE() - INTERVAL 1 DAY, 'CASH-SEED-112', 'Weekly milk collection payout', 'POSTED', 'Parmeshwar Kushwaha (Owner)'),
('PAY-SEED-03', 'SUPPLIER_PAYMENT', 'CONT-009', 960.00, 'INR', 'CASH', CURDATE() - INTERVAL 1 DAY, 'CASH-SEED-113', 'Evening cow milk payout', 'POSTED', 'Parmeshwar Kushwaha (Owner)');

-- ----------------- Livestock sale for the SOLD cow -----------------
INSERT IGNORE INTO livestock_transactions (
    id, animal_id, listing_reference_title, buyer_contact_id, ownership_type,
    agreed_price, sale_date, status, amount_paid, outstanding_balance, recorded_by
) VALUES
('TXN-SEED-01', 'PDPK-COW-12', 'HF Cross Cow (17 L/Day) — Sold', 'CONT-004', 'OWNED', 92000.00, CURDATE(), 'COMPLETED', 92000.00, 0.00, 'Parmeshwar Kushwaha (Owner)');
