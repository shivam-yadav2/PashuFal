import * as dairy from './dairyRepository';
import { createContact } from './contactsRepository';
import { getTestPool, resetDatabase, closeTestPool } from '../testHelpers';
const pool = getTestPool();

describe('dairyRepository', () => {
  beforeEach(() => resetDatabase());
  afterAll(() => closeTestPool());

  it('addProductionEntry also creates an OWN_PRODUCTION inflow movement', async () => {
    await dairy.addProductionEntry(
      { id: 'P1', businessDate: '2026-11-04', shift: 'MORNING', herdSource: 'Shed A', quantityLitres: 50, recordedBy: 'X', createdAt: '2026-11-04T06:00:00Z' },
      pool
    );
    const movements = await dairy.getInventoryMovements('2026-11-04', pool);
    expect(movements.some((m) => m.movementType === 'OWN_PRODUCTION' && m.quantityLitres === 50)).toBe(true);
  });

  it('reconciliation sums opening+production+purchased minus delivered/waste per product type', async () => {
    await dairy.addProductionEntry(
      { id: 'P2', businessDate: '2026-11-04', shift: 'MORNING', herdSource: 'Shed A (Buffalo)', quantityLitres: 100, recordedBy: 'X', createdAt: '2026-11-04T06:00:00Z' },
      pool
    );
    const recon = await dairy.getStockReconciliation('2026-11-04', pool);
    expect(recon.buffalo.production).toBe(100);
    expect(recon.buffalo.calculatedClosing).toBe(100);
  });

  it('addCollectionEntry with acceptedLitres=0 records the entry but creates no stock movement', async () => {
    await createContact({ id: 'CONT-SUP', name: 'Supplier', phone: '1', location: 'L', roles: ['MILK_SUPPLIER'], active: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' }, pool);
    await dairy.addCollectionEntry(
      {
        id: 'COL-REJECT', supplierContactId: 'CONT-SUP', businessDate: '2026-11-04', shift: 'MORNING',
        productType: 'BUFFALO_MILK', grossLitresReceived: 10, acceptedLitres: 0, rejectedLitres: 10,
        purchaseRatePerLitre: 58, totalCost: 0, paymentStatus: 'PENDING', recordedBy: 'X', createdAt: '2026-11-04T06:00:00Z',
      },
      pool
    );
    const [entries, movements] = await Promise.all([
      dairy.getCollectionEntries('2026-11-04', pool),
      dairy.getInventoryMovements('2026-11-04', pool),
    ]);
    expect(entries.find((e) => e.id === 'COL-REJECT')).toBeDefined();
    expect(movements.some((m) => m.sourceRecordId === 'COL-REJECT')).toBe(false);
  });
});
