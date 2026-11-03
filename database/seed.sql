-- ============================================================================
-- Purvanchal Dairy & Pashu Kendra (Champa Dairy) — Production Seed Data
-- Base: Khardaha Nilkanth, Lar, Deoria, Uttar Pradesh
-- Owner: Parmeshwar Kushwaha (+91 97928 20684)
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Contacts Seed
INSERT INTO contacts (id, name, phone, whatsapp, location, roles, active, notes) VALUES
('CONT-001', 'Dinesh Chaudhary', '+91 94152 34011', '919415234011', 'Khorabar, Deoria Road, Gorakhpur', '["MILK_SUPPLIER"]', TRUE, 'Regular supplier of high fat Murrah buffalo milk (40-50 LPD daily).'),
('CONT-002', 'Rameshwar Prasad Pandey', '+91 98380 77123', '919838077123', 'Khalilabad, Sant Kabir Nagar', '["LIVESTOCK_SELLER"]', TRUE, 'Progressive breeder; sends top pedigree Murrah and Sahiwal for brokerage.'),
('CONT-003', 'Dr. Arvind Tiwari', '+91 94500 88231', '919450088231', 'Betiahata, Near Civil Court, Gorakhpur', '["DAIRY_CUSTOMER"]', TRUE, 'Requires 2 litres pure buffalo milk daily at 6:30 AM.'),
('CONT-004', 'Manoj Kumar Verma', '+91 97920 44109', '919792044109', 'Hata, Kushinagar', '["LIVESTOCK_BUYER", "BULK_BUYER"]', TRUE, 'Commercial dairy farm owner; interested in 10-20 high milk Murrah buffaloes.'),
('CONT-005', 'Shashi Kant Jaiswal', '+91 94158 99042', '919415899042', 'Golghar Commercial Center, Gorakhpur', '["DAIRY_CUSTOMER"]', TRUE, 'Sweet shop owner; takes 30-40 litres buffalo milk daily for Chhena & Rabri.'),
('CONT-006', 'Suraj Singh Yadav', '+91 99180 55412', '919918055412', 'Salempur, Deoria', '["MILK_SUPPLIER"]', TRUE, 'Dairy cooperative member providing 25 LPD morning shift.'),
('CONT-007', 'Arun Kumar', '+91 97928 20684', '919792820684', 'Khardaha Nilkanth, Lar, Deoria', '["BULK_BUYER", "LIVESTOCK_BUYER"]', TRUE, 'Key farm coordinator and commercial cattle partner.');

-- 2. Animals Master Seed
INSERT INTO animals (
    id, tag_number, species, breed, gender, age_years, age_months,
    lactation_number, calving_details, pregnancy_status, reported_milk_yield_lpd,
    milk_yield_unit, yield_verification_date, yield_verification_status,
    has_veterinary_check, veterinary_notes, ownership_type, seller_contact_id,
    brokerage_commission, internal_notes, health_notes, version
) VALUES
('PDPK-BUF-01', 'UP-DEO-8801', 'BUFFALO', 'High Milking Buffalo', 'FEMALE', 5, 2, 2, 'Calved 22 days ago, robust female calf at foot', 'Open (Milking Peak)', 17.50, 'LPD', '2026-10-24', 'VERIFIED_ON_FARM', TRUE, 'Fit for transit, udder pliable and mastitis negative', 'OWNED', NULL, 0.00, 'Top yielder, 2-time pail test verified 17.5 L/day', 'Vaccinated (FMD + HS), dewormed', 1),
('PDPK-COW-02', 'UP-DEO-7104', 'COW', 'Milch Cow', 'FEMALE', 4, 8, 2, 'Calved 28 days ago, male calf at foot', 'Open (Milking Peak)', 14.50, 'LPD', '2026-10-22', 'VERIFIED_ON_FARM', TRUE, 'Clean health certificate issued by Lar Veterinary Hospital', 'OWNED', NULL, 0.00, 'Sweet A2 milk, tests 4.6% fat', 'Completely healthy, gentle temperament', 1),
('PDPK-BUF-03', 'UP-DEO-9022', 'BUFFALO', 'High Milking Buffalo', 'FEMALE', 6, 0, 3, 'Calved 45 days ago, female calf', 'Open (Milking Peak)', 19.00, 'LPD', '2026-10-20', 'VERIFIED_ON_FARM', TRUE, 'Exceptional dairy conformation, strong ring horns', 'OWNED', NULL, 0.00, 'Elite milch buffalo for commercial dairy herd improvement', 'Fully vaccinated, sound teats', 1),
('PDPK-COW-04', 'UP-DEO-6340', 'COW', 'Milch Cow', 'FEMALE', 3, 11, 1, 'Calved 15 days ago (1st Calver)', 'Open (Milking Peak)', 13.00, 'LPD', '2026-10-25', 'VERIFIED_ON_FARM', TRUE, 'First lactation heiffer, clean teat canals', 'OWNED', NULL, 0.00, 'Young prime first calver, very high genetic potential', 'Dewormed and vitamin supplemented', 1);

