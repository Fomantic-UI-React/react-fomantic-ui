import { dom } from 'test/support/rtl'
import React from 'react'

import FormCheckbox from 'src/collections/Form/FormCheckbox'
import * as common from 'test/support/commonTests'

describe('FormCheckbox', () => {
  common.isConformant(FormCheckbox, {
    ignoredTypingsProps: ['type'],
  })

  it('renders a FormField with a Checkbox control', () => {
    expect(
      dom(<FormCheckbox />).querySelector('.field > .ui.checkbox input[type="checkbox"]'),
    ).not.toBeNull()
  })

  common.forwardsRef(FormCheckbox, { tagName: 'input' })
})
