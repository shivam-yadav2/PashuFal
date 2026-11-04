import { getContacts, getContactById, createContact } from './contactsRepository';
import { getTestPool, resetDatabase, closeTestPool } from '../testHelpers';
import { Contact } from '../../../types/domain';

const pool = getTestPool();
const sample: Contact = {
  id: 'CONT-X', name: 'Ramu', phone: '999', location: 'Lar',
  roles: ['MILK_SUPPLIER', 'BULK_BUYER'], active: true,
  createdAt: '2026-01-01', updatedAt: '2026-01-01',
};

describe('contactsRepository', () => {
  beforeEach(() => resetDatabase());
  afterAll(() => closeTestPool());

  it('creates and round-trips a contact with a multi-value roles array', async () => {
    await createContact(sample, pool);
    const found = await getContactById('CONT-X', pool);
    expect(found?.roles).toEqual(['MILK_SUPPLIER', 'BULK_BUYER']);
  });

  it('returns undefined for a missing id', async () => {
    expect(await getContactById('NOPE', pool)).toBeUndefined();
  });

  it('lists all contacts', async () => {
    await createContact(sample, pool);
    expect((await getContacts(pool)).length).toBe(1);
  });
});
