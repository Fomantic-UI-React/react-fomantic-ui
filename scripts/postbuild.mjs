import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(root, 'src')
const distDir = path.join(root, 'dist')

const esbuildBin = path.join(root, 'node_modules', '.bin', 'esbuild')

function walk(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...walk(full))
    } else {
      out.push(full)
    }
  }
  return out
}

// 1. Copy .d.ts declarations to both commonjs and es, preserving src structure.
for (const dts of walk(srcDir).filter((f) => f.endsWith('.d.ts'))) {
  const rel = path.relative(srcDir, dts)
  for (const target of ['commonjs', 'es']) {
    const dest = path.join(distDir, target, rel)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(dts, dest)
  }
}

// 2. Rollup drops index.js modules that only re-export a component with the
//    same name in the same folder (e.g. Accordion/index.js -> Accordion.js).
//    Emit them via per-file esbuild transpile so deep imports keep working.
for (const indexSrc of walk(srcDir).filter((f) => f.endsWith('/index.js'))) {
  const rel = path.relative(srcDir, indexSrc)
  for (const [format, flag] of [
    ['commonjs', 'cjs'],
    ['es', 'esm'],
  ]) {
    const dest = path.join(distDir, format, rel)
    if (fs.existsSync(dest)) {
      continue
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    const out = execSync(
      `"${esbuildBin}" "${indexSrc}" --format=${flag} --loader:.js=jsx --target=es2017 --jsx=transform`,
      { encoding: 'utf8' },
    )
    fs.writeFileSync(dest, out)
  }
}

console.log('postbuild: declaration copies and index.js re-exports complete')
