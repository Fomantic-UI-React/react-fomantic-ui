import { root } from 'test/support/rtl'

import userEvent from '@testing-library/user-event'
import React from 'react'

import PaginationItem from 'src/addons/Pagination/PaginationItem'
import * as common from 'test/support/commonTests'

describe('PaginationItem', () => {
  // Interactions go through user-event, which sends the pointer, focus and
  // keyboard sequence a browser does rather than the single event `fireEvent`
  // dispatches.
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  common.isConformant(PaginationItem)
  common.forwardsRef(PaginationItem, { tagName: 'a' })
  common.implementsCreateMethod(PaginationItem)

  describe('active', () => {
    it('is not set by default', async () => {
      expect(root(<PaginationItem />)).not.toHaveClass('active')
    })

    it('is set when defined', async () => {
      expect(root(<PaginationItem active />)).toHaveClass('active')
    })
  })

  describe('disabled', () => {
    it('is not set by default', async () => {
      const item = root(<PaginationItem />)

      expect(item).not.toHaveClass('disabled')
      expect(item).toHaveAttribute('aria-disabled', 'false')
    })

    it('is set when "type" is "ellipsisItem"', async () => {
      const item = root(<PaginationItem type='ellipsisItem' />)

      expect(item).toHaveClass('disabled')
      expect(item).toHaveAttribute('aria-disabled', 'true')
    })

    it('is set when defined', async () => {
      const item = root(<PaginationItem disabled />)

      expect(item).toHaveClass('disabled')
      expect(item).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('onClick', () => {
    it('is called with (e, props) when clicked', async () => {
      const onClick = vi.fn()

      await user.click(root(<PaginationItem onClick={onClick} />))

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls[0][1]).toMatchObject({ onClick })
    })

    it('is called with (e, props) when "Enter" is pressed', async () => {
      const onClick = vi.fn()

      // Tab onto the item and press enter, rather than clicking — a click
      // would call onClick itself and the assertion would not mean anything.
      root(<PaginationItem onClick={onClick} />)
      await user.tab()
      await user.keyboard('{Enter}')

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls[0][1]).toMatchObject({ onClick })
    })
  })

  describe('onKeyDown', () => {
    it('is called with (e, props) on key down', async () => {
      const onKeyDown = vi.fn()

      root(<PaginationItem onKeyDown={onKeyDown} />)
      await user.tab()
      await user.keyboard('{Enter}')

      expect(onKeyDown).toHaveBeenCalledTimes(1)
      expect(onKeyDown.mock.calls[0][1]).toMatchObject({ onKeyDown })
    })
  })

  describe('tabIndex', () => {
    it('is "0" by default', async () => {
      expect(root(<PaginationItem />)).toHaveAttribute('tabindex', '0')
    })

    it('is "-1" when "type" is "ellipsisItem"', async () => {
      expect(root(<PaginationItem type='ellipsisItem' />)).toHaveAttribute('tabindex', '-1')
    })

    it('can be overridden', async () => {
      expect(root(<PaginationItem tabIndex={5} />)).toHaveAttribute('tabindex', '5')
    })
  })
})
