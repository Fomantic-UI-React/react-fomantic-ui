import { root } from 'test/support/rtl'
import React from 'react'

import * as common from 'test/support/commonTests'
import TableFooter from 'src/collections/Table/TableFooter'

describe('TableFooter', () => {
  common.isConformant(TableFooter)
  common.forwardsRef(TableFooter, { tagName: 'tfoot' })

  it('renders as a tfoot by default', () => {
    expect(root(<TableFooter />)).toHaveTagName('tfoot')
  })
})
