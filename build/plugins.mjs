/**
 * Rollup plugins that replace the transforms the old `.babel-preset.js` applied.
 *
 * Dropping Babel dropped five build-time behaviours that consumers depend on.
 * Each one is reimplemented here against the ESTree AST that `this.parse()`
 * returns, and each is asserted by `scripts/verify-build.js`:
 *
 *   babel-plugin-lodash                    -> lodashCherryPick()
 *   babel-plugin-transform-rename-import   -> lodashCherryPick({ moduleName })
 *   transform-react-remove-prop-types      -> guardPropTypes()
 *   babel-plugin-filter-imports            -> stripDebug()
 *   babel-plugin-transform-next-use-client -> useClientDirective()
 *
 * All of these must run *after* rollup-plugin-esbuild, which strips the JSX
 * that acorn cannot parse.
 */
import MagicString from 'magic-string'

import { isReference, walk } from './walk.mjs'

const result = (s, id) =>
  s.hasChanged() ? { code: s.toString(), map: s.generateMap({ source: id, hires: true }) } : null

// ----------------------------------------
// lodash
// ----------------------------------------

// Prefix for the generated cherry-picked bindings. Chosen so it cannot collide
// with anything in src; the plugin asserts that below.
const LODASH_PREFIX = '_lodash$'

const renderImport = (specifiers, source) => {
  const named = []
  const parts = []

  for (const spec of specifiers) {
    if (spec.type === 'ImportDefaultSpecifier') parts.push(spec.local.name)
    else if (spec.type === 'ImportNamespaceSpecifier') parts.push(`* as ${spec.local.name}`)
    else {
      named.push(
        spec.imported.name === spec.local.name
          ? spec.local.name
          : `${spec.imported.name} as ${spec.local.name}`,
      )
    }
  }

  if (named.length) parts.push(`{ ${named.join(', ')} }`)

  return `import ${parts.join(', ')} from '${source}'`
}

/**
 * Rewrites `import _ from 'lodash'` into per-method imports.
 *
 *   import _ from 'lodash'          import _lodash$isNil from 'lodash/isNil'
 *   _.isNil(x)                 ->   const _ = { isNil: _lodash$isNil }
 *                                   _.isNil(x)
 *
 * Importing the lodash namespace defeats tree-shaking in every bundler
 * (lodash/lodash#4119), which is why the old preset ran `babel-plugin-lodash`.
 * Rebuilding the namespace object from cherry-picked members keeps call sites
 * untouched — no identifier renaming, no shadowing hazards — while pulling in
 * only the modules actually used.
 *
 * `moduleName` selects the package: `lodash` for CommonJS, `lodash-es` for the
 * ES and UMD builds, replacing `babel-plugin-transform-rename-import`.
 *
 * `lodash-es` specifiers carry an explicit `.js`: bundlers resolve the
 * extensionless form, but native Node ESM does not, which left dist/es
 * unloadable outside a bundler.
 */
