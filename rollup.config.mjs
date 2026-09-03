import { defineConfig } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'

const external = (id) => id.startsWith('.') || id.startsWith('/') ? false : !id.startsWith('\0')

const esbuildPlugin = (loader = 'jsx') =>
  esbuild({ target: 'es2017', loader, jsx: 'transform' })

// Rewrites bare `lodash` specifiers to `lodash-es` in the ESM build so that
// bundlers can tree-shake lodash (mirrors the removed babel-plugin-transform-rename-import).
const renameLodashToEs = {
  name: 'rename-lodash-to-es',
  renderChunk(code) {
    return code.replace(/(["'])lodash(["'])/g, "$1lodash-es$2")
  },
}

export default defineConfig([
  {
    input: 'src/index.js',
    output: {
      dir: 'dist/commonjs',
      format: 'cjs',
      preserveModules: true,
      preserveModulesRoot: 'src',
      exports: 'named',
      entryFileNames: '[name].js',
    },
    external,
    treeshake: false,
    plugins: [esbuildPlugin()],
  },
  {
    input: 'src/index.js',
    output: {
      dir: 'dist/es',
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].js',
    },
    external,
    treeshake: false,
    plugins: [esbuildPlugin(), renameLodashToEs],
  },
  {
    input: 'src/umd.js',
    output: {
      file: 'dist/umd/react-fomantic-ui.min.js',
      format: 'umd',
      name: 'reactFomanticUI',
      exports: 'named',
      globals: { react: 'React', 'react-dom': 'ReactDOM' },
      plugins: [terser({ format: { comments: false } })],
    },
    external: ['react', 'react-dom'],
    plugins: [
      nodeResolve({ browser: true, preferBuiltins: false }),
      commonjs({ include: /node_modules/ }),
      esbuildPlugin(),
    ],
  },
])
