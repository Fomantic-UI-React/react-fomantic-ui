import { root } from 'test/support/rtl'
import React from 'react'

import DropdownText from 'src/modules/Dropdown/DropdownText'
import * as common from 'test/support/commonTests'

describe('DropdownText', () => {
  common.isConformant(DropdownText)
  common.forwardsRef(DropdownText)
  common.rendersChildren(DropdownText)

  it('aria attributes', () => {
    const element = root(<DropdownText />)

    expect(element).toHaveAttribute('aria-live', 'polite')
    expect(element).toHaveAttribute('aria-atomic', 'true')
    expect(element).toHaveAttribute('role', 'alert')
  })

  it('renders the "text" class, not "divider"', () => {
    const element = root(<DropdownText />)

    expect(element).toHaveClass('text')
    expect(element).not.toHaveClass('divider')
  })
})
