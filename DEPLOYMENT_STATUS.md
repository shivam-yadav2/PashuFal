# Deployment Status — Champa Dairy & Pashu Kendra (PashuFal)

_Last updated: 2026-11-17_

## Where this is deployed

- **URL:** `https://product.voidlayer.in/pashufal/`
- **Host:** cPanel shared hosting, user `shaadila`, LiteSpeed + CloudLinux "Setup Node.js App" (Phusion Passenger)
- **App root on server:** `/home/shaadila/product.voidlayer.in/pashufal`
- **Startup file:** `dist-server/server.mjs`
- **Node version:** 22.23.4 (via CloudLinux Node Selector virtualenv)

## Current state: fix written locally, NOT yet uploaded/verified

The root cause of the long-running blank-page/404 problem has been identified and fixed in the working
tree, but **these changes are uncommitted and have not been rebuilt or re-uploaded to the server yet.**

### The actual root cause

The app is mounted at the `/pashufal` sub-path. Passenger/LiteSpeed on this host does **not** strip that
prefix before forwarding requests to the Node process — so Express was receiving `/pashufal/assets/foo.js`
and `/pashufal/api/health`, while every route in `server.ts` was registered for the bare path (`/assets/...`,
`/api/...`). Nothing ever matched, so **every single request** (including API calls) fell through to the
SPA catch-all route and got `index.html` back — which is why `/api/health` and the JS/CSS bundles were all
returning HTML instead of their real content, no matter how many times the app was restarted or files
re-uploaded.

### The fix (in the working tree, uncommitted)

1. **`server.ts`** — added middleware that strips a leading `/pashufal` from `req.url` before any routes
   run, so both proxy behaviours (prefix stripped or not) work.
2. **`vite.config.ts`** — set `base: '/pashufal/'` so built `<script>`/`<link>` tags point at the right
   sub-path.
3. **`src/services/api.ts`** — wrapped `fetch` so calls to `/api/...` get the same `/pashufal` prefix
   prepended on the client side (Vite's `base` only rewrites asset tags, not runtime `fetch()` calls).
4. **`index.html` / `public/favicon.svg`** — favicon path updated to match the sub-path, favicon file added.
5. Earlier (already committed in `817652e`): server path resolution was switched from `process.cwd()` to
   `import.meta.url`-based resolution, because this host's Node app manager doesn't reliably launch the
   process with the working directory set to the app root.

### Verified locally

- `npm run build` succeeds.
- `npx tsc --noEmit` — clean.
- `npx vitest run` — 60/60 tests passing.
- Not yet verified against the live server.

## What's left to do

1. Commit these changes (`server.ts`, `vite.config.ts`, `src/services/api.ts`, `index.html`,
   `public/favicon.svg`).
2. `npm run build` → produces fresh `dist/` and `dist-server/server.mjs`.
3. Upload `dist/`, `dist-server/server.mjs`, and `public/favicon.svg` to the server, overwriting what's
   there now.
4. Restart the Node app in cPanel.
5. Confirm fix: `curl -Ik https://product.voidlayer.in/pashufal/api/health` should return JSON, and the
   homepage should load fully styled with working JS.
6. **Security cleanup on the server's environment variables** (seen in a cPanel screenshot during
   troubleshooting): `JWT_SECRET` is still set to the example placeholder
   `super_secret_purvanchal_dairy_key_change_in_production` — this must be replaced with a real random
   secret before this is treated as live/production-safe. Generate one with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
   and set it as `SESSION_SECRET` (preferred name) or `JWT_SECRET` (legacy fallback the code also reads)
   in cPanel's Environment Variables for the app, then restart.
7. Double-check `MYSQL_PASSWORD` on the server — the cPanel screenshot showed it set to the literal string
   `shaadila_pashufal`, identical to the DB name/user. Confirm that's actually the real database password
   and not a placeholder left over from setup.

## Admin login credentials

Admin accounts are never seeded automatically — each one is created explicitly with
`scripts/create-admin.mjs`, which stores only a bcrypt hash (nothing recoverable in plaintext from the
database or from this session's memory alone).

### Local dev database (`purvanchal_dairy`, on this machine)

| Field | Value |
|---|---|
| Username | `owner` |
| Password | `Pashufal@2026` |
| Role | OWNER |

This was just reset (2026-11-17) by running:
```bash
node scripts/create-admin.mjs --username owner --password "Pashufal@2026" --name "Parmeshwar Kushwaha" --role OWNER --phone "9792820684"
```
so this value is known-good as of right now. Change it if you want something else — rerunning the same
command with a new `--password` overwrites it.

### Production database (on the cPanel server)

**Confirmed 2026-11-17 (via phpMyAdmin): one admin account exists** — `owner` / OWNER role, created
2026-11-06, never updated since. This is a **separate database from local dev** (different password
hash, different `updated_at`) — the local dev password above does not work here. The production password
is unknown and unrecoverable (bcrypt hashes can't be reversed). Reset it from the server terminal:

```bash
source /home/shaadila/nodevenv/product.voidlayer.in/pashufal/22/bin/activate
cd /home/shaadila/product.voidlayer.in/pashufal
node scripts/create-admin.mjs --username owner --password "choose-a-strong-password" --name "Parmeshwar Kushwaha" --role OWNER --phone "9792820684"
```

Pick your own password for production — don't reuse the local dev one above.

### `JWT_SECRET` is still the unchanged placeholder value

Confirmed 2026-11-17: production's `JWT_SECRET` env var is literally
`super_secret_purvanchal_dairy_key_change_in_production` — the example value from `.env.example`, never
actually changed. This signs every admin session cookie; leaving it as a publicly-guessable example string
means anyone could forge a valid admin session cookie. Fix this the same way as item 6 above — generate a
real secret and set it as `SESSION_SECRET` (or `JWT_SECRET`) in cPanel, then restart.

## Troubleshooting history (condensed)

For reference, the deployment went through this sequence of issues before the current fix was found:

1. `node_modules` missing/corrupted on server → resolved via clean `npm install --omit=dev --legacy-peer-deps`
   through the CloudLinux virtualenv (the `--legacy-peer-deps` flag is required here, same as locally, due
   to a `vite` vs `esbuild` peer-dependency version conflict).
2. `Cannot find package 'vite'` crash in production → fixed by baking `NODE_ENV=production` into the
   server bundle at **build time** (`scripts/build-server.mjs`), since this host's "Application mode:
   Production" dropdown didn't reliably set the runtime env var.
3. Server path resolution (`process.cwd()`) was unreliable on this host → switched to resolving paths from
   the bundled file's own location (`import.meta.url`).
4. **(Root cause, fixed above)** The `/pashufal` sub-path prefix was never being stripped by the proxy,
   so no route — static or API — ever matched.
