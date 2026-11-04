import * as delivery from './deliveryRepository';
import { createContact } from './contactsRepository';
import { getTestPool, resetDatabase, closeTestPool } from '../testHelpers';
const pool = getTestPool();

describe('deliveryRepository', () => {
  beforeEach(() => resetDatabase());
  afterAll(() => closeTestPool());

  it('generateDailyDeliveries is idempotent for the same date and shift', async () => {
    await createContact(
      { id: 'CONT-1', name: 'Customer', phone: '1', location: 'Lar', roles: ['DAIRY_CUSTOMER'], active: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
      pool
    );
    await delivery.createSubscription(
      { id: 'SUB-1', customerContactId: 'CONT-1', productType: 'BUFFALO_MILK', quantityLitres: 2, shift: 'MORNING', ratePerLitre: 70, billingPreference: 'MONTHLY', status: 'ACTIVE', startDate: '2026-01-01', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
      pool
    );
    const first = await delivery.generateDailyDeliveries('2026-11-04', 'MORNING', 'M', pool);
    const second = await delivery.generateDailyDeliveries('2026-11-04', 'MORNING', 'M', pool);
    expect(first).toHaveLength(1);
    expect(second).toHaveLength(0);
    expect(await delivery.getDeliveries('2026-11-04', pool)).toHaveLength(1);
  });
});
