import { dom } from 'test/support/rtl'
import React from 'react'

import FormSelect from 'src/collections/Form/FormSelect'
import * as common from 'test/support/commonTests'

const requiredProps = {
  options: [],
}

describe('FormSelect', () => {
  common.isConformant(FormSelect, { requiredProps, ignoredTypingsProps: ['error'] })
  common.labelImplementsHtmlForProp(FormSelect, { requiredProps })
  common.forwardsRef(FormSelect, { requiredProps })

  it('renders a FormField with a Select control', () => {
    expect(
      dom(<FormSelect options={[]} />).querySelector('.field > .ui.selection.dropdown'),
    ).not.toBeNull()
  })
})
