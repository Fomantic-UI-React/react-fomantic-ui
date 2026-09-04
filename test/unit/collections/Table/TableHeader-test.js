import { root } from 'test/support/rtl'
import React from 'react'

import * as common from 'test/support/commonTests'
import TableHeader from 'src/collections/Table/TableHeader'

describe('TableHeader', () => {
  common.isConformant(TableHeader)
  common.forwardsRef(TableHeader, { tagName: 'thead' })
  common.rendersChildren(TableHeader)

  common.propKeyOnlyToClassName(TableHeader, 'fullWidth', {
    className: 'full-width',
  })

  it('renders as a thead by default', () => {
    expect(root(<TableHeader />)).toHaveTagName('thead')
  })
})
