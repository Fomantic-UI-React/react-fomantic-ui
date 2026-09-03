import { render } from '@testing-library/react'
import React from 'react'

import helpers from './commonHelpers'

/** Assert a component adds the Semantic UI "ui" className. */
export default (Component, options = {}) => {
  const { requiredProps = {} } = options
  const { assertRequired } = helpers('hasUIClassName', Component)

  it('has the "ui" className', () => {
    assertRequired(Component, 'a `Component`')
    const { container } = render(<Component {...requiredProps} />)

    expect(container.firstElementChild).toHaveClass('ui')
  })
}
