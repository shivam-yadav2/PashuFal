import { recordAudit, getAuditLogs } from './auditRepository';
import { getTestPool, resetDatabase, closeTestPool } from '../testHelpers';

describe('auditRepository', () => {
  beforeEach(() => resetDatabase());
  afterAll(() => closeTestPool());

  it('records and lists audit entries newest first', async () => {
    await recordAudit({ actor: 'A', action: 'ACT1', entityType: 'ANIMAL', entityId: 'X', details: 'first' }, getTestPool());
    await recordAudit({ actor: 'B', action: 'ACT2', entityType: 'ANIMAL', entityId: 'Y', details: 'second' }, getTestPool());
    const logs = await getAuditLogs(getTestPool());
    expect(logs[0].action).toBe('ACT2');
    expect(logs[1].action).toBe('ACT1');
  });
});
