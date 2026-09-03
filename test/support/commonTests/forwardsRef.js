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
      expect(ReactIs.isForwardRef(<RootComponent {...requiredProps} />)).toBe(true)
    })

    it('has an anonymous render function', () => {
      expect(RootComponent.render.name).toBe('')
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
