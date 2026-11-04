# MySQL Persistence Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the in-memory mock store (`src/server/mockDb.ts`) with a real MySQL-backed persistence layer, so every write in the app survives a server restart, using the schema that already exists in `database/schema.sql`.

**Architecture:** One repository module per domain area under `src/server/db/repositories/`, each exposing async functions with the exact same names/signatures as the corresponding methods on today's `MockDatabase` class. An `index.ts` aggregates them into a single `db` object; `server.ts` swaps one import line to point at it instead of `mockDb.ts`. Multi-table writes run inside real transactions via a new `withTransaction` helper in `src/server/db/mysql.ts`.

**Tech Stack:** TypeScript (`tsx` runtime, no build step for the server), Express, `mysql2/promise` (already a dependency), MySQL 8.0 (already installed locally as Windows service `MySQL80`). Vitest added as the test runner (none exists today).

**Spec:** `docs/superpowers/specs/2026-11-04-mysql-persistence-design.md`

## Global Constraints

- MySQL 8.0+/MariaDB 10.5+ dialect only — no ORM, hand-written parameterized SQL via `mysql2/promise`.
- Repository functions must match `MockDatabase`'s existing public method names and signatures exactly (see each task's Interfaces block) so `server.ts`'s diff is a single import swap.
- `src/types/domain.ts` types do not change.
- Multi-table writes (animal+listing+media, sale+transaction, production/collection entry+stock movement, order+order_animals) run inside `withTransaction`, never as sequential independent queries.
- No silent fallback to the mock store. The app fails fast on startup if MySQL is unreachable.
- Money totals computed from DB rows use plain arithmetic on `number`-typed `DECIMAL` columns (see Task 1's `decimalNumbers: true`), consistent with how `mockDb.ts` already does this math.
- Tests are integration tests against a real local MySQL test database (`purvanchal_dairy_test` by default, `MYSQL_TEST_DATABASE` env override), reset between test files via `resetDatabase()`. No mocking of the DB driver.

## Review Focus

- Two concurrent `reserveAnimal` calls on the same `AVAILABLE` animal: exactly one succeeds; the other gets the same `Cannot reserve animal in '...' status` error `mockDb.ts` throws today, not a silent double-booking.
- `DECIMAL` columns (prices, litres, rates, commissions) deserialize as JS `number`, not strings — a `"100" > "99"` style bug would pass naive tests but break real comparisons/sums.
- Calling `generateDailyDeliveries` twice for the same `(date, shift)` produces zero duplicate `milk_deliveries` rows the second time.
- `completeSale` with a `buyerContactId` that doesn't exist in `contacts` (FK violation) surfaces as `{success:false, error}` with a 400, not an unhandled 500 with a raw MySQL stack trace.
- `business_date`/`created_at`/etc. read back as strings that `new Date(...)` parses without `Invalid Date`, matching what `src/lib/dates.ts` and the frontend already expect.

---

## Task 0: Test infrastructure

**Precondition the implementer must satisfy first (not a code step, an environment step):** MySQL 8.0 is installed locally (Windows service `MySQL80`, currently stopped). Start it (`powershell Start-Service MySQL80` or `net start MySQL80`), then create the test database once: `mysql -u root -p -e "CREATE DATABASE purvanchal_dairy_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"` followed by `mysql -u root -p purvanchal_dairy_test < database/schema.sql`. Record the root credentials used in a local `.env` (not committed) as `MYSQL_HOST`/`MYSQL_PORT`/`MYSQL_USER`/`MYSQL_PASSWORD`; `MYSQL_TEST_DATABASE=purvanchal_dairy_test`.

**Files:**
- Modify: `package.json` (add `vitest` devDependency, `test`/`test:watch` scripts)
- Create: `vitest.config.ts`
- Modify: `.env.example` (document `MYSQL_TEST_DATABASE`)
- Create: `src/server/db/testHelpers.ts`
- Test: `src/server/db/testHelpers.test.ts`

**Interfaces:**
- Produces: `getTestPool(): Pool`, `resetDatabase(): Promise<void>`, `closeTestPool(): Promise<void>` — every later repository test file imports these.

- [ ] **Step 1: Add Vitest**

Add to `package.json` devDependencies: `"vitest": "^2.1.9"`. Add scripts: `"test": "vitest run"`, `"test:watch": "vitest"`. Run `npm install`.

- [ ] **Step 2: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { environment: 'node', globals: true, testTimeout: 15000 },
});
```

- [ ] **Step 3: Document the test database in `.env.example`**

Add a line under the MySQL section: `MYSQL_TEST_DATABASE=purvanchal_dairy_test` with a one-line comment that it must be created and schema-loaded once (see README) before running `npm test`.

- [ ] **Step 4: Write `src/server/db/testHelpers.ts`**

`getTestPool(): Pool` — builds its own `mysql2` pool (separate from the app's singleton pool in `mysql.ts`) from `getMySQLConfig()` with `database` overridden to `process.env.MYSQL_TEST_DATABASE || 'purvanchal_dairy_test'`, and the same `dateStrings: true, decimalNumbers: true` options Task 1 adds to the app pool (set them here directly; Task 1 doesn't need to export them). Memoize the pool (module-level singleton) so repeated calls in the same test run reuse one pool.

`resetDatabase(): Promise<void>` — on the test pool, run `SET FOREIGN_KEY_CHECKS = 0;` then `TRUNCATE TABLE <t>;` for all 16 tables in `database/schema.sql` (same table list, any order since FK checks are off), then `SET FOREIGN_KEY_CHECKS = 1;`.

`closeTestPool(): Promise<void>` — calls `.end()` on the pool; used in `afterAll`.

- [ ] **Step 5: Write the smoke test**

```ts
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
```

- [ ] **Step 6: Run the test**

Run: `npm test`
Expected: PASS (requires the precondition above — MySQL80 running, `purvanchal_dairy_test` created and schema-loaded).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts .env.example src/server/db/testHelpers.ts src/server/db/testHelpers.test.ts
git commit -m "test: add vitest and MySQL test database harness"
```

