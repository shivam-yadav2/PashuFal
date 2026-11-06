#!/usr/bin/env node
// Bundles server.ts (and everything under src/server/**) into one plain
// JavaScript file, dist-server/server.mjs. This is what actually runs in
// production — not tsx — because:
//   1. cPanel's Node.js Selector (Phusion Passenger) loads the startup file
//      directly with Node; it has no way to run it through a TypeScript
//      loader first.
//   2. It means `tsx`, `typescript`, `vite`, and the whole frontend toolchain
//      don't need to be installed on the production host at all — only the
//      few packages the bundle still imports at runtime (express, mysql2,
//      etc., listed in package.json's "dependencies") do.
import { build } from 'esbuild';
import { mkdirSync } from 'fs';

mkdirSync('dist-server', { recursive: true });

await build({
  entryPoints: ['server.ts'],
  outfile: 'dist-server/server.mjs',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node18',
  packages: 'external', // keep express/mysql2/etc. as real node_modules imports
  sourcemap: true,
  logLevel: 'info',
  // Bake NODE_ENV=production into this bundle at build time, rather than
  // trusting it to be set correctly at runtime. This bundle only ever runs
  // in production, so this is always correct for it — and it lets esbuild
  // dead-code-eliminate the `if (!isProduction)` dev branch (which
  // dynamically imports 'vite') out of the output entirely. Some hosts'
  // "production mode" toggles don't actually set process.env.NODE_ENV the
  // way they claim to; this way the dev branch can't run even then,
  // because it no longer exists in the file.
  define: { 'process.env.NODE_ENV': '"production"' },
  // Constant-folds `"production" === "production"` to `true` and removes the
  // now-dead `if (!isProduction)` branch (and its `import('vite')`) from the
  // output — define alone only substitutes text, this is what actually
  // eliminates the branch.
  minifySyntax: true,
});

console.log('Built dist-server/server.mjs');
