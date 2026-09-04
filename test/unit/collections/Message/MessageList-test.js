import { dom, root } from 'test/support/rtl'
import React from 'react'
import MessageList from 'src/collections/Message/MessageList'
import * as common from 'test/support/commonTests'

describe('MessageList', () => {
  common.isConformant(MessageList)
  common.forwardsRef(MessageList, { tagName: 'ul' })
  common.implementsCreateMethod(MessageList)
  common.rendersChildren(MessageList, {
    rendersContent: false,
  })

  it('renders an ul tag', () => {
    expect(root(<MessageList />)).toHaveTagName('ul')
  })

  it('has className list', () => {
    expect(root(<MessageList />)).toHaveClass('list')
  })

  describe('items', () => {
    it('creates MessageItem children', () => {
      const items = ['foo', 'bar', 'baz']
      const rendered = dom(<MessageList items={items} />).querySelectorAll('li')

      expect(rendered).toHaveLength(3)
      items.forEach((item, index) => expect(rendered[index]).toHaveTextContent(item))
    })
  })
})