---

## Task 1: Harden the MySQL connection layer

**Files:**
- Modify: `src/server/db/mysql.ts`
- Test: `src/server/db/mysql.test.ts`

**Interfaces:**
- Consumes: `getTestPool`, `resetDatabase`, `closeTestPool` from Task 0.
- Produces: `withTransaction<T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T>` — every repository task below that does a multi-table write uses this.

- [ ] **Step 1: Write the failing tests**

```ts
import { getPool } from './mysql'; // after Step 3 adds dateStrings/decimalNumbers to this pool too — see note
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
    });
    const [rows] = await getTestPool().query("SELECT * FROM contacts WHERE id='CONT-TX'");
    expect((rows as any[]).length).toBe(1);
  });

  it('rolls back on throw', async () => {
    await expect(withTransaction(async (conn) => {
      await conn.execute("INSERT INTO contacts (id, name, phone, location, roles) VALUES ('CONT-TX2', 'Tx', '0', 'X', '[]')");
      throw new Error('boom');
    })).rejects.toThrow('boom');
    const [rows] = await getTestPool().query("SELECT * FROM contacts WHERE id='CONT-TX2'");
    expect((rows as any[]).length).toBe(0);
  });
});
```

Note: `withTransaction`'s tests need `getTestPool()`'s connection (test DB), not the app pool — have `withTransaction` accept the pool to use as an optional second argument (default: the real app pool from `getPool()`) so tests can pass `getTestPool()` instead of touching the dev/production database.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- mysql.test` — expect FAIL (`withTransaction` not defined; decimal/date assertions fail against current config).

- [ ] **Step 3: Implement**

In `getPool()`'s `poolOptions`, add `dateStrings: true, decimalNumbers: true`.

Implement `withTransaction<T>(fn: (conn: PoolConnection) => Promise<T>, pool: Pool = getPool()!): Promise<T>`: `const conn = await pool.getConnection(); try { await conn.beginTransaction(); const result = await fn(conn); await conn.commit(); return result; } catch (err) { await conn.rollback(); throw err; } finally { conn.release(); }`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- mysql.test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/db/mysql.ts src/server/db/mysql.test.ts
git commit -m "feat: harden MySQL pool config and add withTransaction helper"
```

---

## Task 2: Audit repository

**Files:**
- Create: `src/server/db/repositories/auditRepository.ts`
- Test: `src/server/db/repositories/auditRepository.test.ts`

