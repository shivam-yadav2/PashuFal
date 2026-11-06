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
});

console.log('Built dist-server/server.mjs');
