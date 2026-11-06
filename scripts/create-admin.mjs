#!/usr/bin/env node
// Creates or updates an admin/manager login. Run locally during setup and
// again on the server any time you need to add a user or reset a password.
//
// Usage:
//   node scripts/create-admin.mjs --username owner --password "a-strong-password" --name "Parmeshwar Kushwaha" --role OWNER --phone "9792820684"
//
// Reads DB connection info from the same env vars as the app (.env in this
// directory, or real environment variables in production):
//   MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
//
// Plain Node + bcryptjs + mysql2 only — no TypeScript/tsx needed, so this
// runs on a production host that only has the "dependencies" installed.

import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
      out[key] = value;
    }
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const username = (args.username || '').trim().toLowerCase();
  const password = args.password || '';
  const fullName = args.name || username;
  const role = (args.role || 'MANAGER').toUpperCase();
  const phone = args.phone || '';

  if (!username || !password) {
    console.error('Usage: node scripts/create-admin.mjs --username <u> --password <p> --name "<Full Name>" --role OWNER|MANAGER --phone <phone>');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Error: password must be at least 8 characters.');
    process.exit(1);
  }
  if (!['OWNER', 'MANAGER'].includes(role)) {
    console.error('Error: --role must be OWNER or MANAGER.');
    process.exit(1);
  }

  const host = process.env.MYSQL_HOST;
  const database = process.env.MYSQL_DATABASE;
  const user = process.env.MYSQL_USER;
  if (!host || !database || !user) {
    console.error('Error: MYSQL_HOST, MYSQL_DATABASE and MYSQL_USER must be set (via .env or real env vars).');
    process.exit(1);
  }

  const pool = mysql.createPool({
    host,
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user,
    password: process.env.MYSQL_PASSWORD,
    database,
  });

  const hash = await bcrypt.hash(password, 12);
  const [existing] = await pool.query('SELECT id FROM admin_users WHERE username = ?', [username]);

  if (existing.length > 0) {
    await pool.execute(
      'UPDATE admin_users SET password_hash = ?, full_name = ?, role = ?, phone = ?, is_active = TRUE WHERE username = ?',
      [hash, fullName, role, phone, username]
    );
    console.log(`Updated existing user "${username}" (password reset, role set to ${role}).`);
  } else {
    const id = `ADM-${randomUUID().slice(0, 8).toUpperCase()}`;
    await pool.execute(
      'INSERT INTO admin_users (id, username, password_hash, full_name, role, phone, is_active) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
      [id, username, hash, fullName, role, phone]
    );
    console.log(`Created new ${role} user "${username}" (id ${id}).`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
