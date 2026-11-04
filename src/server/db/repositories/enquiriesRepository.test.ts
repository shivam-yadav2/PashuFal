import * as enquiries from './enquiriesRepository';
import { getTestPool, resetDatabase, closeTestPool } from '../testHelpers';
const pool = getTestPool();

describe('enquiriesRepository', () => {
  beforeEach(() => resetDatabase());
  afterAll(() => closeTestPool());

  it('creates an enquiry with the same defaults mockDb used (status NEW_ENQUIRY, default animalType BUFFALO)', async () => {
    const e = await enquiries.createEnquiry({ phone: '999' }, pool);
    expect(e.status).toBe('NEW_ENQUIRY');
    expect(e.animalType).toBe('BUFFALO');
    expect(e.customerName).toBe('Anonymous Enquirer');
  });

  it('filters by status', async () => {
    const e = await enquiries.createEnquiry({ phone: '1' }, pool);
    await enquiries.updateEnquiryStatus(e.id, 'CONTACTED', undefined, undefined, undefined, 'Staff', pool);
    expect((await enquiries.getEnquiries('CONTACTED', pool)).map((x) => x.id)).toContain(e.id);
    expect(await enquiries.getEnquiries('NEW_ENQUIRY', pool)).toHaveLength(0);
  });

  it('generates unique ids across many rapid creations (old 3-digit-random scheme collided well before this many)', async () => {
    const results = await Promise.all(
      Array.from({ length: 150 }, (_, i) => enquiries.createEnquiry({ phone: String(i) }, pool))
    );
    const ids = results.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
