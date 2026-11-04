import * as orders from './ordersRepository';
import { getTestPool, resetDatabase, closeTestPool } from '../testHelpers';
const pool = getTestPool();

async function insertFixtureAnimal(id: string): Promise<void> {
  await pool.execute(
    `INSERT INTO animals (id, tag_number, species, breed, gender, age_years, milk_yield_unit, ownership_type, version)
     VALUES (?, ?, 'BUFFALO', 'Murrah', 'FEMALE', 5, 'LPD', 'OWNED', 1)`,
    [id, `TAG-${id}`]
  );
  await pool.execute(
    `INSERT INTO animal_listings (id, animal_id, title, description, price_min, price_max, status, location, last_verified_at)
     VALUES (?, ?, 'Fixture listing', 'Fixture', 100000, 110000, 'AVAILABLE', 'Lar', '2026-01-01')`,
    [`LIST-${id}`, id]
  );
}

describe('ordersRepository', () => {
  beforeEach(() => resetDatabase());
  afterAll(() => closeTestPool());

  it('creates an order with multiple animalIds and reads them back in the junction table', async () => {
    await insertFixtureAnimal('A1');
    await insertFixtureAnimal('A2');
    const o = await orders.createOrder({ customerName: 'X', animalIds: ['A1', 'A2'], agreedPrice: 100000 }, pool);
    const found = await orders.getOrderById(o.id, pool);
    expect(found?.animalIds.sort()).toEqual(['A1', 'A2']);
    expect(found?.totalAmount).toBe(100000);
  });

  it('generates unique ids across many rapid creations (old 3-digit-random scheme collided well before this many)', async () => {
    const results = await Promise.all(
      Array.from({ length: 150 }, () => orders.createOrder({ customerName: 'X', agreedPrice: 1000 }, pool))
    );
    const ids = results.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
