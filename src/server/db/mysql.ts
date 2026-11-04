import 'dotenv/config';
import mysql, { Pool, PoolConnection, PoolOptions, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface MySQLConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
}

// The spec targets MySQL 8.0+/MariaDB 10.5+, both of which default to strict
// mode. The actual local dev server (older MariaDB) does not, which lets
// invalid data (over-long strings, bad enum values, zero dates) through
// silently instead of raising an error — a real environment-fidelity gap, not
// just a style preference. Set it explicitly on every new physical
// connection so behavior doesn't depend on the server's own default.
export const STRICT_SQL_MODE =
  'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

export function enforceStrictSqlMode(pool: Pool): void {
  pool.on('connection', (connection) => {
    connection.query(`SET SESSION sql_mode = '${STRICT_SQL_MODE}'`);
  });
}

let pool: Pool | null = null;
let isConnected = false;

export function getMySQLConfig(): MySQLConfig | null {
  const host = process.env.MYSQL_HOST || process.env.DB_HOST;
  const database = process.env.MYSQL_DATABASE || process.env.DB_NAME;
  const user = process.env.MYSQL_USER || process.env.DB_USER;
  const password = process.env.MYSQL_PASSWORD ?? process.env.DB_PASS;
  const port = parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || '3306', 10);

  // If host and database are explicitly specified, enable MySQL mode
  if (host && database && user) {
    return { host, port, user, password, database };
  }

  return null;
}

export function isMySQLEnabled(): boolean {
  return getMySQLConfig() !== null;
}

export function getPool(): Pool | null {
  if (!pool) {
    const config = getMySQLConfig();
    if (!config) return null;

    const poolOptions: PoolOptions = {
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      dateStrings: true,
      decimalNumbers: true,
    };

    pool = mysql.createPool(poolOptions);
    enforceStrictSqlMode(pool);
  }
  return pool;
}

export async function testMySQLConnection(): Promise<boolean> {
  const p = getPool();
  if (!p) {
    console.log('[Database] MySQL environment variables not detected. Running in memory-store mode.');
    return false;
  }

  try {
    const connection = await p.getConnection();
    await connection.ping();
    connection.release();
    isConnected = true;
    console.log(`[Database] Successfully connected to local MySQL database '${getMySQLConfig()?.database}'!`);
    return true;
  } catch (err: any) {
    console.error(`[Database] Failed to connect to MySQL database: ${err.message}`);
    console.warn('[Database] Gracefully falling back to in-memory store for dev stability.');
    isConnected = false;
    return false;
  }
}

export async function withTransaction<T>(
  fn: (conn: PoolConnection) => Promise<T>,
  pool: Pool = getPool()!
): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function executeQuery<T extends RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params: any[] = []
): Promise<T> {
  const p = getPool();
  if (!p) {
    throw new Error('MySQL pool is not configured. Check environment variables.');
  }

  const [results] = await p.execute<T>(sql, params);
  return results;
}
