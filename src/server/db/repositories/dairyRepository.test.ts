import * as dairy from './dairyRepository';
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
});
