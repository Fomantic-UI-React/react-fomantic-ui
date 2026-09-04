import { root } from 'test/support/rtl'
import React from 'react'

import * as common from 'test/support/commonTests'
import TableBody from 'src/collections/Table/TableBody'

describe('TableBody', () => {
  common.isConformant(TableBody)
  common.forwardsRef(TableBody, { tagName: 'tbody' })
  common.rendersChildren(TableBody, {
    rendersContent: false,
  })

  it('renders as a tbody by default', () => {
    expect(root(<TableBody />)).toHaveTagName('tbody')
  })
})
