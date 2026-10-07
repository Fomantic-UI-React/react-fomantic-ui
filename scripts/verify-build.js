/**
 * Post-build smoke test.
 *
 * Covers two things that have no other coverage while the test suite is being
 * migrated:
 *
 *  1. Runtime behaviour of dist/commonjs — declared props become CSS classes,
 *     unknown props reach the DOM, shorthand factories render.
 *  2. The five build-time transforms that moved from `.babel-preset.js` into
 *     `build/plugins.mjs`. Each one fails silently at runtime or only on a
 *     consumer's machine, so they are asserted against the built output here.
 */
const assert = require('assert')
const { execFile } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')
const url = require('url')
const vm = require('vm')

const esbuild = require('esbuild')
const _ = require('lodash')
const React = require('react')
const ReactDOM = require('react-dom')
const ReactDOMServer = require('react-dom/server')

const root = path.join(__dirname, '..')
const dist = (...parts) => path.join(root, 'dist', ...parts)

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })

const jsFiles = (dir) => walk(dir).filter((file) => file.endsWith('.js'))
const read = (file) => fs.readFileSync(file, 'utf8')

// ----------------------------------------
// Rendering
// ----------------------------------------

const SUI = require(dist('commonjs', 'index.js'))
const render = (el) => ReactDOMServer.renderToStaticMarkup(el)

assert.ok(Object.keys(SUI).length > 150, 'expected >150 exports')

// Guards the handledProps invariant: getUnhandledProps reads a static array on
// each component to decide which props are its own API. If those go missing,
// every declared prop silently leaks onto the DOM.
const button = render(React.createElement(SUI.Button, { primary: true, size: 'large' }, 'Go'))
assert.ok(button.includes('primary') && button.includes('large'), 'props should become classes')
assert.ok(!/primary="|size="/.test(button), `props leaked onto the DOM: ${button}`)

const forwarded = render(React.createElement(SUI.Button, { 'data-x': '1', id: 'z' }))
assert.ok(forwarded.includes('data-x="1"'), 'data attributes should reach the DOM')
assert.ok(forwarded.includes('id="z"'), 'id should reach the DOM')

const label = render(React.createElement(SUI.Label, { icon: 'user', content: 'Hi' }))
assert.ok(label.includes('user icon'), `shorthand factory failed: ${label}`)

assert.ok(Array.isArray(SUI.Portal.handledProps), 'Portal.handledProps must be an array')
assert.ok(SUI.Portal.handledProps.length > 0, 'Portal.handledProps must not be empty')

// ----------------------------------------
// 'use client' (babel-plugin-transform-next-use-client)
// ----------------------------------------

// Without these directives every hook-using component throws under the Next.js
// App Router. The count is pinned so that losing the transform is loud.
const EXPECTED_CLIENT_MODULES = 37

