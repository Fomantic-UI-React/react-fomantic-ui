/**
 * factories-test.js asserts on the element createShorthand returns. Enzyme's
 * shallow() was only a way to reach `.props()`; the element carries them
 * directly, so the renderer drops out entirely and the assertions get stronger.
 */
import fs from 'fs'
import { joinWrappedChains, transform } from './chai2vitest.mjs'

const root = '/Users/ela/Projects/Semantic-UI-React'
let src = fs.readFileSync(`${root}/test/specs/lib/factories-test.js`, 'utf8')

/** Unwrap `shallow( ... )` -> `( ... )`, balancing parens and skipping literals. */
function unwrapShallow(s) {
  for (;;) {
    const i = s.indexOf('shallow(')
    if (i === -1) return s

    let depth = 0
    let j = i + 'shallow'.length
    for (; j < s.length; j += 1) {
      if (s[j] === '(') depth += 1
      else if (s[j] === ')') {
        depth -= 1
        if (depth === 0) break
      }
    }
    // Multi-line calls carry a trailing comma that must not survive unwrapping.
    const inner = s.slice(i + 'shallow'.length + 1, j).trim().replace(/,$/, '')
    s = `${s.slice(0, i)}${inner}${s.slice(j + 1)}`
  }
}

src = unwrapShallow(src)

// `.props()` on the wrapper is `.props` on the element.
src = src.replace(/\)\s*\.props\(\)/g, ').props')
src = src.replace(/\.props\(\)/g, '.props')

// Enzyme wrapper assertions -> element prop assertions.
src = src.replace(/\.should\.not\.have\.prop\(/g, '.props.should.not.have.property(')
src = src.replace(/\.should\.have\.prop\(/g, '.props.should.have.property(')
src = src.replace(/\.should\.have\.same\.className\(/g, '.props.className.should.equal(')

// chai's `.property(k).deep.equal(v)` chains onto the property value, which has
// no vitest equivalent; assert on the value directly instead.
src = src.replace(
  /\.should\.have\.property\((['"][^'"]+['"])\)\s*\.deep\.equal\(/g,
  '[$1].should.deep.equal(',
)


// sinon -> vi
src = src.replace(/^import \{ consoleUtil, sandbox \} from 'test\/utils'\n/m,
  "import { consoleUtil } from 'test/support'\n")
src = src.replace(/\bsandbox\.(spy|stub)\(/g, 'vi.fn(')
src = src.replace(/\.resetHistory\(\)/g, '.mockClear()')

const { code, unmapped } = transform(joinWrappedChains(src))
fs.writeFileSync(`${root}/test/unit/lib/factories-test.js`, code)

console.log(unmapped.length ? `unmapped: ${[...new Set(unmapped)].join(', ')}` : 'no unmapped assertions')
