import path from 'path'
import { fileURLToPath } from 'url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

/** @type {import('@storybook/react-vite').StorybookConfig} */
export default {
  framework: '@storybook/react-vite',

  // Stories sit beside the examples they render. Relative imports keep
  // Chromatic's TurboSnap dependency graph tight: a story depends on its own
  // examples and nothing else, so touching one component does not invalidate
  // the other 900 snapshots. A run-time `import.meta.glob` would.
  stories: ['../docs/src/examples/**/*.stories.js'],

  addons: [],

  viteFinal: (config) => ({
    ...config,

    // src/ is .js containing JSX, which esbuild only parses when told —
    // the same hint vitest.config.mjs gives.
    esbuild: { ...config.esbuild, loader: 'jsx', include: /\.jsx?$/, exclude: [] },
    optimizeDeps: {
      ...config.optimizeDeps,
      esbuildOptions: {
        ...config.optimizeDeps?.esbuildOptions,
        loader: { ...config.optimizeDeps?.esbuildOptions?.loader, '.js': 'jsx' },
      },
    },

    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        // The examples import the package by name, as a consumer writes them.
        'react-fomantic-ui': path.join(root, 'src'),
      },
    },
  }),
}
