import { dom } from 'test/support/rtl'
import React from 'react'

import FormDropdown from 'src/collections/Form/FormDropdown'
import * as common from 'test/support/commonTests'

describe('FormDropdown', () => {
  common.isConformant(FormDropdown, { ignoredTypingsProps: ['error'] })
  common.labelImplementsHtmlForProp(FormDropdown)
  common.forwardsRef(FormDropdown)

  it('renders a FormField with a Dropdown control', () => {
    expect(dom(<FormDropdown />).querySelector('.field > .ui.dropdown')).not.toBeNull()
  })
})
