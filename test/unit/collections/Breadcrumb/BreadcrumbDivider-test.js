import { root } from 'test/support/rtl'
import React from 'react'

import BreadcrumbDivider from 'src/collections/Breadcrumb/BreadcrumbDivider'
import * as common from 'test/support/commonTests'

describe('BreadcrumbDivider', () => {
  common.isConformant(BreadcrumbDivider)
  common.forwardsRef(BreadcrumbDivider)
  common.forwardsRef(BreadcrumbDivider, { requiredProps: { content: 'word' } })
  common.rendersChildren(BreadcrumbDivider)

  common.implementsIconProp(BreadcrumbDivider, {
    autoGenerateKey: false,
    shorthandDefaultProps: {
      className: 'divider',
    },
  })

  it('renders as a div by default', () => {
    expect(root(<BreadcrumbDivider />)).toHaveTagName('div')
  })
})
