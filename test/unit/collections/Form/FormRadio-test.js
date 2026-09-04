import { dom } from 'test/support/rtl'
import React from 'react'

import FormRadio from 'src/collections/Form/FormRadio'
import * as common from 'test/support/commonTests'

describe('FormRadio', () => {
  common.isConformant(FormRadio, {
    ignoredTypingsProps: ['type'],
  })
  common.forwardsRef(FormRadio, { tagName: 'input' })

  it('renders a FormField with a Radio control', () => {
    expect(
      dom(<FormRadio />).querySelector('.field > .ui.radio.checkbox input[type="radio"]'),
    ).not.toBeNull()
  })
})