for (const format of ['commonjs', 'es']) {
  const clients = jsFiles(dist(format)).filter((file) => /^['"]use client['"]/.test(read(file)))

  assert.strictEqual(
    clients.length,
    EXPECTED_CLIENT_MODULES,
    `dist/${format}: expected ${EXPECTED_CLIENT_MODULES} 'use client' modules, found ${clients.length}`,
  )
}

// ----------------------------------------
// lodash cherry-picking (babel-plugin-lodash)
// ----------------------------------------

// A namespace import defeats tree-shaking in every bundler, so no module may
// reach for the lodash root. The es build must also use lodash-es.
for (const [format, expected, forbidden] of [
  ['commonjs', 'lodash/', 'lodash-es'],
  ['es', 'lodash-es/', /from '(lodash|lodash-es)'/],
]) {
  let cherryPicked = 0

  for (const file of jsFiles(dist(format))) {
    const code = read(file)

    assert.ok(
      !/(require\(|from )['"]lodash['"]/.test(code),
      `${file}: imports the lodash namespace`,
    )
    if (typeof forbidden === 'string') {
      assert.ok(!code.includes(forbidden), `${file}: should not reference ${forbidden}`)
    }
    if (code.includes(expected)) cherryPicked += 1
  }

  assert.ok(cherryPicked > 50, `dist/${format}: expected cherry-picked lodash imports`)
}

// ----------------------------------------
// propTypes (transform-react-remove-prop-types)
// ----------------------------------------

// propTypes are dev-only warnings now that handledProps is baked into source;
// shipping them unguarded drags every prop schema into production bundles.
// Only top-level assignments: the handful of nested ones (DropdownInner,
// SearchInner) are already wrapped in a NODE_ENV block in source.
const unguarded = jsFiles(dist('commonjs')).filter((file) =>
  /^\w[\w.]*\.propTypes = (?!process\.env\.NODE_ENV)/m.test(read(file)),
)

assert.deepStrictEqual(unguarded, [], 'propTypes assignments must be NODE_ENV-guarded')

// ----------------------------------------
// debug (babel-plugin-filter-imports)
// ----------------------------------------

// `debug` is a devDependency; if makeDebugger survives the build, consumers get
// an unmet dependency and a localStorage probe on load.
for (const format of ['commonjs', 'es', 'umd']) {
  for (const file of jsFiles(dist(format))) {
    assert.ok(!read(file).includes('makeDebugger'), `${file}: makeDebugger survived the build`)
  }
}

// ----------------------------------------
// UMD
// ----------------------------------------

const umdFile = dist('umd', `${require(path.join(root, 'package.json')).name}.min.js`)
const umd = read(umdFile)

// A <script> tag has no `process`. Any surviving reference is a hard crash on
// load, so the bundle is executed in a context that has no Node globals at all.
assert.ok(!umd.includes('process.env'), 'UMD bundle references process.env')

const sandbox = { console, React, ReactDOM }
sandbox.window = sandbox
sandbox.self = sandbox
sandbox.globalThis = sandbox
vm.runInContext(umd, vm.createContext(sandbox))

assert.ok(
  Object.keys(sandbox.reactFomanticUI || {}).length > 150,
  'UMD bundle did not export the component set',
)

// ----------------------------------------
// Declarations
// ----------------------------------------

// index.d.ts re-exports from ./dist/commonjs, and dist/es is typed too.
for (const format of ['commonjs', 'es']) {
  const declarations = walk(dist(format)).filter((file) => file.endsWith('.d.ts'))
  assert.ok(declarations.length > 200, `dist/${format}: expected the .d.ts copies`)
}

// ----------------------------------------
// Load order
// ----------------------------------------

// Every module has to work as the first one a consumer's bundler reaches. A
// circular import that attaches a static while loading breaks whichever side
// loads first: `Step.Group` is undefined in CommonJS, and in ESM `StepGroup`
// throws a ReferenceError — which is how 3.0.0 took down a Next.js app (#8).
// Each module is loaded first, then the entry, and no component may come out
// with an undefined static.
const lostStatics = (exports) =>
  Object.entries(exports).flatMap(([name, value]) =>
    value
      ? Object.keys(value)
          .filter((key) => /^[A-Z]/.test(key) && value[key] === undefined)
          .map((key) => `${name}.${key}`)
      : [],
  )

const modules = (format) => jsFiles(dist(format)).filter((file) => !file.endsWith('.d.ts'))

for (const file of modules('commonjs')) {
  for (const id of Object.keys(require.cache)) {
    if (id.startsWith(dist('commonjs'))) delete require.cache[id]
  }

  require(file)
  const lost = lostStatics(require(dist('commonjs', 'index.js')))
  assert.deepStrictEqual(lost, [], `${file} loaded first leaves statics undefined`)
}

// ESM has no module cache to clear, so each module gets a fresh process.
const loadFirstInEs = (file) =>
  new Promise((resolve) => {
    const script = `
      await import(${JSON.stringify(url.pathToFileURL(file).href)})
      const es = await import(${JSON.stringify(url.pathToFileURL(dist('es', 'index.js')).href)})
      const lostStatics = ${lostStatics.toString()}
      const lost = lostStatics(es)
      if (lost.length) throw new Error('undefined statics: ' + lost.join(', '))
    `
    execFile(process.execPath, ['--input-type=module', '-e', script], (error, stdout, stderr) =>
      resolve(error && `${path.relative(root, file)}: ${/^\w*Error\b.*$/m.exec(stderr) ?? stderr}`),
    )
  })

const loadOrderInEs = async () => {
  const pending = modules('es')
  const failures = []
  const worker = async () => {
    const file = pending.pop()
    if (!file) return

    const failure = await loadFirstInEs(file)
    if (failure) failures.push(failure)
    await worker()
  }

  await Promise.all(Array.from({ length: os.availableParallelism() }, worker))
  assert.deepStrictEqual(failures.sort(), [], 'dist/es modules that fail when loaded first')
}

// ----------------------------------------
// Tree-shaking
// ----------------------------------------

// `"sideEffects": false` lets a bundler drop any module whose exports nobody
// uses. 3.0.1 attached `Button.Group` and its siblings in a module the entry
// imported only for its side effects, so Turbopack dropped it and
// `Button.Content` rendered as undefined. Nothing above bundles, so the es build
// is bundled the way a consumer's bundler does it, and every component must come
// out with the statics it has when the package is loaded whole.
const staticsOf = (exports) =>
  _.mapValues(exports, (value) =>
    value
      ? Object.keys(value)
          .filter((key) => /^[A-Z]/.test(key) && value[key])
          .sort()
      : [],
  )

const treeShaking = async () => {
  const names = Object.keys(SUI).filter((name) => name !== '__esModule')
  const outfile = path.join(root, 'node_modules', '.cache', 'verify-build', 'tree-shaken.mjs')

  esbuild.buildSync({
    stdin: {
      contents: [
        `import { ${names.join(', ')} } from ${JSON.stringify(dist('es', 'index.js'))}`,
        `export default { ${names.join(', ')} }`,
      ].join('\n'),
      resolveDir: root,
    },
    bundle: true,
    platform: 'node',
    format: 'esm',
    packages: 'external',
    outfile,
    logLevel: 'error',
  })

  const { default: shaken } = await import(url.pathToFileURL(outfile).href)
  assert.deepStrictEqual(
    staticsOf(shaken),
    staticsOf(_.pick(SUI, names)),
    'statics lost when dist/es is bundled with "sideEffects": false',
  )
}

// ----------------------------------------
// Native ESM
// ----------------------------------------

// Bundlers resolve extensionless deep specifiers; node does not. Importing the
// es build through node is the only check that catches a missing extension,
// which is how `lodash-es/invoke` shipped unloadable for the whole 2.x line.
import(url.pathToFileURL(dist('es', 'index.js')).href)
  .then((es) => {
    assert.ok(Object.keys(es).length > 150, 'dist/es did not export the component set')
    assert.strictEqual(
      render(React.createElement(es.Button, { primary: true }, 'Go')),
      '<button class="ui primary button">Go</button>',
      'dist/es did not render',
    )
  })
  .catch((error) => {
    console.error(`dist/es is not loadable by node: ${error.message}`)
    process.exit(1)
  })
  .then(loadOrderInEs)
  .then(treeShaking)
  .then(() => console.log('build verification passed'))
  .catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
