import * as finance from './financeRepository';
import { getTestPool, resetDatabase, closeTestPool } from '../testHelpers';
const pool = getTestPool();

describe('financeRepository', () => {
  beforeEach(() => resetDatabase());
  afterAll(() => closeTestPool());

  it('computes customerOutstanding from billed deliveries minus posted receipts, with no hardcoded offset', async () => {
    const summary = await finance.getFinancialSummary(pool);
    expect(summary.customerOutstanding).toBe(0); // empty DB: 0 billed - 0 received, not mockDb's old +18450
  });

  it('subtracts real ledger rows correctly (not just the trivial empty-DB case)', async () => {
    await pool.execute(
      "INSERT INTO contacts (id, name, phone, location, roles) VALUES ('CONT-F', 'F', '1', 'Lar', '[]')"
    );
    await pool.execute(
      `INSERT INTO delivery_subscriptions (id, customer_contact_id, quantity_litres, shift, rate_per_litre, start_date)
       VALUES ('SUB-F', 'CONT-F', 2, 'MORNING', 70, '2026-01-01')`
    );
    await pool.execute(
      `INSERT INTO milk_deliveries (id, business_date, subscription_id, customer_contact_id, shift, scheduled_quantity_litres, actual_delivered_litres, rate_per_litre, total_billed_amount, status, recorded_by)
       VALUES ('DEL-F', '2026-11-04', 'SUB-F', 'CONT-F', 'MORNING', 2, 2, 100, 200, 'DELIVERED', 'X')`
    );
    await pool.execute(
      "INSERT INTO payments (id, direction, contact_id, amount, payment_method, transaction_date, status, recorded_by) VALUES ('PAY-F1', 'CUSTOMER_RECEIPT', 'CONT-F', 50, 'CASH', '2026-11-04', 'POSTED', 'X')"
    );

    await pool.execute(
      `INSERT INTO milk_collection_entries (id, supplier_contact_id, business_date, shift, gross_litres_received, accepted_litres, purchase_rate_per_litre, total_cost, recorded_by)
       VALUES ('COL-F', 'CONT-F', '2026-11-04', 'MORNING', 5, 5, 60, 300, 'X')`
    );
    await pool.execute(
      "INSERT INTO payments (id, direction, contact_id, amount, payment_method, transaction_date, status, recorded_by) VALUES ('PAY-F2', 'SUPPLIER_PAYMENT', 'CONT-F', 100, 'CASH', '2026-11-04', 'POSTED', 'X')"
    );

    await pool.execute(
      `INSERT INTO animals (id, tag_number, species, breed, gender, age_years, milk_yield_unit, ownership_type, version)
       VALUES ('A-F', 'TAG-F', 'BUFFALO', 'Murrah', 'FEMALE', 5, 'LPD', 'OWNED', 1)`
    );
    await pool.execute(
      `INSERT INTO livestock_transactions (id, animal_id, listing_reference_title, buyer_contact_id, ownership_type, agreed_price, sale_date, status, amount_paid, outstanding_balance, recorded_by)
       VALUES ('TXN-F', 'A-F', 'Fixture', 'CONT-F', 'OWNED', 50000, '2026-11-04', 'COMPLETED', 50000, 0, 'X')`
    );

    const summary = await finance.getFinancialSummary(pool);
    expect(summary.customerOutstanding).toBe(150);
    expect(summary.supplierPayable).toBe(200);
    expect(summary.livestockSalesRevenue).toBe(50000);
  });
});
