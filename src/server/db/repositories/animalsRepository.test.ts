import * as animals from './animalsRepository';
import { createContact } from './contactsRepository';
import { getAuditLogs } from './auditRepository';
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

  it('createAnimal actually writes an audit log entry, not just the animal row', async () => {
    await animals.createAnimal(buildAnimal({ id: 'PDPK-BUF-AUDITED' }), 'Auditor', pool);
    const logs = await getAuditLogs(pool);
    expect(logs.some((l) => l.action === 'CREATED_ANIMAL' && l.entityId === 'PDPK-BUF-AUDITED' && l.actor === 'Auditor')).toBe(true);
  });

  it('filters by species', async () => {
    await animals.createAnimal(buildAnimal({ id: 'PDPK-BUF-A', species: 'BUFFALO' }), 'T', pool);
    await animals.createAnimal(buildAnimal({ id: 'PDPK-COW-B', species: 'COW' }), 'T', pool);
    expect((await animals.getAnimals({ species: 'COW' }, pool)).map((a) => a.id)).toEqual(['PDPK-COW-B']);
  });

  it('filters by price range', async () => {
    const cheap = buildAnimal({ id: 'PDPK-BUF-CHEAP' });
    cheap.listing.priceMin = 50000;
    cheap.listing.priceMax = 60000;
    const expensive = buildAnimal({ id: 'PDPK-BUF-EXPENSIVE' });
    expensive.listing.priceMin = 200000;
    expensive.listing.priceMax = 220000;
    await animals.createAnimal(cheap, 'T', pool);
    await animals.createAnimal(expensive, 'T', pool);
    expect((await animals.getAnimals({ minPrice: 100000 }, pool)).map((a) => a.id)).toEqual(['PDPK-BUF-EXPENSIVE']);
    expect((await animals.getAnimals({ maxPrice: 100000 }, pool)).map((a) => a.id)).toEqual(['PDPK-BUF-CHEAP']);
  });

  it('filters by search substring across id, breed, tag, title, and location', async () => {
    await animals.createAnimal(buildAnimal({ id: 'PDPK-BUF-FINDME', breed: 'Jaffarabadi Cross' }), 'T', pool);
    await animals.createAnimal(buildAnimal({ id: 'PDPK-BUF-OTHER' }), 'T', pool);
    expect((await animals.getAnimals({ search: 'jaffarabadi' }, pool)).map((a) => a.id)).toEqual(['PDPK-BUF-FINDME']);
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
    const failed = [r1, r2].filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
    expect(succeeded).toHaveLength(1);
    expect(failed).toHaveLength(1);
    expect(failed[0].reason.message).toBe(
      "Cannot reserve animal in 'RESERVED' status. Only AVAILABLE animals can be reserved."
    );
  });

  it('releaseReservation returns a RESERVED animal to AVAILABLE and clears the deposit', async () => {
    await animals.createAnimal(buildAnimal({ id: 'PDPK-BUF-REL' }), 'T', pool);
    await createContact({ id: 'CONT-REL', name: 'R', phone: '1', location: 'L', roles: [], active: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' }, pool);
    await animals.reserveAnimal('PDPK-BUF-REL', 5000, 'CONT-REL', 'T', pool);

    const released = await animals.releaseReservation('PDPK-BUF-REL', 'T', pool);
    expect(released?.listing.status).toBe('AVAILABLE');
    expect(released?.listing.reservationDeposit).toBeUndefined();
    expect(released?.listing.reservedForContactId).toBeUndefined();
  });

  it('releaseReservation on a non-RESERVED animal throws the same message mockDb used', async () => {
    await animals.createAnimal(buildAnimal({ id: 'PDPK-BUF-NOTRES' }), 'T', pool);
    await expect(animals.releaseReservation('PDPK-BUF-NOTRES', 'T', pool)).rejects.toThrow(
      "Cannot release animal in 'AVAILABLE' status."
    );
  });

  it('reserveAnimal rejects a contactId that does not exist with a clean error, not a raw SQL error', async () => {
    await animals.createAnimal(buildAnimal({ id: 'PDPK-BUF-BADRES' }), 'T', pool);
    await expect(animals.reserveAnimal('PDPK-BUF-BADRES', 5000, 'CONT-MISSING', 'T', pool)).rejects.toThrow(
      'Contact CONT-MISSING does not exist.'
    );
  });

  it('completeSale on a BROKERAGE animal records the commission as unsettled', async () => {
    const brokered = buildAnimal({ id: 'PDPK-BUF-BROKER', ownershipType: 'BROKERAGE', brokerageCommission: 2000 });
    await createContact({ id: 'CONT-SELLER', name: 'Seller', phone: '1', location: 'L', roles: [], active: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' }, pool);
    brokered.sellerContactId = 'CONT-SELLER';
    await animals.createAnimal(brokered, 'T', pool);
    await createContact({ id: 'CONT-BROKER-BUYER', name: 'Buyer', phone: '1', location: 'L', roles: [], active: true, createdAt: '2026-01-01', updatedAt: '2026-01-01' }, pool);

    const txn = await animals.completeSale('PDPK-BUF-BROKER', 'CONT-BROKER-BUYER', 150000, undefined, 'T', pool);
    expect(txn?.commissionAmount).toBe(2000);
    expect(txn?.commissionSettled).toBe(false);

    const all = await animals.getTransactions(pool);
    expect(all.find((t) => t.id === txn!.id)?.commissionAmount).toBe(2000);
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

  it('completeSale rejects a buyerContactId that does not exist with a clean error, not a raw SQL error', async () => {
    await animals.createAnimal(buildAnimal({ id: 'PDPK-BUF-NB' }), 'T', pool);
    await expect(animals.completeSale('PDPK-BUF-NB', 'CONT-MISSING', 100000, undefined, 'T', pool)).rejects.toThrow(
      'Buyer contact CONT-MISSING does not exist.'
    );
  });

  it('stores a client-supplied publishedAt (UTC ISO string) at the correct wall-clock moment, not offset by the server timezone', async () => {
    const nowIso = new Date().toISOString();
    const a = buildAnimal({ id: 'PDPK-BUF-TZ' });
    a.listing.publishedAt = nowIso;
    await animals.createAnimal(a, 'T', pool);

    const found = await animals.getAnimalById('PDPK-BUF-TZ', pool);
    const storedMs = new Date(found!.listing.publishedAt!).getTime();
    const expectedMs = new Date(nowIso).getTime();
    // dateStrings:true gives back a naive "YYYY-MM-DD HH:MM:SS" with no zone,
    // which Date parses as local time — so this only lines up with the true
    // instant if the write path converted to a real Date object first.
    expect(Math.abs(storedMs - expectedMs)).toBeLessThan(5000);
  });
});