export function lodashCherryPick({ moduleName = 'lodash' } = {}) {
  const extension = moduleName.endsWith('-es') ? '.js' : ''

  return {
    name: 'lodash-cherry-pick',

    transform(code, id) {
      if (!/from\s*['"]lodash['"]/.test(code)) return null

      const ast = this.parse(code)
      const declarations = ast.body.filter(
        (node) => node.type === 'ImportDeclaration' && node.source.value === 'lodash',
      )

      if (declarations.length === 0) return null
      if (declarations.length > 1) {
        this.error(`${id}: expected a single lodash import, found ${declarations.length}`)
      }

      const [declaration] = declarations
      const [specifier, ...rest] = declaration.specifiers

      if (rest.length > 0 || specifier.type !== 'ImportDefaultSpecifier') {
        this.error(`${id}: expected a bare default import from 'lodash'`)
      }
      if (code.includes(LODASH_PREFIX)) {
        this.error(`${id}: source already contains the reserved prefix ${LODASH_PREFIX}`)
      }

      const local = specifier.local.name
      const methods = new Set()

      walk(ast, (node, parent) => {
        // A nested binding of the same name would make the member scan below
        // unsound, so refuse rather than silently mis-rewrite.
        if (
          (node.type === 'VariableDeclarator' || node.type === 'FunctionDeclaration') &&
          node.id &&
          node.id.name === local
        ) {
          this.error(`${id}: '${local}' is shadowed, cannot cherry-pick lodash`)
        }

        if (node.type !== 'Identifier' || node.name !== local) return
        if (node === specifier.local) return
        if (!isReference(node, parent)) return

        if (parent.type === 'MemberExpression' && parent.object === node) {
          if (parent.computed) {
            this.error(`${id}: dynamic lodash access '${local}[...]' cannot be cherry-picked`)
          }
          methods.add(parent.property.name)
          return
        }

        this.error(`${id}: '${local}' is used as a value, cannot be cherry-picked`)
      })

      if (methods.size === 0) {
        // Import with no members left: drop it entirely.
        const s = new MagicString(code)
        s.remove(declaration.start, declaration.end)
        return result(s, id)
      }

      const names = [...methods].sort()
      const imports = names
        .map((name) => `import ${LODASH_PREFIX}${name} from '${moduleName}/${name}${extension}'`)
        .join('\n')
      const namespace = `const ${local} = { ${names
        .map((name) => `${name}: ${LODASH_PREFIX}${name}`)
        .join(', ')} }`

      const s = new MagicString(code)
      s.overwrite(declaration.start, declaration.end, `${imports}\n${namespace}`)

      return result(s, id)
    },
  }
}

// ----------------------------------------
// propTypes
// ----------------------------------------

/**
 * Wraps `Component.propTypes = {...}` in a NODE_ENV guard, replacing
 * `babel-plugin-transform-react-remove-prop-types` in `wrap` mode.
 *
 * propTypes are dev-only warnings — `handledProps` is baked into source, so
 * nothing reads them at runtime. Leaving them unguarded ships every component's
 * full prop schema, plus the `prop-types` validators it references, to
 * production. In the UMD build `@rollup/plugin-replace` folds the guard to
 * `false` and terser drops the object outright.
 */
export function guardPropTypes() {
  return {
    name: 'guard-prop-types',

    transform(code, id) {
      if (!code.includes('.propTypes')) return null

      const ast = this.parse(code)
      const s = new MagicString(code)

      for (const node of ast.body) {
        if (node.type !== 'ExpressionStatement') continue

        const { expression } = node
        if (expression.type !== 'AssignmentExpression' || expression.operator !== '=') continue

        const { left, right } = expression
        if (left.type !== 'MemberExpression' || left.computed) continue
        if (left.property.name !== 'propTypes') continue

        s.appendLeft(right.start, `process.env.NODE_ENV !== 'production' ? `)
        s.appendRight(right.end, ` : {}`)
      }

      return result(s, id)
    },
  }
}

// ----------------------------------------
// debug
// ----------------------------------------

/**
 * Removes `makeDebugger` and every `debug(...)` call from the published build,
 * replacing `babel-plugin-filter-imports`.
 *
 * Without this the whole `debug` package — and the `localStorage` probe in
 * `makeDebugger` — ships to every consumer, which is why `debug` had only ever
 * been a devDependency.
 */
export function stripDebug() {
  return {
    name: 'strip-debug',

    transform(code, id) {
      if (!code.includes('makeDebugger')) return null

      const ast = this.parse(code)
      const s = new MagicString(code)
      const debuggers = new Set()

      for (const node of ast.body) {
        if (node.type === 'ImportDeclaration') {
          const kept = node.specifiers.filter((spec) => spec.local.name !== 'makeDebugger')
          if (kept.length === node.specifiers.length) continue

          if (kept.length === 0) s.remove(node.start, node.end)
          else s.overwrite(node.start, node.end, renderImport(kept, node.source.value))

          continue
        }

        // `export { makeDebugger }` in src/lib/index.js.
        if (node.type === 'ExportNamedDeclaration' && !node.declaration) {
          const kept = node.specifiers.filter((spec) => spec.local.name !== 'makeDebugger')
          if (kept.length === node.specifiers.length) continue

          if (kept.length === 0) {
            s.remove(node.start, node.end)
          } else {
            const rendered = kept
              .map((spec) =>
                spec.exported.name === spec.local.name
                  ? spec.local.name
                  : `${spec.local.name} as ${spec.exported.name}`,
              )
              .join(', ')
            s.overwrite(node.start, node.end, `export { ${rendered} }`)
          }

          continue
        }

        // `const debug = makeDebugger('portal')`
        if (node.type === 'VariableDeclaration') {
          const made = node.declarations.filter(
            (decl) =>
              decl.init &&
              decl.init.type === 'CallExpression' &&
              decl.init.callee.type === 'Identifier' &&
              decl.init.callee.name === 'makeDebugger',
          )
          if (made.length === 0) continue
          if (made.length !== node.declarations.length) {
            this.error(`${id}: mixed makeDebugger declaration cannot be stripped`)
          }

          for (const decl of made) debuggers.add(decl.id.name)
          s.remove(node.start, node.end)
        }
      }

      if (debuggers.size > 0) {
        // Every use is a bare `debug(...)` statement; anything else would leave
        // a dangling reference behind, so fail loudly instead.
        walk(ast, (node, parent) => {
          if (node.type !== 'Identifier' || !debuggers.has(node.name)) return
          if (!isReference(node, parent)) return
          // The binding site itself, which was removed above.
          if (parent.type === 'VariableDeclarator' && parent.id === node) return

          const isCallee = parent.type === 'CallExpression' && parent.callee === node
          if (!isCallee) {
            this.error(`${id}: '${node.name}' is used as a value, cannot be stripped`)
          }
        })

        walk(ast, (node) => {
          if (node.type !== 'ExpressionStatement') return

          const { expression } = node
          if (expression.type !== 'CallExpression') return
          if (expression.callee.type !== 'Identifier') return
          if (!debuggers.has(expression.callee.name)) return

          s.remove(node.start, node.end)
        })
      }

      return result(s, id)
    },
  }
}

// ----------------------------------------
// 'use client'
// ----------------------------------------

// Mirrors CLIENT_COMPONENT_FUNCTIONS in babel-plugin-transform-next-use-client.
const CLIENT_APIS = new Set([
  'createContext',
  'useContext',
  'useDeferredValue',
  'useEffect',
  'useImperativeHandle',
  'useInsertionEffect',
  'useLayoutEffect',
  'useReducer',
  'useRef',
  'useState',
  'useSyncExternalStore',
  'useTransition',
])

/**
 * Re-adds the `'use client'` directives that `babel-plugin-transform-next-use-client`
 * injected, without which every hook-using component throws under the Next.js
 * App Router (and any other React Server Components host).
 *
 * A module is a client module when it imports a binding named after a client-only
 * React API — or one of `customClientImports` — or calls one through the React
 * namespace (`React.useState`).
 *
 * The directive has to be applied in `renderChunk`: rollup hoists imports to the
 * top of each preserved module, which would push a directive emitted at
 * `transform` time out of prologue position and turn it into dead code.
 */
export function useClientDirective({ customClientImports = [] } = {}) {
  const custom = new Set(customClientImports)
  const isClientApi = (name) => CLIENT_APIS.has(name) || custom.has(name)
  const clientModules = new Set()

  return {
    name: 'use-client-directive',

    buildStart() {
      clientModules.clear()
    },

    transform(code, id) {
      const ast = this.parse(code)
      let namespace = null
      let isClient = false

      for (const node of ast.body) {
        if (node.type !== 'ImportDeclaration') continue

        for (const spec of node.specifiers) {
          if (spec.type === 'ImportNamespaceSpecifier') {
            if (node.source.value === 'react') namespace = spec.local.name
            continue
          }
          if (isClientApi(spec.local.name)) isClient = true
        }
      }

      if (!isClient && namespace) {
        walk(ast, (node) => {
          if (node.type !== 'MemberExpression' || node.computed) return
          if (node.object.type !== 'Identifier' || node.object.name !== namespace) return
          if (isClientApi(node.property.name)) isClient = true
        })
      }

      if (isClient) clientModules.add(id)

      return null
    },

    renderChunk(code, chunk) {
      const ids = chunk.moduleIds || Object.keys(chunk.modules)
      if (!ids.some((id) => clientModules.has(id))) return null

      return { code: `'use client';\n${code}`, map: null }
    },
  }
}

// ----------------------------------------
// esbuild cleanup
// ----------------------------------------

/**
 * Drops the `"use strict"` prologue esbuild emits per module.
 *
 * It is meaningless in an ES module, and rollup hoists imports above it so it
 * lands mid-file as dead code — where it would also displace the `'use client'`
 * directive above.
 */
export function dropUseStrict() {
  return {
    name: 'drop-use-strict',

    transform(code, id) {
      const match = /^\s*(["'])use strict\1;?\n/.exec(code)
      if (!match) return null

      const s = new MagicString(code)
      s.remove(match.index, match.index + match[0].length)

      return result(s, id)
    },
  }
}
