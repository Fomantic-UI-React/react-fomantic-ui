import { dom } from 'test/support/rtl'
import React from 'react'

import FormTextArea from 'src/collections/Form/FormTextArea'
import * as common from 'test/support/commonTests'

describe('FormTextArea', () => {
  common.isConformant(FormTextArea)
  common.forwardsRef(FormTextArea, { tagName: 'textarea' })
  common.labelImplementsHtmlForProp(FormTextArea)

  it('renders a FormField with a TextArea control', () => {
    expect(dom(<FormTextArea />).querySelector('.field > textarea')).not.toBeNull()
  })
})
