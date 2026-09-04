import { root } from 'test/support/rtl'
import React from 'react'

import Divider from 'src/elements/Divider/Divider'
import * as common from 'test/support/commonTests'

describe('Divider', () => {
  common.isConformant(Divider)
  common.forwardsRef(Divider)
  common.rendersChildren(Divider)
  common.hasUIClassName(Divider)

  common.propKeyOnlyToClassName(Divider, 'horizontal')
  common.propKeyOnlyToClassName(Divider, 'vertical')
  common.propKeyOnlyToClassName(Divider, 'inverted')
  common.propKeyOnlyToClassName(Divider, 'fitted')
  common.propKeyOnlyToClassName(Divider, 'hidden')
  common.propKeyOnlyToClassName(Divider, 'section')
  common.propKeyOnlyToClassName(Divider, 'clearing')

  it('renders a <div /> element', () => {
    expect(root(<Divider />)).toHaveTagName('div')
  })

  it('adds the "divider" class', () => {
    expect(root(<Divider />)).toHaveClass('divider')
  })
})
