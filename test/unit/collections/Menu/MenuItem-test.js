import { dom, root } from 'test/support/rtl'

import userEvent from '@testing-library/user-event'
import React from 'react'

import MenuItem from 'src/collections/Menu/MenuItem'
import { SUI } from 'src/lib'
import * as common from 'test/support/commonTests'

describe('MenuItem', () => {
  // Interactions go through user-event, which sends the pointer, focus and
  // keyboard sequence a browser does rather than the single event `fireEvent`
  // dispatches.
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  common.isConformant(MenuItem)
  common.forwardsRef(MenuItem)
  common.forwardsRef(MenuItem, { requiredProps: { children: <span /> } })
  common.rendersChildren(MenuItem)

  common.implementsCreateMethod(MenuItem)
  common.implementsIconProp(MenuItem, { autoGenerateKey: false })

  common.propKeyOnlyToClassName(MenuItem, 'active')
  common.propKeyOnlyToClassName(MenuItem, 'disabled')
  common.propKeyOnlyToClassName(MenuItem, 'header')
  common.propKeyOnlyToClassName(MenuItem, 'icon')
  common.propKeyOnlyToClassName(MenuItem, 'link')

  common.propKeyOrValueAndKeyToClassName(MenuItem, 'fitted', ['horizontally', 'vertically'])

  common.propValueOnlyToClassName(MenuItem, 'color', SUI.COLORS)
  common.propValueOnlyToClassName(MenuItem, 'position', ['left', 'right'])

  describe('as', () => {
    it('renders a `div` by default', async () => {
      expect(root(<MenuItem />)).toHaveTagName('div')
    })

    it('renders an `a` tag', async () => {
      expect(root(<MenuItem onClick={() => null} />)).toHaveTagName('a')
    })
  })

  describe('name', () => {
    it('uses the name prop as Start Cased child text', async () => {
      expect(dom(<MenuItem name='upcomingEvents' />)).toHaveTextContent('Upcoming Events')
    })
  })

  describe('icon', () => {
    it('does not add `icon` className if there is also `name`', async () => {
      expect(root(<MenuItem icon='user' name='users' />)).not.toHaveClass('icon')
    })
    it('does not add `icon` className if there is also `content`', async () => {
      expect(root(<MenuItem icon='user' content='Users' />)).not.toHaveClass('icon')
    })
    it('adds `icon` className if there is an `icon` without `name` or `content`', async () => {
      expect(root(<MenuItem icon='user' />)).toHaveClass('icon')
    })
  })

  describe('onClick', () => {
    it('is called with (e, data) when clicked', async () => {
      const onClick = vi.fn()
      const props = { name: 'home', index: 0 }

      await user.click(root(<MenuItem onClick={onClick} {...props} />))

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls[0][0]).toMatchObject({ type: 'click' })
      expect(onClick.mock.calls[0][1]).toMatchObject(props)
    })

    it('is not called when is disabled', async () => {
      const onClick = vi.fn()

      await user.click(root(<MenuItem disabled onClick={onClick} />))

      expect(onClick).not.toHaveBeenCalled()
    })
  })
})