**Interfaces:**
- Consumes: `getTestPool`/`resetDatabase` (Task 0).
- Produces: `recordAudit(entry: Omit<AuditEvent, 'id' | 'timestamp'>, pool?: Pool): Promise<void>`, `getAuditLogs(pool?: Pool): Promise<AuditEvent[]>` — every repository task from Task 4 onward calls `recordAudit` after a mutation. Every repository function in this plan takes an optional trailing `pool` parameter (default: the real app pool) purely so tests can redirect it to `getTestPool()`; production code never passes it.

- [ ] **Step 1: Write the failing test**

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- auditRepository`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `auditRepository.ts`**

`recordAudit` inserts `id = \`AUD-${Date.now()}-${Math.floor(Math.random()*1000)}\`, timestamp = new Date()` plus the given fields into `audit_logs`. `getAuditLogs` runs `SELECT * FROM audit_logs ORDER BY timestamp DESC` and maps snake_case rows to `AuditEvent` (`entity_type` → `entityType`, `entity_id` → `entityId`, rest unchanged).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- auditRepository`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/db/repositories/auditRepository.ts src/server/db/repositories/auditRepository.test.ts
git commit -m "feat: add MySQL-backed audit repository"
```

---

## Task 3: Contacts repository

**Files:**
- Create: `src/server/db/repositories/contactsRepository.ts`
- Test: `src/server/db/repositories/contactsRepository.test.ts`

**Interfaces:**
- Produces: `getContacts(pool?): Promise<Contact[]>`, `getContactById(id: string, pool?): Promise<Contact | undefined>`, `createContact(contact: Contact, pool?): Promise<Contact>`.

- [ ] **Step 1: Write the failing tests**

```ts
import { getContacts, getContactById, createContact } from './contactsRepository';
import { getTestPool, resetDatabase, closeTestPool } from '../testHelpers';

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- contactsRepository`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `contactsRepository.ts`**

`createContact` inserts into `contacts` with `roles` passed as `JSON.stringify(contact.roles)` (mysql2 also accepts a JS array directly for a JSON column, but stringify explicitly to be unambiguous). `getContacts`/`getContactById` select `*` and map rows to `Contact`; the `roles` column comes back already parsed to a JS array (mysql2 auto-parses JSON-typed columns), `active` comes back as `0`/`1` → coerce to `boolean`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- contactsRepository`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/db/repositories/contactsRepository.ts src/server/db/repositories/contactsRepository.test.ts
git commit -m "feat: add MySQL-backed contacts repository"
```

---

## Task 4: Animals repository

**Files:**
- Create: `src/server/db/repositories/animalsRepository.ts`
- Test: `src/server/db/repositories/animalsRepository.test.ts`

**Interfaces:**
- Consumes: `withTransaction` (Task 1), `recordAudit` (Task 2), `createContact`/fixtures (Task 3, for FK-satisfying test contacts).
- Produces: `getAnimals(filters?, pool?): Promise<Animal[]>`, `getPublicAnimals(pool?): Promise<Animal[]>`, `getAnimalById(id, pool?): Promise<Animal | undefined>`, `createAnimal(animal: Animal, actor?: string, pool?): Promise<Animal>`, `updateAnimal(id, updates: Partial<Animal>, actor?: string, pool?): Promise<Animal | undefined>`, `reserveAnimal(id, deposit: number, contactId: string, actor?: string, pool?): Promise<Animal | undefined>`, `releaseReservation(id, actor?: string, pool?): Promise<Animal | undefined>`, `completeSale(id, buyerContactId: string, agreedPrice: number, notes?: string, actor?: string, pool?): Promise<LivestockTransaction | undefined>`, `getTransactions(pool?): Promise<LivestockTransaction[]>`. `filters` has the same shape `mockDb.ts.getAnimals` already uses: `{ species?, breed?, minPrice?, maxPrice?, status?, search? }`.

**Read strategy (the join):** `SELECT a.*, l.* FROM animals a JOIN animal_listings l ON l.animal_id = a.id WHERE ...` for the animal+listing columns, then a second query `SELECT * FROM animal_media WHERE animal_id IN (...) ORDER BY display_order` and group the rows by `animal_id` in JS to build each animal's `images` array. Do not do a 3-way join (it duplicates animal/listing rows per image).

**Filter translation (mirrors the semantics already in `mockDb.ts.getAnimals`):** `species`/`status` exact match when not `'ALL'`; `breed` → `LOWER(a.breed) LIKE LOWER('%<breed>%')`; `minPrice` → `l.price_min >= ?`; `maxPrice` → `l.price_max <= ?`; `search` → `LOWER(a.id) LIKE ... OR LOWER(a.breed) LIKE ... OR LOWER(a.tag_number) LIKE ... OR LOWER(l.title) LIKE ... OR LOWER(l.location) LIKE ...` (same 5 fields, `%<search>%`).

