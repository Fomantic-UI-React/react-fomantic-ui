import { root } from 'test/support/rtl'
import React from 'react'

import * as common from 'test/support/commonTests'
import TableHeaderCell from 'src/collections/Table/TableHeaderCell'

describe('TableHeaderCell', () => {
  common.isConformant(TableHeaderCell)
  common.forwardsRef(TableHeaderCell, { tagName: 'th' })
  common.propKeyAndValueToClassName(TableHeaderCell, 'sorted', ['ascending', 'descending'])

  it('renders as a th by default', () => {
    expect(root(<TableHeaderCell />)).toHaveTagName('th')
  })
})
