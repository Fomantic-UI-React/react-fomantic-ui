import React from 'react'

import ListIcon from 'src/elements/List/ListIcon'
import * as common from 'test/support/commonTests'
import { dom } from 'test/support/rtl'

describe('ListIcon', () => {
  common.isConformant(ListIcon)
  common.implementsVerticalAlignProp(ListIcon)

  it('returns Icon component', () => {
    expect(dom(<ListIcon />).querySelector('i.icon')).not.toBeNull()
  })
})