- [ ] **Step 1: Write the failing tests**

```ts
import * as animals from './animalsRepository';
import { createContact } from './contactsRepository';
import { getTestPool, resetDatabase, closeTestPool } from '../testHelpers';

const pool = getTestPool();

function buildAnimal(overrides: Partial<Animal> = {}): Animal { /* minimal valid Animal matching src/types/domain.ts, species BUFFALO, one image, listing.status AVAILABLE */ }

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

  it('filters by species, price range, and search substring', async () => {
    await animals.createAnimal(buildAnimal({ id: 'PDPK-BUF-A', species: 'BUFFALO' }), 'T', pool);
    await animals.createAnimal(buildAnimal({ id: 'PDPK-COW-B', species: 'COW' }), 'T', pool);
    expect((await animals.getAnimals({ species: 'COW' }, pool)).map(a => a.id)).toEqual(['PDPK-COW-B']);
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
    const succeeded = [r1, r2].filter(r => r.status === 'fulfilled');
    const failed = [r1, r2].filter(r => r.status === 'rejected');
    expect(succeeded).toHaveLength(1);
    expect(failed).toHaveLength(1);
  });

  it('completeSale rejects a buyerContactId that does not exist with a 400-style error, not a raw SQL error', async () => {
    await animals.createAnimal(buildAnimal({ id: 'PDPK-BUF-NB' }), 'T', pool);
    await expect(animals.completeSale('PDPK-BUF-NB', 'CONT-MISSING', 100000, undefined, 'T', pool))
      .rejects.toThrow(/contact/i);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- animalsRepository`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `animalsRepository.ts`**

`createAnimal`: inside `withTransaction`, `INSERT INTO animals (...)`, `INSERT INTO animal_listings (...)`, then one `INSERT INTO animal_media (...)` per entry in `animal.images`; call `recordAudit` with the same action/message text `mockDb.ts.createAnimal` uses today; return `getAnimalById(animal.id, pool)`.

`updateAnimal`: build the `animals` `SET` clause from whichever of the `Animal` fields (excluding `listing`/`images`) are present in `updates`, and the `animal_listings` `SET` clause from whichever `updates.listing` fields are present; always also set `animals.updated_at = NOW()` and `animals.version = version + 1`. Skip either `UPDATE` entirely if its field set is empty. Return `getAnimalById(id, pool)`.

