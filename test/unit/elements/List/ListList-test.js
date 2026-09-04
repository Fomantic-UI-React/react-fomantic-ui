import { root } from 'test/support/rtl'
import React from 'react'

import ListList from 'src/elements/List/ListList'
import * as common from 'test/support/commonTests'

describe('ListList', () => {
  common.isConformant(ListList)
  common.forwardsRef(ListList)
  common.rendersChildren(ListList)

  describe('list', () => {
    it('omitted when rendered as `ol`', () => {
      expect(root(<ListList as='ol' />)).not.toHaveClass('list')
    })

    it('omitted when rendered as `ul`', () => {
      expect(root(<ListList as='ul' />)).not.toHaveClass('list')
    })
  })
})
