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

  it('renders the "divider" class', () => {
    // This is wrong, and is asserted so the fix has a test to flip. The class
    // is copy-pasted from DropdownDivider, so a Dropdown's selected-text node
    // renders as `class="divider default text"` and picks up divider styling.
    // See issue #31.
    expect(root(<DropdownText />)).toHaveClass('divider')
  })
})
