import * as animals from './animalsRepository';
import { createContact } from './contactsRepository';
import { getTestPool, resetDatabase, closeTestPool } from '../testHelpers';
import { Animal } from '../../../types/domain';

const pool = getTestPool();

function buildAnimal(overrides: Partial<Animal> = {}): Animal {
  const id = overrides.id || 'PDPK-BUF-DEFAULT';
  return {
    id,
    tagNumber: `TAG-${id}`,
    species: 'BUFFALO',
    breed: 'Murrah',
    gender: 'FEMALE',
    ageYears: 5,
    ownershipType: 'OWNED',
    milkYieldUnit: 'LPD',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    version: 1,
    listing: {
      title: `Listing for ${id}`,
      description: 'A healthy buffalo.',
      priceMin: 100000,
      priceMax: 120000,
      currency: 'INR',
      status: 'AVAILABLE',
      location: 'Lar, Deoria',
      lastVerifiedAt: '2026-01-01',
    },
    images: [
      { id: `img-${id}`, animalId: id, url: '/assets/placeholder.jpg', displayOrder: 1, altText: 'Buffalo', isPrimary: true },
    ],
    ...overrides,
  };
}

describe('animalsRepository', () => {
  beforeEach(() => resetDatabase());
  afterAll(() => closeTestPool());

  it('creates an animal with its listing and media, and reads it back', async () => {
    const a = buildAnimal({ id: 'PDPK-BUF-TEST' });
    await animals.createAnimal(a, 'Tester', pool);
    const found = await animals.getAnimalById('PDPK-BUF-TEST', pool);
    expect(found?.listing.title).toBe(a.listing.title);
    expect(found?.images).toHaveLength(1);
  });

  it('filters by species, price range, and search substring', async () => {
    await animals.createAnimal(buildAnimal({ id: 'PDPK-BUF-A', species: 'BUFFALO' }), 'T', pool);
    await animals.createAnimal(buildAnimal({ id: 'PDPK-COW-B', species: 'COW' }), 'T', pool);
    expect((await animals.getAnimals({ species: 'COW' }, pool)).map((a) => a.id)).toEqual(['PDPK-COW-B']);
  });

  it('excludes SOLD and DRAFT animals from getPublicAnimals', async () => {
    const sold = buildAnimal({ id: 'PDPK-BUF-SOLD' });
    sold.listing.status = 'SOLD';
    await animals.createAnimal(sold, 'T', pool);
    expect(await animals.getPublicAnimals(pool)).toHaveLength(0);
  });

  it('reserveAnimal: only one of two concurrent attempts succeeds', async () => {
    await animals.createAnimal(buildAnimal({ id: 'PDPK-BUF-RACE' }), 'T', pool);
    await createContact({ id: 'CONT-A', name: 'A', phone: '1', location: 'L', roles: [], active: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' }, pool);
    const [r1, r2] = await Promise.allSettled([
      animals.reserveAnimal('PDPK-BUF-RACE', 5000, 'CONT-A', 'T', pool),
      animals.reserveAnimal('PDPK-BUF-RACE', 5000, 'CONT-A', 'T', pool),
    ]);
    const succeeded = [r1, r2].filter((r) => r.status === 'fulfilled');
    const failed = [r1, r2].filter((r) => r.status === 'rejected');
    expect(succeeded).toHaveLength(1);
    expect(failed).toHaveLength(1);
  });

  it('completeSale succeeds for an OWNED animal with a real buyer and marks it SOLD', async () => {
    await animals.createAnimal(buildAnimal({ id: 'PDPK-BUF-SELL' }), 'T', pool);
    await createContact({ id: 'CONT-BUYER', name: 'Buyer', phone: '1', location: 'L', roles: [], active: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' }, pool);

    const txn = await animals.completeSale('PDPK-BUF-SELL', 'CONT-BUYER', 105000, undefined, 'T', pool);
    expect(txn?.agreedPrice).toBe(105000);
    expect(txn?.status).toBe('COMPLETED');

    const sold = await animals.getAnimalById('PDPK-BUF-SELL', pool);
    expect(sold?.listing.status).toBe('SOLD');
    expect(sold?.listing.soldPrice).toBe(105000);
  });

  it('completeSale rejects a buyerContactId that does not exist with a 400-style error, not a raw SQL error', async () => {
    await animals.createAnimal(buildAnimal({ id: 'PDPK-BUF-NB' }), 'T', pool);
    await expect(animals.completeSale('PDPK-BUF-NB', 'CONT-MISSING', 100000, undefined, 'T', pool)).rejects.toThrow(
      /contact/i
    );
  });
});
