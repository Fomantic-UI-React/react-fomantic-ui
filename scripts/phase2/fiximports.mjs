/**
 * Reconciles the `test/support/rtl` import in ported specs with what they
 * actually use. Hand-edits routinely introduce a `dom(` where the pre-pass had
 * only imported `root`, which fails at run time rather than at lint time.
 *
 * Usage: node scripts/phase2/fiximports.mjs test/unit/elements
 */
import fs from 'fs'
import path from 'path'

const target = process.argv[2]

const walk = (d) =>
  fs
    .readdirSync(d, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]))

let changed = 0

for (const file of walk(target).filter((f) => f.endsWith('-test.js'))) {
  const src = fs.readFileSync(file, 'utf8')
  const body = src.replace(/^import .*\n/gm, '')

  const used = ['dom', 'root'].filter((name) => new RegExp(`\\b${name}\\(`).test(body))
  const existing = /^import \{ ([^}]+) \} from 'test\/support\/rtl'\n/m.exec(src)

  let out = src

  if (used.length === 0) {
    if (existing) out = out.replace(existing[0], '')
  } else {
    const line = `import { ${used.join(', ')} } from 'test/support/rtl'\n`
    if (existing) out = out.replace(existing[0], line)
    else out = out.replace(/^(import .*\n)/m, `${line}$1`)
  }

  if (out !== src) {
    fs.writeFileSync(file, out)
    changed += 1
  }
}

console.log(`reconciled rtl imports in ${changed} file(s)`)
