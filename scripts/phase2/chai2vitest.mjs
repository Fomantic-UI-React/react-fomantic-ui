/**
 * chai/sinon -> vitest assertion codemod for the Phase 2 spec port.
 *
 * Handles the two shapes the frozen corpus uses:
 *   <expr>.should.<chain>        -> expect(<expr>).<vitest>
 *   expect(<expr>).to.<chain>    -> expect(<expr>).<vitest>
 *
 * Subjects are extracted by walking backwards over balanced brackets, so
 * `numberToWord(n + 1).should.equal(x)` works. Anything it cannot map is left
 * alone and reported, so the residue is visible rather than silently wrong.
 */

const OPEN = { ')': '(', ']': '[', '}': '{' }

/** Walk backwards from index `end` (exclusive) to the start of the expression. */
function subjectStart(src, end) {
  let i = end - 1
  const stack = []

  while (i >= 0) {
    const ch = src[i]

    if (stack.length > 0) {
      if (OPEN[ch]) stack.push(ch)
      else if (ch === OPEN[stack[stack.length - 1]]) stack.pop()
      i -= 1
      continue
    }

    if (ch === ')' || ch === ']' || ch === '}') {
      stack.push(ch)
      i -= 1
      continue
    }
    if (/[\w$.'"`\-]/.test(ch)) {
      i -= 1
      continue
    }
    break
  }

  return i + 1
}

/**
 * Walks `src` from `i`, calling `onChar(ch, depth)` for characters outside any
 * string, template or regex literal. Literal contents are skipped entirely, so
 * a comma inside /a, b/ or "a, b" is never mistaken for a separator, and a
 * paren inside them never affects balance.
 */
function scan(src, i, end, onChar) {
  let depth = 0
  let prev = ''

  while (i < end) {
    const ch = src[i]

    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch
      i += 1
      while (i < end && src[i] !== quote) i += src[i] === '\\' ? 2 : 1
      i += 1
      prev = quote
      continue
    }

    // A '/' starts a regex only where a value may begin.
    if (ch === '/' && '(,=:[!&|?+-*%~^;{'.includes(prev)) {
      i += 1
      let inClass = false
      while (i < end) {
        if (src[i] === '\\') { i += 2; continue }
        if (src[i] === '[') inClass = true
        else if (src[i] === ']') inClass = false
        else if (src[i] === '/' && !inClass) break
        i += 1
      }
      i += 1
      prev = '/'
      continue
    }

    if ('([{'.includes(ch)) depth += 1
    else if (')]}'.includes(ch)) depth -= 1

    if (onChar(ch, depth, i) === false) return i

    if (!/\s/.test(ch)) prev = ch
    i += 1
  }

  return i
}

/** Split `a, b` at top level so multi-arg chai calls survive. */
function splitArgs(s) {
  const out = []
  let last = 0

  scan(s, 0, s.length, (c, depth, i) => {
    if (c === ',' && depth === 0) {
      out.push(s.slice(last, i).trim())
      last = i + 1
    }
  })
  if (s.slice(last).trim()) out.push(s.slice(last).trim())

  return out
}

/** Reads a balanced (...) starting at `i` (which must be '('). Returns [inner, endIndex]. */
function readCall(src, i) {
  let close = -1

  scan(src, i, src.length, (c, depth, j) => {
    if (c === ')' && depth === 0) {
      close = j
      return false
    }
  })

  return close === -1 ? [null, i] : [src.slice(i + 1, close), close + 1]
}

/**
 * sinon's `calledWithMatch` uses sinon.match semantics per argument: a regexp
 * tests the value, a string must be a substring of it, and an object is a
 * partial deep match. Each maps to a different asymmetric matcher.
 */
