# Deploying to cPanel Shared Hosting (Node.js Selector)

This guide covers deploying this app to shared hosting via cPanel's
**"Setup Node.js App"** tool (built on Phusion Passenger). It's written for
a host where you don't have root/SSH, just the cPanel UI and File Manager —
if you do have SSH, use it; everything is faster that way, and a couple of
steps below need it.

## How this app is built for production

`npm run build` produces two things:

- `dist/` — the compiled React frontend (static HTML/CSS/JS).
- `dist-server/server.mjs` — the Express backend, bundled into one plain
  JavaScript file by esbuild. This is what cPanel's Node Selector actually
  runs. It does **not** run through `tsx` or any TypeScript loader in
  production — cPanel's Passenger integration loads the startup file
  directly with Node, so it has to already be plain JavaScript.

`dist-server/server.mjs` serves `dist/` itself (one process, one port) —
there's no separate static file server to configure.

---

## 1. Before you start

- A cPanel hosting plan with **"Setup Node.js App"** in the cPanel menu
  (look under "Software"). If you don't see it, ask your host to enable it —
  not all shared plans include it.
- A **MySQL database** on the same account (cPanel → "MySQL Databases").
  Shared hosting almost always names these `cpaneluser_dbname` and
  `cpaneluser_dbuser` — cPanel prefixes them automatically.
- Node 18 or newer available in the Node Selector's version dropdown.
- A domain or subdomain pointed at this hosting account.

---

## 2. Build the app locally

Do this on your own machine, not on the shared host — shared hosting CPUs
are usually too weak/slow for a Vite build, and some don't have enough
memory for it either.

```bash
npm install
npm run build
```

Confirm it worked: you should have `dist/` and `dist-server/server.mjs`.

---

## 3. Create the database

In cPanel → **MySQL Databases**:

1. Create a database (e.g. `pashufal`) — cPanel will name it
   `youruser_pashufal`.
2. Create a database user with a strong password.
3. Add that user to the database with **All Privileges**.

Then load the schema. If you have SSH:

```bash
mysql -u youruser_dbuser -p youruser_pashufal < database/schema.sql
```

No SSH? Use **phpMyAdmin** (cPanel → Databases → phpMyAdmin): open the
database, go to the **Import** tab, and upload `database/schema.sql`. If
you want the sample animals/contacts data too, import `database/seed.sql`
the same way afterward — otherwise skip it and start with an empty catalog.

---

## 4. Upload the files

Using **File Manager** or an SFTP client, create a folder **outside**
`public_html` for the app itself — e.g. `/home/youruser/pashufal-app`.
(Node apps on cPanel don't live in `public_html`; the Node Selector creates
its own proxy from your domain to the app.)

Upload:

- `dist/`
- `dist-server/`
- `database/` (handy to have on the server, not required at runtime)
- `package.json` and `package-lock.json`
- `scripts/create-admin.mjs`

You do **not** need to upload: `src/`, `server.ts`, `node_modules/`,
`.git/`, `docs/`, or any `.env` file (set real environment variables through
cPanel instead — see step 6).

---

## 5. Set up the Node.js App in cPanel

cPanel → **Setup Node.js App** → **Create Application**:

| Field | Value |
|---|---|
| Node.js version | 18.x or newer |
| Application mode | Production |
| Application root | the folder from step 4, e.g. `pashufal-app` |
| Application URL | your domain or subdomain |
| Application startup file | `dist-server/server.mjs` |

Click **Create**. cPanel will show an "Enter to the virtual environment"
command — you don't need it unless you're doing something manual via SSH.

---

## 6. Environment variables

Still on the Node App's settings page, scroll to **"Environment
Variables"** and add these (click "Add Variable" for each):

