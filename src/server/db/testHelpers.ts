import mysql, { Pool } from 'mysql2/promise';
import { getMySQLConfig } from './mysql';

const ALL_TABLES = [
  'contacts',
  'animals',
  'animal_listings',
  'animal_media',
  'enquiries',
  'livestock_orders',
  'order_animals',
  'livestock_transactions',
  'milk_production_entries',
  'milk_collection_entries',
  'milk_inventory_movements',
  'delivery_subscriptions',
  'milk_deliveries',
  'payments',
  'audit_logs',
  'admin_users',
];

let testPool: Pool | null = null;

export function getTestPool(): Pool {
  if (!testPool) {
    const config = getMySQLConfig();
    if (!config) {
      throw new Error('MySQL environment variables are not configured; cannot build a test pool.');
    }
    testPool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: process.env.MYSQL_TEST_DATABASE || 'purvanchal_dairy_test',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      dateStrings: true,
      decimalNumbers: true,
    });
  }
  return testPool;
}

export async function resetDatabase(): Promise<void> {
  const pool = getTestPool();
  await pool.query('SET FOREIGN_KEY_CHECKS = 0;');
  for (const table of ALL_TABLES) {
    await pool.query(`TRUNCATE TABLE ${table};`);
  }
  await pool.query('SET FOREIGN_KEY_CHECKS = 1;');
}

export async function closeTestPool(): Promise<void> {
  if (testPool) {
    await testPool.end();
    testPool = null;
  }
}
