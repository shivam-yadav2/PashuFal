import { getTestPool, resetDatabase, closeTestPool } from './testHelpers';

describe('testHelpers', () => {
  afterAll(() => closeTestPool());

  it('resets the database between runs', async () => {
    const pool = getTestPool();
    await resetDatabase();
    await pool.execute(
      "INSERT INTO contacts (id, name, phone, location, roles) VALUES ('CONT-TEST', 'Test', '0000000000', 'Test', '[]')"
    );
    const [before] = await pool.query('SELECT COUNT(*) AS c FROM contacts');
    expect((before as any)[0].c).toBe(1);

    await resetDatabase();
    const [after] = await pool.query('SELECT COUNT(*) AS c FROM contacts');
    expect((after as any)[0].c).toBe(0);
  });
});