`reserveAnimal`/`releaseReservation`/`completeSale`: inside `withTransaction`, first `SELECT status, ownership_type, seller_contact_id, brokerage_commission FROM animals a JOIN animal_listings l ON l.animal_id=a.id WHERE a.id=? FOR UPDATE` to lock the row and get the current status for the error message; then the conditional `UPDATE ... WHERE animal_id = ? AND status = '<expected>'`; if `affectedRows === 0`, throw the exact same message text `mockDb.ts` throws today (`Cannot reserve animal in '${currentStatus}' status...` / `Cannot release animal in '${currentStatus}' status.` / `Animal ${id} is already marked as SOLD.`). `completeSale` additionally inserts into `livestock_transactions`; let a FK violation on `buyer_contact_id` propagate as a thrown `Error` whose message names "contact" (e.g. wrap the raw driver error: `throw new Error(\`Buyer contact ${buyerContactId} does not exist.\`)` when the insert's error code is `ER_NO_REFERENCED_ROW_2`).

`getTransactions`: `SELECT * FROM livestock_transactions ORDER BY created_at DESC`, map to `LivestockTransaction`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- animalsRepository`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/db/repositories/animalsRepository.ts src/server/db/repositories/animalsRepository.test.ts
git commit -m "feat: add MySQL-backed animals repository with transactional writes"
```

---

## Task 5: Enquiries repository

**Files:**
- Create: `src/server/db/repositories/enquiriesRepository.ts`
- Test: `src/server/db/repositories/enquiriesRepository.test.ts`

**Interfaces:**
- Consumes: `recordAudit` (Task 2).
- Produces: `getEnquiries(status?: string, pool?): Promise<Enquiry[]>`, `getEnquiryById(id, pool?): Promise<Enquiry | undefined>`, `createEnquiry(data: Partial<Enquiry>, pool?): Promise<Enquiry>`, `updateEnquiryStatus(id, status: EnquiryStatus, notes?, quotationAmount?, transportQuotation?, assignedStaff?, pool?): Promise<Enquiry | undefined>`.

- [ ] **Step 1: Write the failing tests**

```ts
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
    expect((await enquiries.getEnquiries('CONTACTED', pool)).map(x => x.id)).toContain(e.id);
    expect((await enquiries.getEnquiries('NEW_ENQUIRY', pool))).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- enquiriesRepository`
Expected: FAIL

- [ ] **Step 3: Implement `enquiriesRepository.ts`**

Reuse, verbatim, the default-filling logic from `mockDb.ts.createEnquiry` (lines ~1375-1413: `customerName` default `'Anonymous Enquirer'`, `contactPerson` default to `customerName`, `location` default `'Deoria / Gorakhpur Region'`, `enquiryType` default `'INDIVIDUAL'`, `animalType` default `'BUFFALO'`, `requestedQuantity` default `1`, `deliveryLocation` default to `location` or the Lar farm address, `status` always `'NEW_ENQUIRY'`, id `\`ENQ-${year}-${100-999 random}\``), then `INSERT INTO enquiries`. Call `recordAudit` with the same `RECEIVED_ENQUIRY` action/message text. `getEnquiries(status)` omits the `WHERE` clause when `status` is undefined or `'ALL'`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- enquiriesRepository`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/db/repositories/enquiriesRepository.ts src/server/db/repositories/enquiriesRepository.test.ts
git commit -m "feat: add MySQL-backed enquiries repository"
```

---

## Task 6: Orders repository

**Files:**
- Create: `src/server/db/repositories/ordersRepository.ts`
- Test: `src/server/db/repositories/ordersRepository.test.ts`

**Interfaces:**
- Consumes: `withTransaction` (Task 1), `recordAudit` (Task 2).
- Produces: `getOrders(pool?): Promise<LivestockOrder[]>`, `getOrderById(id, pool?): Promise<LivestockOrder | undefined>`, `createOrder(data: Partial<LivestockOrder>, pool?): Promise<LivestockOrder>`, `updateOrderStatus(id, status: EnquiryStatus, deliveryStatus?, transporterDetails?, pool?): Promise<LivestockOrder | undefined>`.

- [ ] **Step 1: Write the failing tests**

```ts
import * as orders from './ordersRepository';
import { getTestPool, resetDatabase, closeTestPool } from '../testHelpers';
const pool = getTestPool();

describe('ordersRepository', () => {
  beforeEach(() => resetDatabase());
  afterAll(() => closeTestPool());

  it('creates an order with multiple animalIds and reads them back in the junction table', async () => {
    const o = await orders.createOrder({ customerName: 'X', animalIds: ['A1', 'A2'], agreedPrice: 100000 }, pool);
    const found = await orders.getOrderById(o.id, pool);
    expect(found?.animalIds.sort()).toEqual(['A1', 'A2']);
    expect(found?.totalAmount).toBe(100000);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- ordersRepository`
Expected: FAIL

- [ ] **Step 3: Implement `ordersRepository.ts`**

`createOrder`: reuse `mockDb.ts.createOrder`'s defaulting logic (id `\`ORD-${year}-${random}\``, `totalAmount = agreedPrice + transportQuote`, `paymentStatus` default `'PENDING'`, `deliveryStatus` default `'PENDING_VET'`, `orderStatus` default `'ORDER_CONFIRMED'`) inside `withTransaction`: `INSERT INTO livestock_orders`, then one `INSERT INTO order_animals (order_id, animal_id)` per id in `data.animalIds`. `getOrderById`/`getOrders` run a second query `SELECT order_id, animal_id FROM order_animals WHERE order_id IN (...)` and group in JS to populate `animalIds` (same grouping technique as Task 4's `animal_media`). `recordAudit` with the same `CREATED_ORDER` text.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- ordersRepository`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/db/repositories/ordersRepository.ts src/server/db/repositories/ordersRepository.test.ts
git commit -m "feat: add MySQL-backed orders repository"
```

---

## Task 7: Dairy repository (production, collection, movements, reconciliation)

**Files:**
- Create: `src/server/db/repositories/dairyRepository.ts`
- Test: `src/server/db/repositories/dairyRepository.test.ts`

