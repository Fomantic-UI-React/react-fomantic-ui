/**
 * ModernAutoControlledComponent-test.js asserts on a class component's internal
 * state, which Enzyme exposed and RTL does not.
 *
 * The fixture is defined in the spec and is a real class component, so a ref
 * gives the instance and its actual state object — lossless, unlike serialising
 * state into the DOM, and it keeps the assertions saying the same thing.
 */
import fs from 'fs'
import { joinWrappedChains, transform } from './chai2vitest.mjs'

const root = '/Users/ela/Projects/Semantic-UI-React'
let src = fs.readFileSync(`${root}/test/specs/lib/ModernAutoControlledComponent-test.js`, 'utf8')

src = src.replace(
  "import { consoleUtil } from 'test/utils'",
  "import { consoleUtil } from 'test/support'",
)
src = src.replace(
  "import React from 'react'",
  "import { act, render } from '@testing-library/react'\nimport React from 'react'",
)
src = src.replace(/^import faker from 'faker'\n/m, '')
src = src.split('faker.hacker.verb()').join("'verb'")
src = src.split('faker.hacker.phrase()').join("'faker phrase text'")

// Insert the ref-backed harness after the fixture factory.
const anchor = "const toDefaultName = (prop) =>"
src = src.replace(
  anchor,
  `/**
 * Renders the fixture and exposes the instance the way Enzyme's wrapper did.
 * The component under test is the base class, so reading its state directly is
 * the assertion, not an implementation detail leaking into the test.
 */
const renderTest = (element) => {
  const ref = React.createRef()
  const { rerender } = render(React.cloneElement(element, { ref }))

  return {
    get state() {
      return ref.current.state
    },
    setState(partial) {
      act(() => {
        ref.current.setState(partial)
      })
    },
    setProps(props) {
      act(() => {
        rerender(React.cloneElement(element, { ...props, ref }))
      })
    },
  }
}

${anchor}`,
)

src = src.replace(/\bshallow\(/g, 'renderTest(')

// Join first so wrapped chains are visible to the rewrites below.
src = joinWrappedChains(src)

// chai's `.state(k)` chains onto the value, which vitest cannot express;
// assert on the value directly.
src = src.replace(
  /\.should\.have\.state\((['"][^'"]+['"])\)\.to\.(eql|equal|deep\.equal)\(/g,
  '.state[$1].should.deep.equal(',
)

src = src.replace(/\.should\.have\.state\(/g, '.state.should.have.property(')
src = src.replace(/\.should\.not\.have\.state\(/g, '.state.should.not.have.property(')

const { code, unmapped } = transform(src)
fs.writeFileSync(`${root}/test/unit/lib/ModernAutoControlledComponent-test.js`, code)

console.log(unmapped.length ? `unmapped: ${[...new Set(unmapped)].join(', ')}` : 'no unmapped assertions')