-- 3. Animal Listings Seed
INSERT INTO animal_listings (
    id, animal_id, title, description, price_min, price_max, contact_for_price,
    currency, status, location, published_at, last_verified_at
) VALUES
('LIST-001', 'PDPK-BUF-01', 'High Milking Buffalo with Female Calf (17.5 L/Day)', 'Exceptional quality milch buffalo in peak lactation. Calm temperament, easy hand or machine milking. Two-time Dohai milking verification welcome at farm.', 135000.00, 148000.00, FALSE, 'INR', 'AVAILABLE', 'Khardaha Nilkanth, Lar, Deoria', '2026-10-06 09:00:00', '2026-10-25'),
('LIST-002', 'PDPK-COW-02', 'High Yield Milch Cow (14.5 Litres/Day Daily Tested)', 'High quality dairy cow with rich A2 milk yield. Docile, healthy, and tested on-farm in Lar, Deoria.', 84000.00, 92000.00, FALSE, 'INR', 'AVAILABLE', 'Khardaha Nilkanth, Lar, Deoria', '2026-10-09 10:00:00', '2026-10-24'),
('LIST-003', 'PDPK-BUF-03', 'Heavy Ring-Horned Buffalo (19.0 L/Day Peak Record)', 'Heavy built champion milch buffalo with tight curved horns and wide pelvis. Ideal for high-margin dairy farm expansion in Purvanchal.', 155000.00, 168000.00, FALSE, 'INR', 'AVAILABLE', 'Khardaha Nilkanth, Lar, Deoria', '2026-10-12 11:30:00', '2026-10-26'),
('LIST-004', 'PDPK-COW-04', 'First Calver Milch Cow (13.0 L/Day Sweet Milk)', 'Young first calver heifer with straight backline and square udder. Very easy to handle for family dairies.', 72000.00, 78000.00, FALSE, 'INR', 'AVAILABLE', 'Khardaha Nilkanth, Lar, Deoria', '2026-10-14 14:00:00', '2026-10-25');

