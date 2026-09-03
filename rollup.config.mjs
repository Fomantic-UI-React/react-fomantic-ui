import fs from 'fs'
import { createRequire } from 'module'
import path from 'path'

import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import terser from '@rollup/plugin-terser'
import { defineConfig } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'

import {
  dropUseStrict,
  guardPropTypes,
  lodashCherryPick,
  stripDebug,
  useClientDirective,
} from './build/plugins.mjs'

const pkg = createRequire(import.meta.url)('./package.json')

// Everything but relative paths, absolute paths and rollup's virtual modules is
// a peer or runtime dependency of the published package.
const external = (id) => !(id.startsWith('.') || id.startsWith('\0') || path.isAbsolute(id))

const transpile = () => esbuild({ target: 'es2017', loader: 'jsx', jsx: 'transform' })

// Order matters: esbuild strips the JSX that the AST plugins below cannot parse.
const transforms = (lodashModule) => [
  transpile(),
  dropUseStrict(),
  lodashCherryPick({ moduleName: lodashModule }),
  guardPropTypes(),
  stripDebug(),
]

// `useMergedRefs` and friends are hooks that do not carry a client-only name of
// their own, so the directive pass needs them spelled out — same list the old
// babel-plugin-transform-next-use-client config carried.
const clientDirective = () =>
  useClientDirective({
    customClientImports: ['useAutoControlledValue', 'useEventCallback', 'useMergedRefs'],
  })

// Every directory that re-exports a component also needs its own `index.js` in
// dist so that deep imports keep resolving. Rollup folds a chunk whose only
// content is a re-export into the module it points at, so each one is declared
// as an entry instead of being patched back in after the build.
const indexEntries = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return indexEntries(full)
    return entry.name === 'index.js' ? [full] : []
  })

const entries = indexEntries('src')

const preserved = (dir, format) => ({
  dir,
  format,
  preserveModules: true,
  preserveModulesRoot: 'src',
  exports: 'named',
  entryFileNames: '[name].js',
})

export default defineConfig([
  {
    input: entries,
    output: preserved('dist/commonjs', 'cjs'),
    external,
    treeshake: false,
    plugins: [...transforms('lodash'), clientDirective()],
  },
  {
    input: entries,
    output: preserved('dist/es', 'esm'),
    external,
    treeshake: false,
    plugins: [...transforms('lodash-es'), clientDirective()],
  },
  {
    input: 'src/umd.js',
    output: {
      file: `dist/umd/${pkg.name}.min.js`,
      format: 'umd',
      name: 'reactFomanticUI',
      exports: 'named',
      globals: { react: 'React', 'react-dom': 'ReactDOM' },
      // `comments: 'some'` keeps `@license` / `@preserve` banners, which the MIT
      // and BSD notices of the bundled dependencies require us to redistribute.
      plugins: [terser({ format: { comments: 'some' } })],
    },
    external: ['react', 'react-dom'],
    plugins: [
      // A <script> tag has no `process`. Without this the bundle throws
      // `ReferenceError: process is not defined` before it exports anything.
      replace({
        preventAssignment: true,
        values: { 'process.env.NODE_ENV': JSON.stringify('production') },
      }),
      nodeResolve({ browser: true, preferBuiltins: false }),
      commonjs({ include: /node_modules/ }),
      ...transforms('lodash-es'),
    ],
  },
])