function matcherFor(arg) {
  const a = arg.trim()
  if (a.startsWith('{')) return `expect.objectContaining(${a})`
  if (a.startsWith('/')) return `expect.stringMatching(${a})`
  if (/^['"`]/.test(a)) return `expect.stringContaining(${a})`
  return a
}

// chain (after normalising away `to`/`be`/`have`/`been`) -> emitter
const MAP = [
  [/^not\.equal$/, (a) => `not.toBe(${a})`],
  [/^not\.deep\.equal$/, (a) => `not.toEqual(${a})`],
  [/^deep\.equal$/, (a) => `toEqual(${a})`],
  [/^eql$/, (a) => `toEqual(${a})`],
  [/^equal$/, (a) => `toBe(${a})`],
  [/^not\.property$/, (a) => `not.toHaveProperty(${a})`],
  [/^property$/, (a) => `toHaveProperty(${a})`],
  [/^not\.called$/, () => `not.toHaveBeenCalled()`],
  [/^calledOnce$/, () => `toHaveBeenCalledTimes(1)`],
  [/^calledTwice$/, () => `toHaveBeenCalledTimes(2)`],
  [/^calledThrice$/, () => `toHaveBeenCalledTimes(3)`],
  [/^callCount$/, (a) => `toHaveBeenCalledTimes(${a})`],
  [
    /^calledWithMatch$/,
    (a) =>
      `toHaveBeenCalledWith(${splitArgs(a).map(matcherFor).join(', ')})`,
  ],
  [/^calledWithExactly$/, (a) => `toHaveBeenCalledWith(${a})`],
  [/^calledWith$/, (a) => `toHaveBeenCalledWith(${a})`],
  [/^not\.calledWith$/, (a) => `not.toHaveBeenCalledWith(${a})`],
  [/^lengthOf$/, (a) => `toHaveLength(${a})`],
  [/^length$/, (a) => `toHaveLength(${a})`],
  [/^deep\.members$/, (a) => `toEqual(expect.arrayContaining(${a}))`],
  [/^members$/, (a) => `toEqual(expect.arrayContaining(${a}))`],
  [/^not\.true$/, () => `not.toBe(true)`],
  [/^not\.false$/, () => `not.toBe(false)`],
  [/^true$/, () => `toBe(true)`],
  [/^false$/, () => `toBe(false)`],
  [/^null$/, () => `toBeNull()`],
  [/^undefined$/, () => `toBeUndefined()`],
  [/^not\.undefined$/, () => `toBeDefined()`],
  [/^a$/, (a) => `toBeTypeOf(${a})`],
  [/^an$/, (a) => `toBeTypeOf(${a})`],
  [/^throw$/, (a) => (a ? `toThrow(${a})` : `toThrow()`)],
  [/^instanceof$/, (a) => `toBeInstanceOf(${a})`],
]

const NOISE = new Set(['to', 'be', 'been', 'have', 'has', 'that', 'and', 'with', 'of', 'is'])

/** Normalise a chai chain: drop connector words, keep `not` and the matcher. */
function normalise(parts) {
  const kept = parts.filter((p) => !NOISE.has(p))
  return kept.join('.')
}


/** Joins prettier-wrapped member chains so each is on one line. */
export function joinWrappedChains(src) {
  return src.replace(/\n\s*\./g, '.')
}

export function transform(src) {
  const unmapped = []
  let out = src
  let guard = 0

  for (;;) {
    guard += 1
    if (guard > 5000) break

    // Prefer `.should.` since `expect(x).to.` is a subset of the same grammar.
    const idx = out.indexOf('.should.')
    let subject
    let start
    let cursor

    if (idx !== -1) {
      start = subjectStart(out, idx)
      subject = out.slice(start, idx)
      cursor = idx + '.should.'.length
    } else {
      const m = /expect\(/.exec(out.slice(0))
      if (!m) break

      // Find an `expect(...)` followed by `.to.`
      let found = -1
      let searchFrom = 0
      for (;;) {
        const e = out.indexOf('expect(', searchFrom)
        if (e === -1) break
        const [inner, end] = readCall(out, e + 'expect'.length)
        if (inner !== null && out.slice(end, end + 4) === '.to.') {
          found = e
          start = e
          subject = inner
          cursor = end + 4
          break
        }
        searchFrom = e + 1
      }
      if (found === -1) break
    }

    // Read the chain: dotted words, with at most one trailing call.
    const parts = []
    let arg = null
    let i = cursor

    // Chains are frequently wrapped by prettier, so whitespace between the
    // dots and the matcher is normal and must not end the chain.
    const skipSpace = () => {
      while (i < out.length && /\s/.test(out[i])) i += 1
    }

    for (;;) {
      skipSpace()
      const wm = /^([A-Za-z$_][\w$]*)/.exec(out.slice(i))
      if (!wm) break
      parts.push(wm[1])
      i += wm[1].length

      skipSpace()
      if (out[i] === '(') {
        const [inner, end] = readCall(out, i)
        arg = inner
        i = end
        break
      }
      if (out[i] === '.') {
        i += 1
        continue
      }
      break
    }

    const chain = normalise(parts)
    const entry = MAP.find(([re]) => re.test(chain))

    let replacement
    if (entry) {
      replacement = `expect(${subject}).${entry[1](arg === null ? '' : arg.trim())}`
    } else {
      unmapped.push(chain)
      // Neutralise so the loop makes progress; the marker is easy to grep.
      replacement = `expect(${subject}).__UNMAPPED_${chain.replace(/\./g, '_')}__(${arg ?? ''})`
    }

    out = out.slice(0, start) + replacement + out.slice(i)
  }

  return { code: out, unmapped }
}

export { splitArgs }
