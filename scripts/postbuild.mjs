/**
 * Copies the hand-written `.d.ts` declarations alongside the compiled output.
 *
 * `index.d.ts` re-exports from `./dist/commonjs/...`, so `tsd:test` needs the
 * commonjs copies before `tsc` can resolve anything; `dist/es` gets them too so
 * that deep imports through the `module` entry are typed as well.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(root, 'src')
const distDir = path.join(root, 'dist')

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}

const declarations = walk(srcDir).filter((file) => file.endsWith('.d.ts'))

for (const declaration of declarations) {
  const rel = path.relative(srcDir, declaration)

  for (const target of ['commonjs', 'es']) {
    const dest = path.join(distDir, target, rel)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(declaration, dest)
  }
}

console.log(`postbuild: copied ${declarations.length} declarations to dist/commonjs and dist/es`)