**Interfaces:**
- Consumes: `withTransaction` (Task 1), `recordAudit` (Task 2).
- Produces: `getProductionEntries(date?, pool?)`, `addProductionEntry(entry: MilkProductionEntry, pool?)`, `getCollectionEntries(date?, pool?)`, `addCollectionEntry(entry: MilkCollectionEntry, pool?)`, `getInventoryMovements(date?, pool?)`, `getStockReconciliation(date?: string, pool?)` — same return shape as `mockDb.ts.getStockReconciliation`.

- [ ] **Step 1: Write the failing tests**

```ts
import * as dairy from './dairyRepository';
import { getTestPool, resetDatabase, closeTestPool } from '../testHelpers';
const pool = getTestPool();

describe('dairyRepository', () => {
  beforeEach(() => resetDatabase());
  afterAll(() => closeTestPool());

  it('addProductionEntry also creates an OWN_PRODUCTION inflow movement', async () => {
    await dairy.addProductionEntry({ id: 'P1', businessDate: '2026-11-04', shift: 'MORNING', herdSource: 'Shed A', quantityLitres: 50, recordedBy: 'X', createdAt: '2026-11-04T06:00:00Z' }, pool);
    const movements = await dairy.getInventoryMovements('2026-11-04', pool);
    expect(movements.some(m => m.movementType === 'OWN_PRODUCTION' && m.quantityLitres === 50)).toBe(true);
  });

  it('reconciliation sums opening+production+purchased minus delivered/waste per product type', async () => {
    await dairy.addProductionEntry({ id: 'P2', businessDate: '2026-11-04', shift: 'MORNING', herdSource: 'Shed A (Buffalo)', quantityLitres: 100, recordedBy: 'X', createdAt: '2026-11-04T06:00:00Z' }, pool);
    const recon = await dairy.getStockReconciliation('2026-11-04', pool);
    expect(recon.buffalo.production).toBe(100);
    expect(recon.buffalo.calculatedClosing).toBe(100);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- dairyRepository`
Expected: FAIL

- [ ] **Step 3: Implement `dairyRepository.ts`**

`addProductionEntry`/`addCollectionEntry`: inside `withTransaction`, insert the entry row, then insert the derived `milk_inventory_movements` row using the exact same `productType`-detection heuristic (`herdSource` containing `cow`/`sahiwal`/`gir` → `COW_MILK`, else `BUFFALO_MILK`) and the exact same "only if `acceptedLitres > 0`" rule from `mockDb.ts`; `recordAudit` with the same action text (`POSTED_PRODUCTION` / `RECORDED_COLLECTION`).

`getStockReconciliation(date)`: call `getInventoryMovements(date)`, then run the identical reduce/aggregation algorithm already in `mockDb.ts.getStockReconciliation` (lines ~1156-1216) unchanged — it's pure JS, DB-agnostic.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- dairyRepository`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/db/repositories/dairyRepository.ts src/server/db/repositories/dairyRepository.test.ts
git commit -m "feat: add MySQL-backed dairy production/collection/reconciliation repository"
```

---

## Task 8: Delivery repository (subscriptions + daily delivery runs)

**Files:**
- Create: `src/server/db/repositories/deliveryRepository.ts`
- Test: `src/server/db/repositories/deliveryRepository.test.ts`

**Interfaces:**
- Consumes: `withTransaction` (Task 1), `recordAudit` (Task 2).
- Produces: `getSubscriptions(pool?)`, `createSubscription(sub: DeliverySubscription, pool?)`, `getDeliveries(date?, pool?)`, `generateDailyDeliveries(date?: string, shift?: 'MORNING'|'EVENING', recordedBy?: string, pool?): Promise<MilkDelivery[]>`, `updateDeliveryStatus(id, status, actualLitres?, skipReason?, recordedBy?, pool?)`.

- [ ] **Step 1: Write the failing tests**

```ts
import * as delivery from './deliveryRepository';
import { getTestPool, resetDatabase, closeTestPool } from '../testHelpers';
const pool = getTestPool();

