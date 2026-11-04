import { withTransaction } from './mysql';
import { getTestPool, resetDatabase, closeTestPool } from './testHelpers';

describe('mysql pool config', () => {
  it('returns DECIMAL columns as numbers and DATE columns as strings', async () => {
    const pool = getTestPool();
    const [rows] = await pool.query("SELECT CAST(123.45 AS DECIMAL(10,2)) AS price, CURDATE() AS d");
    expect(typeof (rows as any)[0].price).toBe('number');
    expect(typeof (rows as any)[0].d).toBe('string');
    expect(Number.isNaN(new Date((rows as any)[0].d).getTime())).toBe(false);
  });
});

describe('withTransaction', () => {
  beforeEach(() => resetDatabase());
  afterAll(() => closeTestPool());

  it('commits on success', async () => {
    await withTransaction(async (conn) => {
      await conn.execute("INSERT INTO contacts (id, name, phone, location, roles) VALUES ('CONT-TX', 'Tx', '0', 'X', '[]')");
    }, getTestPool());
    const [rows] = await getTestPool().query("SELECT * FROM contacts WHERE id='CONT-TX'");
    expect((rows as any[]).length).toBe(1);
  });

  it('rolls back on throw', async () => {
    await expect(withTransaction(async (conn) => {
      await conn.execute("INSERT INTO contacts (id, name, phone, location, roles) VALUES ('CONT-TX2', 'Tx', '0', 'X', '[]')");
      throw new Error('boom');
    }, getTestPool())).rejects.toThrow('boom');
    const [rows] = await getTestPool().query("SELECT * FROM contacts WHERE id='CONT-TX2'");
    expect((rows as any[]).length).toBe(0);
  });
});
