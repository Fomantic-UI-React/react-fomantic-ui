import { dom } from 'test/support/rtl'
import _ from 'lodash'

import userEvent from '@testing-library/user-event'
import React from 'react'

import Message from 'src/collections/Message/Message'
import MessageContent from 'src/collections/Message/MessageContent'
import MessageHeader from 'src/collections/Message/MessageHeader'
import MessageList from 'src/collections/Message/MessageList'
import { SUI } from 'src/lib'
import * as common from 'test/support/commonTests'

describe('Message', () => {
  // Interactions go through user-event, which sends the pointer, focus and
  // keyboard sequence a browser does rather than the single event `fireEvent`
  // dispatches.
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  common.isConformant(Message)
  common.forwardsRef(Message)
  common.forwardsRef(Message, { requiredProps: { children: <span /> } })
  common.hasSubcomponents(Message, [MessageContent, MessageHeader, MessageList])
  common.hasUIClassName(Message)
  common.rendersChildren(Message, {
    rendersContent: false,
  })

  common.implementsIconProp(Message, { autoGenerateKey: false })
  common.implementsShorthandProp(Message, {
    autoGenerateKey: false,
    propKey: 'content',
    ShorthandComponent: 'p',
    mapValueToProps: (val) => ({ children: val }),
  })
  common.implementsShorthandProp(Message, {
    autoGenerateKey: false,
    propKey: 'header',
    ShorthandComponent: MessageHeader,
    mapValueToProps: (val) => ({ content: val }),
  })
  common.implementsShorthandProp(Message, {
    autoGenerateKey: false,
    propKey: 'list',
    ShorthandComponent: MessageList,
    mapValueToProps: (val) => ({ items: val }),
  })

  common.propKeyOnlyToClassName(Message, 'compact')
  common.propKeyOnlyToClassName(Message, 'error')
  common.propKeyOnlyToClassName(Message, 'floating')
  common.propKeyOnlyToClassName(Message, 'hidden')
  common.propKeyOnlyToClassName(Message, 'icon')
  common.propKeyOnlyToClassName(Message, 'info')
  common.propKeyOnlyToClassName(Message, 'negative')
  common.propKeyOnlyToClassName(Message, 'positive')
  common.propKeyOnlyToClassName(Message, 'success')
  common.propKeyOnlyToClassName(Message, 'visible')
  common.propKeyOnlyToClassName(Message, 'warning')

  common.propKeyOrValueAndKeyToClassName(Message, 'attached', ['bottom', 'top'])

  common.propValueOnlyToClassName(Message, 'color', SUI.COLORS)
  common.propValueOnlyToClassName(Message, 'size', _.without(SUI.SIZES, 'medium'))

  describe('header', () => {
    it('adds MessageContent when defined', async () => {
      expect(dom(<Message header='This is a message' />).querySelector('.content')).not.toBeNull()
    })
  })

  describe('icon', () => {
    it('does not have MessageContent by default', async () => {
      expect(dom(<Message />).querySelector('.content')).toBeNull()
    })
    it('renders children when "true"', async () => {
      const text = 'child text'
      const node = <div id='foo' />

      expect(dom(<Message icon>{text}</Message>)).toHaveTextContent(text)

      expect(dom(<Message icon>{node}</Message>).querySelector('#foo')).not.toBeNull()
    })
  })

  describe('list', () => {
    it('adds MessageContent when defined', async () => {
      expect(dom(<Message list={[]} />).querySelector('.content')).not.toBeNull()
    })
  })

  describe('onDismiss', () => {
    it('has no close icon by default', async () => {
      expect(dom(<Message />).querySelector('.close.icon')).toBeNull()
    })

    it('adds a close icon when defined', async () => {
      expect(
        dom(<Message onDismiss={() => undefined} />).querySelector('.close.icon'),
      ).not.toBeNull()
    })

    it('is called with (event) on close icon click', async () => {
      const props = { icon: true }
      const spy = vi.fn()
      const container = dom(<Message {...props} onDismiss={spy} />)
      const close = container.querySelector('.close.icon')

      expect(close).not.toBeNull()
      await user.click(close)

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls[0][0]).toMatchObject({ type: 'click' })
      expect(spy.mock.calls[0][1]).toMatchObject(props)
    })
  })
})
