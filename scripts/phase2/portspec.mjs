/**
 * Ports a frozen Enzyme/mocha spec directory to test/unit for Vitest.
 * Usage: node portspec.mjs <area>   e.g. `node portspec.mjs lib`
 *
 * Files that render with Enzyme, or that lean on a webpack loader, are skipped
 * and listed — those need a behavioural rewrite by hand.
 */
import fs from 'fs'
import path from 'path'
import { joinWrappedChains, transform } from './chai2vitest.mjs'

const root = '/Users/ela/Projects/Semantic-UI-React'
const area = process.argv[2]
const from = path.join(root, 'test/specs', area)
const to = path.join(root, 'test/unit', area)

const walk = (d) =>
  fs
    .readdirSync(d, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]))

const FAKER = {
  'faker.hacker.phrase()': "'faker phrase text'",
  'faker.lorem.word()': "'word'",
  'faker.image.imageUrl()': "'/images/example.png'",
  'faker.internet.url()': "'https://example.com'",
}

/** Post-codemod fixups for APIs that moved with the runner, not the assertion. */
function fixups(src) {
  let s = src

  s = s.replace(/'test\/specs\/commonTests'/g, "'test/support/commonTests'")
  s = s.replace(/'test\/utils'/g, "'test/support'")
  s = s.replace(/^import faker from 'faker'\n/m, '')
  for (const [call, value] of Object.entries(FAKER)) s = s.split(call).join(value)

  // sinon sandbox -> vi
  s = s.replace(/^import \{ sandbox \} from '(\.\.\/)+utils'\n/m, '')
  s = s.replace(/^import \{ sandbox \} from 'test\/support'\n/m, '')
  s = s.replace(
    /import \{ ([^}]*?)sandbox, ?([^}]*?)\} from 'test\/support'/g,
    "import { $1$2} from 'test/support'",
  )
  s = s.replace(
    /import \{ ([^}]*?), ?sandbox \} from 'test\/support'/g,
    "import { $1 } from 'test/support'",
  )
  s = s.replace(/sandbox\.spy\(console, 'error'\)/g, "vi.spyOn(console, 'error')")
  s = s.replace(/\bsandbox\.(spy|stub)\(/g, 'vi.fn(')

  // sinon spy API -> vitest mock API
  s = s.replace(/\.resetHistory\(\)/g, '.mockClear()')
  s = s.replace(/\.restore\(\)/g, '.mockRestore()')

  // mocha root hooks -> vitest
  s = s.replace(/(?<![\w.])before\(/g, 'beforeAll(')
  s = s.replace(/(?<![\w.])after\(/g, 'afterAll(')

  return s
}

/** Fixups for constructs the transform itself emits. */
function postFixups(src) {
  // chai `an('array')` means Array.isArray, not typeof
  return src.replace(/toBeTypeOf\('array'\)/g, 'toBeInstanceOf(Array)')
}

const files = walk(from).filter((f) => f.endsWith('-test.js'))
const skipped = []
const unmappedReport = []

for (const file of files) {
  const rel = path.relative(from, file)
  const src = fs.readFileSync(file, 'utf8')

  if (/\b(shallow|mount)\(/.test(src) || /imports-loader/.test(src)) {
    skipped.push(rel)
    continue
  }

  const { code: transformed, unmapped } = transform(joinWrappedChains(fixups(src)))
  const code = postFixups(transformed)
  if (unmapped.length) unmappedReport.push(`${rel}: ${[...new Set(unmapped)].join(', ')}`)

  const dest = path.join(to, rel)
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.writeFileSync(dest, code)
}

console.log(`ported ${files.length - skipped.length} of ${files.length}`)
if (skipped.length) console.log(`needs hand-porting (${skipped.length}):\n  ${skipped.join('\n  ')}`)
console.log(
  unmappedReport.length
    ? `\nunmapped:\n  ${unmappedReport.join('\n  ')}`
    : '\nno unmapped assertions',
)