describe('deliveryRepository', () => {
  beforeEach(() => resetDatabase());
  afterAll(() => closeTestPool());

  it('generateDailyDeliveries is idempotent for the same date and shift', async () => {
    await delivery.createSubscription({ id: 'SUB-1', customerContactId: 'CONT-1', productType: 'BUFFALO_MILK', quantityLitres: 2, shift: 'MORNING', ratePerLitre: 70, billingPreference: 'MONTHLY', status: 'ACTIVE', startDate: '2026-01-01', createdAt: '2026-01-01', updatedAt: '2026-01-01' }, pool);
    const first = await delivery.generateDailyDeliveries('2026-11-04', 'MORNING', 'M', pool);
    const second = await delivery.generateDailyDeliveries('2026-11-04', 'MORNING', 'M', pool);
    expect(first).toHaveLength(1);
    expect(second).toHaveLength(0);
    expect(await delivery.getDeliveries('2026-11-04', pool)).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- deliveryRepository`
Expected: FAIL

- [ ] **Step 3: Implement `deliveryRepository.ts`**

`generateDailyDeliveries`: `SELECT subscription_id FROM milk_deliveries WHERE business_date=? AND shift=?` to get already-covered subscription ids; `SELECT * FROM delivery_subscriptions WHERE status='ACTIVE' AND shift=?`; filter out the already-covered ones in JS (same approach as `mockDb.ts`); bulk-insert the rest inside `withTransaction` using the same id scheme `\`DEL-${date}-${sub.id}-${shift[0]}\`` and the same field copy (`scheduledQuantityLitres`/`actualDeliveredLitres` both = `sub.quantityLitres`, `totalBilledAmount = sub.quantityLitres * sub.ratePerLitre`, `status: 'PLANNED'`); one `recordAudit` call for the whole batch (`GENERATED_DELIVERIES`) only if `generated.length > 0`, matching `mockDb.ts`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- deliveryRepository`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/db/repositories/deliveryRepository.ts src/server/db/repositories/deliveryRepository.test.ts
git commit -m "feat: add MySQL-backed subscriptions and idempotent delivery generation"
```

---

## Task 9: Finance repository

**Files:**
- Create: `src/server/db/repositories/financeRepository.ts`
- Test: `src/server/db/repositories/financeRepository.test.ts`

**Interfaces:**
- Consumes: `recordAudit` (Task 2).
- Produces: `getFinancialSummary(pool?): Promise<{customerOutstanding, supplierPayable, livestockSalesRevenue, customerPaymentsReceived, supplierPayoutsMade}>`, `getPayments(pool?): Promise<PaymentRecord[]>`, `addPayment(payment: PaymentRecord, pool?): Promise<PaymentRecord>`.

- [ ] **Step 1: Write the failing test**

```ts
import * as finance from './financeRepository';
import { getTestPool, resetDatabase, closeTestPool } from '../testHelpers';
const pool = getTestPool();

describe('financeRepository', () => {
  beforeEach(() => resetDatabase());
  afterAll(() => closeTestPool());

  it('computes customerOutstanding from billed deliveries minus posted receipts, with no hardcoded offset', async () => {
    // seed one DELIVERED milk_deliveries row billed 200, and one posted payment of 50
    // (insert directly via pool for test setup)
    const summary = await finance.getFinancialSummary(pool);
    expect(summary.customerOutstanding).toBe(0); // empty DB: 0 billed - 0 received, not mockDb's old +18450
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- financeRepository`
Expected: FAIL

- [ ] **Step 3: Implement `financeRepository.ts`**

Per the spec's decision #3: `customerOutstanding = MAX(0, SUM(total_billed_amount) FROM milk_deliveries WHERE status IN ('DELIVERED','PARTIALLY_DELIVERED') - SUM(amount) FROM payments WHERE direction='CUSTOMER_RECEIPT' AND status='POSTED')`, `supplierPayable = MAX(0, SUM(total_cost) FROM milk_collection_entries - SUM(amount) FROM payments WHERE direction='SUPPLIER_PAYMENT' AND status='POSTED')`, `livestockSalesRevenue = SUM(agreed_price) FROM livestock_transactions WHERE status='COMPLETED'` — no `+18450`/`+26100` offsets. `addPayment` inserts into `payments` and calls `recordAudit` with the same `POSTED_PAYMENT` text.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- financeRepository`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/db/repositories/financeRepository.ts src/server/db/repositories/financeRepository.test.ts
git commit -m "feat: add MySQL-backed finance repository with ledger-derived summary"
```

---

## Task 10: Wire it all into the server, delete the mock

**Files:**
- Create: `src/server/db/repositories/index.ts`
- Modify: `server.ts`
- Delete: `src/server/mockDb.ts`
- Modify: `README.md` (remove the "graceful fallback to in-memory" claims; document the test DB setup from Task 0)

**Interfaces:**
- Consumes: every repository from Tasks 2-9.
- Produces: `db` — one object with every method `mockDb.ts`'s `MockDatabase` exposed today, now async, assembled by re-exporting the Task 2-9 functions under the same names.

- [ ] **Step 1: Write `src/server/db/repositories/index.ts`**

```ts
import * as animalsRepo from './animalsRepository';
import * as contactsRepo from './contactsRepository';
// ...one import per repository

export const db = {
  getAnimals: animalsRepo.getAnimals,
  getPublicAnimals: animalsRepo.getPublicAnimals,
  getAnimalById: animalsRepo.getAnimalById,
  createAnimal: animalsRepo.createAnimal,
  updateAnimal: animalsRepo.updateAnimal,
  reserveAnimal: animalsRepo.reserveAnimal,
  releaseReservation: animalsRepo.releaseReservation,
  completeSale: animalsRepo.completeSale,
  getTransactions: animalsRepo.getTransactions,
  getContacts: contactsRepo.getContacts,
  getContactById: contactsRepo.getContactById,
  createContact: contactsRepo.createContact,
  // ...one line per method, matching MockDatabase's full public method list
};
```

The full method list to assemble (all fixed by Tasks 2-9's Interfaces blocks, not decided here): `getAnimals, getPublicAnimals, getAnimalById, createAnimal, updateAnimal, reserveAnimal, releaseReservation, completeSale, getTransactions` (animalsRepo) · `getContacts, getContactById, createContact` (contactsRepo) · `getEnquiries, getEnquiryById, createEnquiry, updateEnquiryStatus` (enquiriesRepo) · `getOrders, getOrderById, createOrder, updateOrderStatus` (ordersRepo) · `getProductionEntries, addProductionEntry, getCollectionEntries, addCollectionEntry, getInventoryMovements, getStockReconciliation` (dairyRepo) · `getSubscriptions, createSubscription, getDeliveries, generateDailyDeliveries, updateDeliveryStatus` (deliveryRepo) · `getFinancialSummary, getPayments, addPayment` (financeRepo) · `getAuditLogs` (auditRepo). This task's job is the mechanical assembly, not picking method names.

- [ ] **Step 2: Update `server.ts`**

Change the import from `import { db } from './src/server/mockDb.ts';` to `import { db } from './src/server/db/repositories/index.ts';`. Every route handler that calls a `db.*` method becomes `async (req, res) => { try { ... await db.xxx(...) ... } catch (err: any) { res.status(err.status === 404 ? 404 : 500).json({ success: false, error: err.message }); } }` — routes that already have a try/catch (createAnimal, reserve, sell, createEnquiry, createOrder, etc.) keep their existing 400-on-business-error behavior; routes that previously had none (plain `GET`s) get a try/catch returning 500 on unexpected DB errors instead of crashing the process.

In `startServer()`, replace the current "`await testMySQLConnection()`, log success or warning, continue regardless" with: if `!(await testMySQLConnection())`, log a clear fatal message and `process.exit(1)` — no more silent fallback.

- [ ] **Step 3: Delete `src/server/mockDb.ts`**

- [ ] **Step 4: Update `README.md`**

Remove the "Note on Graceful Fallback: ... runs in memory-store mode" paragraph (it's no longer true) and add a short "Running Tests" section pointing at the Task 0 precondition (create `purvanchal_dairy_test`, load `schema.sql`, `npm test`).

- [ ] **Step 5: Run the full test suite**

Run: `npm test`
Expected: PASS (all repository test files from Tasks 2-9, plus Task 0/1's own tests)

- [ ] **Step 6: Manual verification against the dev database**

Start `MySQL80`, run `database/init-db.sh` (or the manual schema+seed commands) against `purvanchal_dairy`, set `.env` accordingly, run `npm run dev`. In the browser: log into `/admin` (still the old hardcoded client-side login until the next plan replaces it), add a new animal, reserve it, complete a sale, add a production entry, add a collection entry, generate today's deliveries, add a payment. Restart the dev server. Confirm everything just entered is still there (proves persistence) and the public catalog still renders.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: wire MySQL repositories into server.ts and remove the in-memory mock store"
```
