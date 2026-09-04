import { root } from 'test/support/rtl'
import React from 'react'

import Container from 'src/elements/Container/Container'
import * as common from 'test/support/commonTests'

describe('Container', () => {
  common.isConformant(Container)
  common.forwardsRef(Container)
  common.rendersChildren(Container)
  common.hasUIClassName(Container)

  common.propKeyOnlyToClassName(Container, 'text')
  common.propKeyOnlyToClassName(Container, 'fluid')

  common.implementsTextAlignProp(Container)

  it('renders a <div /> element', () => {
    expect(root(<Container />)).toHaveTagName('div')
  })
})
