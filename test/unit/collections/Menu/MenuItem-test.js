import { dom, root } from 'test/support/rtl'
import { fireEvent } from '@testing-library/react'
import React from 'react'

import MenuItem from 'src/collections/Menu/MenuItem'
import { SUI } from 'src/lib'
import * as common from 'test/support/commonTests'

describe('MenuItem', () => {
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
    it('renders a `div` by default', () => {
      expect(root(<MenuItem />)).toHaveTagName('div')
    })

    it('renders an `a` tag', () => {
      expect(root(<MenuItem onClick={() => null} />)).toHaveTagName('a')
    })
  })

  describe('name', () => {
    it('uses the name prop as Start Cased child text', () => {
      expect(dom(<MenuItem name='upcomingEvents' />)).toHaveTextContent('Upcoming Events')
    })
  })

  describe('icon', () => {
    it('does not add `icon` className if there is also `name`', () => {
      expect(root(<MenuItem icon='user' name='users' />)).not.toHaveClass('icon')
    })
    it('does not add `icon` className if there is also `content`', () => {
      expect(root(<MenuItem icon='user' content='Users' />)).not.toHaveClass('icon')
    })
    it('adds `icon` className if there is an `icon` without `name` or `content`', () => {
      expect(root(<MenuItem icon='user' />)).toHaveClass('icon')
    })
  })

  describe('onClick', () => {
    it('is called with (e, data) when clicked', () => {
      const onClick = vi.fn()
      const props = { name: 'home', index: 0 }

      fireEvent.click(root(<MenuItem onClick={onClick} {...props} />))

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls[0][0]).toMatchObject({ type: 'click' })
      expect(onClick.mock.calls[0][1]).toMatchObject(props)
    })

    it('is not called when is disabled', () => {
      const onClick = vi.fn()

      fireEvent.click(root(<MenuItem disabled onClick={onClick} />))

      expect(onClick).not.toHaveBeenCalled()
    })
  })
})