| Name | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MYSQL_HOST` | `localhost` |
| `MYSQL_PORT` | `3306` |
| `MYSQL_USER` | `youruser_dbuser` |
| `MYSQL_PASSWORD` | the database password from step 3 |
| `MYSQL_DATABASE` | `youruser_pashufal` |
| `SESSION_SECRET` | a long random string — **generate one**, don't reuse the example below |
| `SESSION_EXPIRES_IN` | `7d` |
| `VITE_WHATSAPP_NUMBER` | your WhatsApp number, digits only, country code first |
| `VITE_CONTACT_PHONE` | your phone number as it should display |

Generate `SESSION_SECRET` locally and paste the result in:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

This replaces needing a `.env` file at all in production — storing secrets
in cPanel's own environment variable store is safer than a `.env` file
sitting in a web-reachable folder.

Click **Save** after adding the variables.

---

## 7. Install dependencies

On the Node App's page, click **"Run NPM Install"**. This installs
everything listed in `package.json`.

If you have SSH, you can do a lighter, faster install instead — it skips
the frontend build tools (Vite, TypeScript, etc.), which the production
bundle never needs:

```bash
# cPanel prints the exact "enter virtual env" command on the Node App page;
# run that first, then:
npm install --omit=dev
```

---

## 8. Create the admin login

No admin account is shipped or seeded — you create your own. With SSH
(enter the app's virtual environment as cPanel shows you, then):

```bash
node scripts/create-admin.mjs --username owner --password "a-strong-password" --name "Your Name" --role OWNER --phone "9999999999"
```

**No SSH access?** Run this same command on your own machine instead,
pointed at the production database: put the production `MYSQL_*` values
from step 6 into a local `.env` temporarily, run the command, then delete
that `.env` (or change the values back to your local database). The script
only needs network access to MySQL — most hosts allow this from your own
IP once added to cPanel's "Remote MySQL" allow-list (cPanel → Remote
MySQL), or you can tunnel through SSH if direct access is blocked.

Run the same command again later, with the same `--username`, any time you
need to reset that password.

---

## 9. Start and verify

Back on the Node App page, click **Restart**. Then visit your domain:

- The homepage should load.
- `https://yourdomain.com/api/health` should return
  `{"status":"healthy","mysql":{"enabled":true,...}}`.
- Sign in at the admin login (top navigation → "Staff login") with the
  account from step 8.

If `/api/health` doesn't come back `healthy`, check the Node App's
**"Logs"** — the most common cause is a typo in the `MYSQL_*` variables,
or step 3's schema not actually loaded yet.

---

## 10. Domain & SSL

cPanel's **AutoSSL** issues and renews a free certificate for the domain
automatically — nothing to configure in the app for this. Apache (which
cPanel puts in front of your Node app) terminates SSL and forwards plain
HTTP to Node internally; `server.ts` already trusts that proxy correctly.

---

## 11. Deploying an update later

1. `npm run build` locally again.
2. Upload the new `dist/` and `dist-server/` (overwrite the old ones).
3. If `package.json` changed, re-upload it and click **"Run NPM Install"**
   again.
4. If `database/schema.sql` changed, apply just the new parts manually —
   don't re-run the whole file on a live database (it starts with
   `DROP TABLE IF EXISTS`, which would delete your real data). Write a
   small migration instead (see `database/migrations/` for examples) and
   apply only that.
5. Click **Restart** on the Node App page.

---

## Troubleshooting

**"Error: Cannot find module 'express'" on startup** — dependencies
weren't installed for this app; go back to step 7.

**App shows a database connection error** — double check `MYSQL_HOST` is
`localhost` (not `127.0.0.1` — some shared hosts route these differently)
and that the database user was added to the database with a privilege
level, not just created.

**Changes don't show up after restarting** — some browsers aggressively
cache the old `dist/assets/*.js`; hard-refresh (Ctrl+Shift+R), or confirm
you actually re-uploaded the new `dist/` folder.

**502 / "Web Application Could Not Be Started"** — open the Node App's
Logs. This almost always means `dist-server/server.mjs` doesn't exist yet
(the build wasn't uploaded) or a required environment variable from step 6
is missing — the app is designed to exit with a clear log message rather
than start half-broken, so the log will say exactly which one.

---

## Before you call it live: a short security checklist

- [ ] `SESSION_SECRET` is a fresh random value, not the example in this file.
- [ ] The database user's password is strong and different from any other account.
- [ ] You've created your own admin login (step 8) and can sign in with it.
- [ ] `NODE_ENV=production` is set (secure cookies and stricter headers depend on it).
- [ ] No `.env` file was uploaded to the server (secrets live in cPanel's environment variables instead).
- [ ] You've tried logging into `/admin` from a normal browser once, end to end.
