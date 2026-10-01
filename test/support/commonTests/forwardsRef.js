import { render } from '@testing-library/react'
import * as React from 'react'
import * as ReactIs from 'react-is'

import consoleUtil from '../consoleUtil'

/** Assert a component forwards its ref to the expected host element. */
export default function forwardsRef(Component, options = {}) {
  describe('forwardsRef', () => {
    const { isMemoized = false, requiredProps = {}, tagName = 'div' } = options
    const RootComponent = isMemoized ? Component.type : Component

    it('is produced by a React.forwardRef() call', () => {
      // Checks the type rather than `ReactIs.isForwardRef(<RootComponent />)`,
      // which only recognises elements from the same major version of React.
      expect(RootComponent.$$typeof).toBe(ReactIs.ForwardRef)
    })

    it('has an anonymous render function', () => {
      // Assigning `displayName` to a forwardRef copies it onto the render
      // function only if that function has no name of its own. React 19 also
      // sets its `name`, so `name` cannot be asserted empty across versions.
      expect(RootComponent.render.displayName).toBe(RootComponent.displayName)
    })

    it(`forwards ref to "${tagName}"`, () => {
      const ref = vi.fn()

      // Rendering elements like "td" standalone produces a nesting warning.
      consoleUtil.disableOnce()
      render(<Component {...requiredProps} ref={ref} />)

      expect(ref).toHaveBeenCalledTimes(1)
      expect(ref.mock.calls[0][0]).toMatchObject({ tagName: tagName.toUpperCase() })
    })
  })
}
