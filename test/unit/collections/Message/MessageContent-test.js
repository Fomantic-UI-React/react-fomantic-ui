import { root } from 'test/support/rtl'
import React from 'react'
import MessageContent from 'src/collections/Message/MessageContent'
import * as common from 'test/support/commonTests'

describe('MessageContent', () => {
  common.isConformant(MessageContent)
  common.forwardsRef(MessageContent)
  common.rendersChildren(MessageContent)

  it('renders an div tag', () => {
    expect(root(<MessageContent />)).toHaveTagName('div')
  })

  it('has className content', () => {
    expect(root(<MessageContent />)).toHaveClass('content')
  })
})
