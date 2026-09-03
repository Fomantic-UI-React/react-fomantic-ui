import path from 'path'
import { fileURLToPath } from 'url'

import { defineConfig } from 'vitest/config'

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  // The source tree is .js containing JSX, which esbuild only parses when told.
  esbuild: { loader: 'jsx', include: /\.jsx?$/, exclude: [] },
  optimizeDeps: { esbuildOptions: { loader: { '.js': 'jsx' } } },

  resolve: {
    alias: {
      src: path.join(root, 'src'),
      test: path.join(root, 'test'),
    },
  },

  test: {
    // Only the ported specs. test/specs stays frozen until it is empty —
    // see "Phase 2" in PLAN.md.
    include: ['test/unit/**/*-test.js'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['test/setup.js'],
    restoreMocks: true,
    fsModuleCache: true,
    unstubEnvs: true,
  },
})
