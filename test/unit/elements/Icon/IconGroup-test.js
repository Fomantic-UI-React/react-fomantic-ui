import { root } from 'test/support/rtl'
import React from 'react'
import IconGroup from 'src/elements/Icon/IconGroup'
import * as common from 'test/support/commonTests'

describe('IconGroup', () => {
  common.isConformant(IconGroup)
  common.rendersChildren(IconGroup)

  it('renders as an <i> by default', () => {
    expect(root(<IconGroup />)).toHaveTagName('i')
  })
})
