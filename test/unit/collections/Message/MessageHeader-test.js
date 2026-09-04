import { root } from 'test/support/rtl'
import React from 'react'

import MessageHeader from 'src/collections/Message/MessageHeader'
import * as common from 'test/support/commonTests'

describe('MessageHeader', () => {
  common.isConformant(MessageHeader)
  common.forwardsRef(MessageHeader)
  common.implementsCreateMethod(MessageHeader)
  common.rendersChildren(MessageHeader)

  it('renders an div tag', () => {
    expect(root(<MessageHeader />)).toHaveTagName('div')
  })

  it('has className header', () => {
    expect(root(<MessageHeader />)).toHaveClass('header')
  })
})
