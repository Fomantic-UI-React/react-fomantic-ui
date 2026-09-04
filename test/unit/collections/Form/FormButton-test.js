import { dom } from 'test/support/rtl'
import React from 'react'

import FormButton from 'src/collections/Form/FormButton'
import * as common from 'test/support/commonTests'

describe('FormButton', () => {
  common.isConformant(FormButton, {
    ignoredTypingsProps: ['label'],
  })
  common.labelImplementsHtmlForProp(FormButton)

  it('renders a FormField with a Button control', () => {
    expect(dom(<FormButton />).querySelector('.field > button.ui.button')).not.toBeNull()
  })

  common.forwardsRef(FormButton, { tagName: 'button' })
})
