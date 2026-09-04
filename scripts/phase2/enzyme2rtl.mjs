/**
 * Rewrites the Enzyme wrapper assertions that recur across the frozen specs
 * onto the RTL helpers in `test/support/rtl`.
 *
 * Only the mechanical shapes are handled — the ones where `shallow()` was just
 * a way to reach the rendered DOM:
 *
 *   shallow(<X />).should.have.tagName('div')   -> expect(root(<X />)).toHaveTagName('div')
 *   shallow(<X />).should.have.className('a')   -> expect(root(<X />)).toHaveClass('a')
 *   shallow(<X />).should.have.attr('k', v)     -> expect(root(<X />)).toHaveAttribute('k', v)
 *   shallow(<X />).should.have.descendants('p') -> expect(dom(<X />).querySelector('p')).not.toBeNull()
 *
 * Anything that needs the React element tree — finding a component by name,
 * reading its props, walking children — is left alone on purpose. Those are
 * structural assertions that have to become behavioural ones by hand.
 */

const RENDERERS = /\b(?:shallow|mount)\(/

/** Reads a balanced (...) starting at `i` (which must be '('). */
function readCall(src, i) {
  let depth = 0
  for (let j = i; j < src.length; j += 1) {
    if (src[j] === '(') depth += 1
    else if (src[j] === ')') {
      depth -= 1
      if (depth === 0) return [src.slice(i + 1, j), j + 1]
    }
  }
  return [null, i]
}

/** Splits `a, b` at top level. */
function splitTopLevel(s) {
  const out = []
  let depth = 0
  let last = 0

  for (let i = 0; i < s.length; i += 1) {
    const c = s[i]
    if ('([{'.includes(c)) depth += 1
    else if (')]}'.includes(c)) depth -= 1
    else if (c === ',' && depth === 0) {
      out.push(s.slice(last, i).trim())
      last = i + 1
    }
  }
  if (s.slice(last).trim()) out.push(s.slice(last).trim())

  return out
}

/** A CSS selector, as opposed to a React component name Enzyme could resolve. */
const isCssSelector = (arg) => {
  const a = arg.trim()
  if (!/^['"]/.test(a)) return false
  return !/^['"][A-Z]/.test(a)
}

// chai reads either way round — `not.have.attr` and `have.not.attr` are the
// same assertion — so chains are normalised before matching.
const NOISE = new Set(['to', 'be', 'been', 'have', 'has', 'that', 'and', 'with', 'of', 'is', 'contain'])

const normalise = (chain) => {
  const parts = chain.split('.').filter((p) => !NOISE.has(p))
  const negated = parts.includes('not')
  const rest = parts.filter((p) => p !== 'not')

  return (negated ? ['not', ...rest] : rest).join('.')
}

/**
 * `prop` on a host element is the React prop, which for these names is just the
 * DOM attribute. Component props (`content`, `description`, ...) are not in this
 * list on purpose — those assertions are structural and need rewriting by hand.
 */
const ATTRIBUTE_PROPS = new Set([
  'alt', 'href', 'id', 'name', 'role', 'src', 'tabIndex', 'title', 'type', 'value',
])

const attributeName = (arg) => {
  const m = /^['"]([^'"]+)['"]$/.exec(arg.trim())
  if (!m) return null
  const name = m[1]

  return name.includes('-') || ATTRIBUTE_PROPS.has(name) ? name.toLowerCase() : null
}

// normalised chain -> how to render the subject, and what to assert
const RULES = [
  [/^tagName$/, 'root', (a) => `toHaveTagName(${a})`],
  [/^className$/, 'root', (a) => `toHaveClass(${a})`],
  [/^not\.className$/, 'root', (a) => `not.toHaveClass(${a})`],
  [/^attr$/, 'root', (a) => `toHaveAttribute(${a})`],
  [/^not\.attr$/, 'root', (a) => `not.toHaveAttribute(${a})`],
  [/^text$/, 'dom', (a) => `toHaveTextContent(${a})`],
  [/^descendants$/, 'domQuery', () => `not.toBeNull()`],
  [/^not\.descendants$/, 'domQuery', () => `toBeNull()`],
  [/^prop$/, 'attr', null],
  [/^not\.prop$/, 'attr', null],
]

export function enzymeToRtl(src) {
  let out = src
  let searchFrom = 0
  let used = { root: false, dom: false }

  for (;;) {
    const m = RENDERERS.exec(out.slice(searchFrom))
    if (!m) break

    const callStart = searchFrom + m.index
    const parenAt = callStart + m[0].length - 1
    const [inner, afterCall] = readCall(out, parenAt)

    // An empty subject means the match was not a real render call; emitting
    // `dom()` here would produce silently broken output.
    if (inner === null || inner.trim() === '') {
      searchFrom = callStart + m[0].length
      continue
    }

    // Only a `.should.` chain immediately after the render call is mechanical.
    const rest = out.slice(afterCall)
    const chainMatch = /^\s*\.should\.((?:[\w$]+\.)*[\w$]+)\(/.exec(rest)

    if (!chainMatch) {
      searchFrom = callStart + m[0].length
      continue
    }

    const chain = normalise(chainMatch[1])
    const argStart = afterCall + chainMatch[0].length - 1
    const [arg, afterArg] = readCall(out, argStart)
    const rule = RULES.find(([re]) => re.test(chain))

    if (!rule || arg === null) {
      searchFrom = callStart + m[0].length
      continue
    }

    const [, mode, assertion] = rule
    let replacement

    if (mode === 'attr') {
      const args = splitTopLevel(arg)
      const name = attributeName(args[0] ?? '')

      if (name === null) {
        searchFrom = callStart + m[0].length
        continue
      }

      used.root = true
      const negated = chain.startsWith('not.')
      const value = args[1]
      const call =
        negated || value === undefined
          ? `toHaveAttribute('${name}')`
          : `toHaveAttribute('${name}', ${value})`

      replacement = `expect(root(${inner.trim()})).${negated ? 'not.' : ''}${call}`
    } else if (mode === 'domQuery') {
      if (!isCssSelector(arg)) {
        // e.g. descendants('Button') — a component name. Leave it for a human.
        searchFrom = callStart + m[0].length
        continue
      }
      used.dom = true
      replacement = `expect(dom(${inner.trim()}).querySelector(${arg.trim()})).${assertion(arg)}`
    } else {
      used[mode] = true
      replacement = `expect(${mode}(${inner.trim()})).${assertion(arg.trim())}`
    }

    out = out.slice(0, callStart) + replacement + out.slice(afterArg)
    searchFrom = callStart + replacement.length
  }

  const helpers = Object.entries(used)
    .filter(([, v]) => v)
    .map(([k]) => k)

  if (helpers.length > 0 && !out.includes("from 'test/support/rtl'")) {
    out = out.replace(
      /^(import .*\n)/m,
      `import { ${helpers.sort().join(', ')} } from 'test/support/rtl'\n$1`,
    )
  }

  return out
}
