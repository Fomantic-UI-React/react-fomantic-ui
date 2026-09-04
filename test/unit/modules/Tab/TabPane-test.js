import { root } from 'test/support/rtl'
import React from 'react'

import TabPane from 'src/modules/Tab/TabPane'
import * as common from 'test/support/commonTests'

describe('TabPane', () => {
  common.isConformant(TabPane)
  common.forwardsRef(TabPane)

  common.implementsCreateMethod(TabPane)

  common.propKeyOnlyToClassName(TabPane, 'active', { defaultValue: 'left' })
  common.propKeyOnlyToClassName(TabPane, 'loading')

  it('renders a Segment by default', () => {
    expect(root(<TabPane />)).toHaveClass('segment')
  })
})
