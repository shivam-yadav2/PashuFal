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
});