-- 4. Animal Media Seed
INSERT INTO animal_media (id, animal_id, url, display_order, alt_text, is_primary) VALUES
('MED-001', 'PDPK-BUF-01', 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80', 1, 'High Milking Buffalo Side View', TRUE),
('MED-002', 'PDPK-COW-02', 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1000&q=80', 1, 'Milch Cow Profile View', TRUE),
('MED-003', 'PDPK-BUF-03', 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80', 1, 'Heavy Murrah Buffalo in Pasture', TRUE),
('MED-004', 'PDPK-COW-04', 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1000&q=80', 1, 'First Calver Cow Stand View', TRUE);

-- 5. Enquiries Seed (PRD Compliant)
INSERT INTO enquiries (
    id, customer_name, contact_person, phone, email, location, enquiry_type,
    animal_type, preferred_breed, requested_quantity, preferred_milk_yield,
    budget_per_animal, total_budget, delivery_location, status, quotation_amount, transport_quotation
) VALUES
('ENQ-2026-101', 'Purvanchal Agro Dairy', 'Virendra Singh', '+91 94150 99887', 'virendra@purvanchalagro.in', 'Salempur, Deoria', 'BULK_COMMERCIAL', 'BUFFALO', 'High Milking Buffalo', 10, '16-18 L/day', 135000.00, 1400000.00, 'Salempur Farm Site', 'ORDER_CONFIRMED', 1350000.00, 25000.00),
('ENQ-2026-102', 'Kamlesh Yadav', NULL, '+91 98390 12345', NULL, 'Pipraich, Gorakhpur', 'INDIVIDUAL', 'BUFFALO', 'High Milking Buffalo', 1, '15+ L/day', 130000.00, 130000.00, 'Pipraich Village', 'CONTACTED', 135000.00, 4500.00),
('ENQ-2026-103', 'Maa Gayatri Dairy Farm', 'Rameshwar Nath', '+91 99350 44332', 'gayatri.dairy@gmail.com', 'Rudrapur, Deoria', 'BULK_COMMERCIAL', 'BUFFALO', 'Murrah Buffalo', 5, '18+ L/day', 145000.00, 750000.00, 'Rudrapur bypass', 'QUOTATION_SENT', 725000.00, 12000.00);

-- 6. Livestock Orders Seed
INSERT INTO livestock_orders (
    id, enquiry_id, customer_name, phone, delivery_address, agreed_price,
    transport_quote, total_amount, payment_status, advance_amount_paid,
    veterinary_check_passed, delivery_status, order_status, transporter_details
) VALUES
('ORD-2026-088', 'ENQ-2026-101', 'Purvanchal Agro Dairy', '+91 94150 99887', 'Salempur, Deoria (UP)', 1350000.00, 25000.00, 1375000.00, 'PARTIAL_ADVANCE', 200000.00, TRUE, 'VET_PASSED', 'ORDER_CONFIRMED', 'Specialized 22-ft Livestock Carrier (Driver: Munna Yadav, UP-53-AT-9011)');

-- 7. Milk Production Seed
INSERT INTO milk_production_entries (id, business_date, shift, herd_source, quantity_litres, recorded_by, notes) VALUES
('PROD-20261026-M', '2026-10-26', 'MORNING', 'Lar Farm Owned Herd', 68.50, 'Parmeshwar Kushwaha', 'Morning milking shift completed at 6:15 AM with high density'),
('PROD-20261026-E', '2026-10-26', 'EVENING', 'Lar Farm Owned Herd', 61.00, 'Parmeshwar Kushwaha', 'Evening milking shift completed at 6:00 PM');

-- 8. Milk Collection Seed
INSERT INTO milk_collection_entries (
    id, supplier_contact_id, business_date, shift, product_type, gross_litres_received,
    accepted_litres, rejected_litres, fat_percentage, snf_percentage, purchase_rate_per_litre,
    total_cost, payment_status, recorded_by
) VALUES
('COLL-20261026-01', 'CONT-001', '2026-10-26', 'MORNING', 'BUFFALO_MILK', 42.00, 42.00, 0.00, 7.40, 9.10, 58.00, 2436.00, 'PAID', 'Parmeshwar Kushwaha'),
('COLL-20261026-02', 'CONT-006', '2026-10-26', 'MORNING', 'BUFFALO_MILK', 25.00, 25.00, 0.00, 7.10, 8.90, 56.00, 1400.00, 'PAID', 'Parmeshwar Kushwaha');

-- 9. Delivery Subscriptions Seed
INSERT INTO delivery_subscriptions (
    id, customer_contact_id, product_type, quantity_litres, shift, rate_per_litre,
    billing_preference, delivery_instructions, status, start_date
) VALUES
('SUB-001', 'CONT-003', 'BUFFALO_MILK', 2.00, 'MORNING', 72.00, 'MONTHLY', 'Deliver to porch can at 6:30 AM sharp', 'ACTIVE', '2026-01-01'),
('SUB-002', 'CONT-005', 'BUFFALO_MILK', 35.00, 'MORNING', 68.00, 'WEEKLY', 'Deliver in 40L steel can at sweet shop back entrance', 'ACTIVE', '2026-02-15');

-- 10. Milk Deliveries Seed
INSERT INTO milk_deliveries (
    id, business_date, subscription_id, customer_contact_id, product_type, shift,
    scheduled_quantity_litres, actual_delivered_litres, rate_per_litre, total_billed_amount,
    status, recorded_by
) VALUES
('DEL-20261026-01', '2026-10-26', 'SUB-001', 'CONT-003', 'BUFFALO_MILK', 'MORNING', 2.00, 2.00, 72.00, 144.00, 'DELIVERED', 'Delivery Boy Ramu'),
('DEL-20261026-02', '2026-10-26', 'SUB-002', 'CONT-005', 'BUFFALO_MILK', 'MORNING', 35.00, 35.00, 68.00, 2380.00, 'DELIVERED', 'Route Van 1');

-- 11. Payments Seed
INSERT INTO payments (
    id, direction, contact_id, amount, currency, payment_method, transaction_date, reference_number, notes, status, recorded_by
) VALUES
('PAY-20261026-01', 'CUSTOMER_RECEIPT', 'CONT-005', 15000.00, 'INR', 'UPI', '2026-10-26', 'UPI/261026/990142', 'Weekly milk settlement', 'POSTED', 'Parmeshwar Kushwaha'),
('PAY-20261026-02', 'SUPPLIER_PAYMENT', 'CONT-001', 12000.00, 'INR', 'BANK_TRANSFER', '2026-10-26', 'NEFT/UBIN/881023', 'Supplier milk payout', 'POSTED', 'Parmeshwar Kushwaha');

-- 12. Default Admin Users
-- Default login: username: admin / password: password123 (use bcrypt hash in production)
INSERT INTO admin_users (id, username, password_hash, full_name, role, phone, is_active) VALUES
('ADM-001', 'admin', '$2b$10$wK1W0hY0Qd6V3Y8yZzJvse1H1vM5f1oFwGqZk5yC6L3mN2pQ4rX7e', 'Parmeshwar Kushwaha', 'OWNER', '+91 97928 20684', TRUE),
('ADM-002', 'manager', '$2b$10$wK1W0hY0Qd6V3Y8yZzJvse1H1vM5f1oFwGqZk5yC6L3mN2pQ4rX7e', 'Farm Operations Manager', 'MANAGER', '+91 98380 00000', TRUE);

SET FOREIGN_KEY_CHECKS = 1;
