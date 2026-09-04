import { root } from 'test/support/rtl'
import React from 'react'

import Flag from 'src/elements/Flag/Flag'
import * as common from 'test/support/commonTests'

const requiredProps = { name: 'us' }

describe('Flag', () => {
  common.isConformant(Flag, { requiredProps })
  common.forwardsRef(Flag, { isMemoized: true, requiredProps, tagName: 'i' })

  common.implementsCreateMethod(Flag)

  common.propValueOnlyToClassName(Flag, 'name', [], { requiredProps })

  it('renders an <i /> element', () => {
    expect(root(<Flag {...requiredProps} />)).toHaveTagName('i')
  })
})
