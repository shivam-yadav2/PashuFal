import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 15000,
    // Integration tests share one physical MySQL test database and each
    // reset it with TRUNCATE in beforeEach; running test files in parallel
    // lets one file's reset/insert race another's. Force sequential files.
    fileParallelism: false,
  },
});
