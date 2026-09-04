import { root } from 'test/support/rtl'
import { fireEvent } from '@testing-library/react'
import React from 'react'

import PaginationItem from 'src/addons/Pagination/PaginationItem'
import * as common from 'test/support/commonTests'

describe('PaginationItem', () => {
  common.isConformant(PaginationItem)
  common.forwardsRef(PaginationItem, { tagName: 'a' })
  common.implementsCreateMethod(PaginationItem)

  describe('active', () => {
    it('is not set by default', () => {
      expect(root(<PaginationItem />)).not.toHaveClass('active')
    })

    it('is set when defined', () => {
      expect(root(<PaginationItem active />)).toHaveClass('active')
    })
  })

  describe('disabled', () => {
    it('is not set by default', () => {
      const item = root(<PaginationItem />)

      expect(item).not.toHaveClass('disabled')
      expect(item).toHaveAttribute('aria-disabled', 'false')
    })

    it('is set when "type" is "ellipsisItem"', () => {
      const item = root(<PaginationItem type='ellipsisItem' />)

      expect(item).toHaveClass('disabled')
      expect(item).toHaveAttribute('aria-disabled', 'true')
    })

    it('is set when defined', () => {
      const item = root(<PaginationItem disabled />)

      expect(item).toHaveClass('disabled')
      expect(item).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('onClick', () => {
    it('is called with (e, props) when clicked', () => {
      const onClick = vi.fn()

      fireEvent.click(root(<PaginationItem onClick={onClick} />))

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls[0][1]).toMatchObject({ onClick })
    })

    it('is called with (e, props) when "Enter" is pressed', () => {
      const onClick = vi.fn()

      fireEvent.keyDown(root(<PaginationItem onClick={onClick} />), { key: 'Enter' })

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls[0][1]).toMatchObject({ onClick })
    })
  })

  describe('onKeyDown', () => {
    it('is called with (e, props) on key down', () => {
      const onKeyDown = vi.fn()

      fireEvent.keyDown(root(<PaginationItem onKeyDown={onKeyDown} />), { key: 'Enter' })

      expect(onKeyDown).toHaveBeenCalledTimes(1)
      expect(onKeyDown.mock.calls[0][1]).toMatchObject({ onKeyDown })
    })
  })

  describe('tabIndex', () => {
    it('is "0" by default', () => {
      expect(root(<PaginationItem />)).toHaveAttribute('tabindex', '0')
    })

    it('is "-1" when "type" is "ellipsisItem"', () => {
      expect(root(<PaginationItem type='ellipsisItem' />)).toHaveAttribute('tabindex', '-1')
    })

    it('can be overridden', () => {
      expect(root(<PaginationItem tabIndex={5} />)).toHaveAttribute('tabindex', '5')
    })
  })
})
