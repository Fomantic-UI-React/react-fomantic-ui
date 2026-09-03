import { render } from '@testing-library/react'
import React, { createElement } from 'react'

import helpers from './commonHelpers'

const TEXT = 'renders child text'
const CHILD_MARKER = 'data-child'

/** Assert a component renders children somewhere in the tree. */
export default (Component, options = {}) => {
  const { rendersContent = true, requiredProps = {} } = options
  const { assertRequired } = helpers('rendersChildren', Component)

  assertRequired(Component, 'a `Component`')

  // `children` and `content` are two routes to the same output, so both are
  // asserted the same way: against the rendered DOM rather than the element
  // tree Enzyme's shallow() used to expose.
  const assertRenders = (describeName, propsFor) => {
    describe(describeName, () => {
      it('renders child text', () => {
        const { container } = render(createElement(Component, ...propsFor(TEXT)))

        expect(container.textContent).toContain(TEXT)
      })

      it('renders child components', () => {
        const child = <div {...{ [CHILD_MARKER]: true }} />
        const { container } = render(createElement(Component, ...propsFor(child)))

        expect(container.querySelector(`[${CHILD_MARKER}]`)).not.toBeNull()
      })

      it('renders child number with 0 value', () => {
        const { container } = render(createElement(Component, ...propsFor(0)))

        expect(container.textContent).toContain('0')
      })
    })
  }

  assertRenders('children (common)', (value) => [requiredProps, value])

  if (rendersContent) {
    assertRenders('content (common)', (value) => [{ ...requiredProps, content: value }])
  }
}
