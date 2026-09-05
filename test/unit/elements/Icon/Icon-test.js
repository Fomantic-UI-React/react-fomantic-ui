import { root } from 'test/support/rtl'
import _ from 'lodash'

import userEvent from '@testing-library/user-event'
import React from 'react'

import Icon from 'src/elements/Icon/Icon'
import IconGroup from 'src/elements/Icon/IconGroup'
import { SUI } from 'src/lib'
import * as common from 'test/support/commonTests'

describe('Icon', () => {
  // Interactions go through user-event, which sends the pointer, focus and
  // keyboard sequence a browser does rather than the single event `fireEvent`
  // dispatches.
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  common.isConformant(Icon)
  common.forwardsRef(Icon, { isMemoized: true, tagName: 'i' })
  common.hasSubcomponents(Icon, [IconGroup])

  common.implementsCreateMethod(Icon)

  common.propKeyAndValueToClassName(Icon, 'flipped', ['horizontally', 'vertically'])
  common.propKeyAndValueToClassName(Icon, 'rotated', ['clockwise', 'counterclockwise'])

  common.propKeyOnlyToClassName(Icon, 'bordered')
  common.propKeyOnlyToClassName(Icon, 'circular')
  common.propKeyOnlyToClassName(Icon, 'disabled')
  common.propKeyOnlyToClassName(Icon, 'fitted')
  common.propKeyOnlyToClassName(Icon, 'inverted')
  common.propKeyOnlyToClassName(Icon, 'link')
  common.propKeyOnlyToClassName(Icon, 'loading')

  common.propKeyOrValueAndKeyToClassName(Icon, 'corner', [
    'top left',
    'top right',
    'bottom left',
    'bottom right',
  ])

  common.propValueOnlyToClassName(Icon, 'color', SUI.COLORS)
  common.propValueOnlyToClassName(Icon, 'name', ['money'])
  common.propValueOnlyToClassName(Icon, 'size', _.without(SUI.SIZES, 'medium'))

  it('renders as an <i> by default', async () => {
    expect(root(<Icon />)).toHaveTagName('i')
  })

  describe('aria-hidden', () => {
    it('should add aria-hidden by default', async () => {
      expect(root(<Icon />)).toHaveAttribute('aria-hidden', 'true')
    })

    it('should pass aria-hidden', async () => {
      expect(root(<Icon aria-hidden='true' />)).toHaveAttribute('aria-hidden', 'true')
      expect(root(<Icon aria-hidden='false' />)).toHaveAttribute('aria-hidden', 'false')
    })

    it('should passed aria-hidden with aria-label', async () => {
      expect(root(<Icon aria-hidden='false' aria-label='icon' />)).toHaveAttribute(
        'aria-hidden',
        'false',
      )
    })
  })

  describe('aria-label', () => {
    it('should not applied by default', async () => {
      expect(root(<Icon />)).not.toHaveAttribute('aria-label')
    })

    it('should pass value and omit aria-hidden when is set', async () => {
      const icon = root(<Icon aria-label='icon' />)

      expect(icon).not.toHaveAttribute('aria-hidden')
      expect(icon).toHaveAttribute('aria-label', 'icon')
    })
  })

  describe('onClick', () => {
    it('is called with (e, data) when clicked', async () => {
      const onClick = vi.fn()
      await user.click(root(<Icon onClick={onClick} />))

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'click' }),
        expect.objectContaining({ onClick }),
      )
    })

    it('is not called when "disabled" is true', async () => {
      const onClick = vi.fn()
      const element = root(<Icon disabled onClick={onClick} />)

      // A disabled Icon must both swallow the handler and stop the default.
      // The event is kept and read after the click resolves: a listener on the
      // element runs before React's handler on the container, so
      // `defaultPrevented` read inside it is always false.
      let event = null
      element.addEventListener('click', (e) => {
        event = e
      })
      await user.click(element)

      expect(onClick).not.toHaveBeenCalled()
      expect(event.defaultPrevented).toBe(true)
    })
  })
})
