import { dom } from 'test/support/rtl'
import { fireEvent } from '@testing-library/react'
import React from 'react'

import Pagination from 'src/addons/Pagination/Pagination'
import PaginationItem from 'src/addons/Pagination/PaginationItem'
import * as common from 'test/support/commonTests'

const requiredProps = {
  totalPages: 0,
}

describe('Pagination', () => {
  common.isConformant(Pagination, { requiredProps })
  common.forwardsRef(Pagination, { requiredProps, tagName: 'div' })
  common.hasSubcomponents(Pagination, [PaginationItem])

  // Pagination renders each item as an <a class="item"> carrying its own
  // `type` and `value` attributes, which is what the prop assertions become.
  const itemsOf = (element) => [...dom(element).querySelectorAll('a.item')]

  describe('disabled', () => {
    it('is passed to an each item', () => {
      const items = itemsOf(<Pagination activePage={1} disabled totalPages={3} />)

      expect(items.length).toBeGreaterThan(0)
      for (const item of items) {
        expect(item).toHaveAttribute('aria-disabled', 'true')
      }
    })
  })

  describe('onPageChange', () => {
    it('is called with (e, data) when clicked on a pagination item', () => {
      const onPageChange = vi.fn()
      const onPageItemClick = vi.fn()

      const items = itemsOf(
        <Pagination
          activePage={1}
          onPageChange={onPageChange}
          pageItem={{ onClick: onPageItemClick }}
          totalPages={3}
        />,
      )

      fireEvent.click(items[4])

      expect(onPageChange).toHaveBeenCalledTimes(1)
      expect(onPageChange.mock.calls[0][1]).toMatchObject({ activePage: 3 })
      expect(onPageItemClick).toHaveBeenCalledTimes(1)
      expect(onPageItemClick.mock.calls[0][1]).toMatchObject({ value: 3 })
    })

    it('will be omitted if occurred for the same pagination item as the current', () => {
      const onPageChange = vi.fn()
      const items = itemsOf(
        <Pagination
          activePage={1}
          firstItem={null}
          onPageChange={onPageChange}
          prevItem={null}
          totalPages={3}
        />,
      )

      fireEvent.click(items[0])

      expect(onPageChange).not.toHaveBeenCalled()
    })

    it('will be omitted when item "type" is "ellipsisItem"', () => {
      const onPageChange = vi.fn()
      const items = itemsOf(
        <Pagination
          activePage={5}
          firstItem={null}
          onPageChange={onPageChange}
          prevItem={null}
          totalPages={10}
        />,
      )

      fireEvent.click(items[1])

      expect(onPageChange).not.toHaveBeenCalled()
    })
  })

  describe('activePage', () => {
    it('defaults to "1"', () => {
      const items = itemsOf(<Pagination totalPages={3} />)

      expect(items[1]).toHaveAttribute('value', '1')
      expect(items[5]).toHaveAttribute('value', '2')
    })

    it('can be set via "defaultActivePage"', () => {
      expect(itemsOf(<Pagination defaultActivePage={2} totalPages={3} />)[3]).toHaveClass('active')
    })

    it('can be set via "activePage"', () => {
      expect(itemsOf(<Pagination activePage={2} totalPages={3} />)[3]).toHaveClass('active')
    })
  })
})
