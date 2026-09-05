import { dom, root } from 'test/support/rtl'
import _ from 'lodash'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { SUI } from 'src/lib'
import Rating from 'src/modules/Rating/Rating'
import * as common from 'test/support/commonTests'

describe('Rating', () => {
  // Interactions go through user-event, which sends the pointer, focus and
  // keyboard sequence a browser does rather than the single event `fireEvent`
  // dispatches.
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  common.isConformant(Rating)
  common.forwardsRef(Rating)
  common.hasUIClassName(Rating)

  common.propKeyOnlyToClassName(Rating, 'disabled')

  common.propValueOnlyToClassName(Rating, 'icon', ['star', 'heart'])
  common.propValueOnlyToClassName(Rating, 'size', _.without(SUI.SIZES, 'medium', 'big'))

  describe('clicking on icons', () => {
    it('makes icons active up to and including the clicked icon', async () => {
      const container = dom(<Rating maxRating={3} />)

      await user.click(container.querySelectorAll('[role="radio"]')[1])

      const icons = container.querySelectorAll('[role="radio"]')

      expect(icons[0]).toHaveClass('active')
      expect(icons[1]).toHaveClass('active')
      expect(icons[2]).not.toHaveClass('active')
    })

    it('if no rating selected no icon should have aria-checked', async () => {
      const icons = dom(<Rating maxRating={3} />).querySelectorAll('[role="radio"]')

      expect(icons[0]).toHaveAttribute('aria-checked', String(false))
      expect(icons[1]).toHaveAttribute('aria-checked', String(false))
      expect(icons[2]).toHaveAttribute('aria-checked', String(false))
    })

    it('makes the clicked icon aria-checked', async () => {
      const container = dom(<Rating maxRating={3} />)

      await user.click(container.querySelectorAll('[role="radio"]')[1])

      const icons = container.querySelectorAll('[role="radio"]')

      expect(icons[0]).toHaveAttribute('aria-checked', String(false))
      expect(icons[1]).toHaveAttribute('aria-checked', String(true))
      expect(icons[2]).toHaveAttribute('aria-checked', String(false))
    })

    it('set aria-setsize on each rating icon', async () => {
      const container = dom(<Rating maxRating={3} />)

      await user.click(container.querySelectorAll('[role="radio"]')[1])

      const icons = container.querySelectorAll('[role="radio"]')

      expect(icons[0]).toHaveAttribute('aria-setsize', String(3))
      expect(icons[1]).toHaveAttribute('aria-setsize', String(3))
      expect(icons[2]).toHaveAttribute('aria-setsize', String(3))
    })

    it('sets aria-posinset on each rating icon', async () => {
      const container = dom(<Rating maxRating={3} />)

      await user.click(container.querySelectorAll('[role="radio"]')[1])

      const icons = container.querySelectorAll('[role="radio"]')

      expect(icons[0]).toHaveAttribute('aria-posinset', String(1))
      expect(icons[1]).toHaveAttribute('aria-posinset', String(2))
      expect(icons[2]).toHaveAttribute('aria-posinset', String(3))
    })

    it('removes the "selected" prop', async () => {
      const container = dom(<Rating maxRating={3} />)

      const icons = container.querySelectorAll('[role="radio"]')
      await user.hover(icons[icons.length - 1])
      await user.click(icons[icons.length - 1])
      expect(container.firstElementChild).not.toHaveClass('selected')
      expect(
        container.querySelectorAll('[role="radio"].selected'),
        'Some RatingIcons did not remove their "selected" prop',
      ).toHaveLength(0)
    })
  })

  describe('hovering on icons', () => {
    it('adds the "selected" className to the Rating', async () => {
      const container = dom(<Rating maxRating={3} />)

      await user.hover(container.querySelectorAll('[role="radio"]')[0])
      expect(container.firstElementChild).toHaveClass('selected')
    })

    it('selects icons up to and including the hovered icon', async () => {
      const container = dom(<Rating maxRating={3} />)

      await user.hover(container.querySelectorAll('[role="radio"]')[1])

      const icons = container.querySelectorAll('[role="radio"]')

      expect(icons[0]).toHaveClass('selected')
      expect(icons[1]).toHaveClass('selected')
      expect(icons[2]).not.toHaveClass('selected')
    })

    it('unselects icons on mouse leave', async () => {
      const container = dom(<Rating maxRating={3} />)

      const icons = container.querySelectorAll('[role="radio"]')
      await user.hover(icons[icons.length - 1])
      await user.unhover(container.firstElementChild)

      expect(
        container.querySelectorAll('[role="radio"].selected'),
        'Some RatingIcons did not remove their "selected" prop',
      ).toHaveLength(0)
    })
  })

  describe('clearable', () => {
    it('prevents clearing by default with multiple icons', async () => {
      const container = dom(<Rating defaultRating={5} maxRating={5} />)

      const allIcons = container.querySelectorAll('[role="radio"]')
      await user.click(allIcons[allIcons.length - 1])
      expect(
        container.querySelectorAll('[role="radio"].active'),
        'Some RatingIcons did not retain their "active" prop',
      ).toHaveLength(5)
    })

    it('allows toggling when set to "auto" with a single icon', async () => {
      const container = dom(<Rating clearable='auto' maxRating={1} />)

      await user.click(container.querySelectorAll('[role="radio"]')[0])
      expect(container.querySelectorAll('[role="radio"]')[0]).toHaveClass('active')

      await user.click(container.querySelectorAll('[role="radio"]')[0])
      expect(container.querySelectorAll('[role="radio"]')[0]).not.toHaveClass('active')
    })

    it('allows clearing when true with a single icon', async () => {
      const container = dom(<Rating clearable defaultRating={1} maxRating={1} />)

      await user.click(container.querySelectorAll('[role="radio"]')[0])
      expect(container.querySelectorAll('[role="radio"]')[0]).not.toHaveClass('active')
    })

    it('allows clearing when true with multiple icons', async () => {
      const container = dom(<Rating clearable defaultRating={4} maxRating={5} />)

      await user.click(container.querySelectorAll('[role="radio"]')[3])
      expect(
        container.querySelectorAll('[role="radio"].active'),
        'Some RatingIcons did not remove their "active" prop',
      ).toHaveLength(0)
    })

    it('prevents clearing when false with a single icon', async () => {
      const icon = dom(<Rating clearable={false} defaultRating={1} maxRating={1} />).querySelector(
        '[role="radio"]',
      )
      await user.click(icon)

      expect(icon).toHaveClass('active')
    })

    it('prevents clearing when false with multiple icons', async () => {
      const container = dom(<Rating clearable={false} defaultRating={5} maxRating={5} />)

      const allIcons = container.querySelectorAll('[role="radio"]')
      await user.click(allIcons[allIcons.length - 1])
      expect(
        container.querySelectorAll('[role="radio"].active'),
        'Some RatingIcons did not retain their "active" prop',
      ).toHaveLength(5)
    })
  })

  describe('disabled', () => {
    it('prevents the rating from being toggled', async () => {
      const icon = dom(<Rating clearable='auto' disabled maxRating={1} rating={1} />).querySelector(
        '[role="radio"]',
      )
      await user.click(icon)

      expect(icon).toHaveClass('active')

      const unratedIcon = dom(
        <Rating clearable='auto' disabled maxRating={1} rating={0} />,
      ).querySelector('[role="radio"]')
      await user.click(unratedIcon)

      expect(unratedIcon).not.toHaveClass('active')
    })

    it('prevents the rating from being cleared', async () => {
      const container = dom(<Rating disabled maxRating={3} rating={3} />)

      const allIcons = container.querySelectorAll('[role="radio"]')
      await user.click(allIcons[allIcons.length - 1])
      expect(
        container.querySelectorAll('[role="radio"].active'),
        'Some RatingIcons lost their "active" prop',
      ).toHaveLength(3)
    })

    it('prevents icons from becoming selected on mouse enter', async () => {
      const container = dom(<Rating disabled maxRating={3} />)

      const icons = container.querySelectorAll('[role="radio"]')
      await user.hover(icons[icons.length - 1])
      expect(
        container.querySelectorAll('[role="radio"].selected'),
        'Some RatingIcons became "selected"',
      ).toHaveLength(0)
    })

    it('prevents icons from becoming unselected on mouse leave', async () => {
      const { container, rerender } = render(<Rating maxRating={3} />)

      const icons = container.querySelectorAll('[role="radio"]')
      await user.hover(icons[icons.length - 1])
      expect(
        container.querySelectorAll('[role="radio"].selected'),
        'Not every RatingIcon was selected on mouseEnter',
      ).toHaveLength(3)

      rerender(<Rating disabled maxRating={3} />)
      await user.unhover(container.firstElementChild)
      expect(
        container.querySelectorAll('[role="radio"].selected'),
        'Some RatingIcons lost their "selected" prop',
      ).toHaveLength(3)
    })

    it('prevents icons from becoming active on click', async () => {
      const container = dom(<Rating disabled maxRating={3} />)

      const allIcons = container.querySelectorAll('[role="radio"]')
      await user.click(allIcons[allIcons.length - 1])
      expect(
        container.querySelectorAll('[role="radio"].active'),
        'Some RatingIcons became "active"',
      ).toHaveLength(0)
    })
  })

  describe('maxRating', () => {
    it('controls how many icons are displayed', async () => {
      _.times(10, (i) => {
        const maxRating = i + 1
        expect(
          dom(<Rating maxRating={maxRating} />).querySelectorAll('[role="radio"]'),
        ).toHaveLength(maxRating)
      })
    })
  })

  describe('onRate', () => {
    it('is called with (event, { rating, maxRating } on icon click', async () => {
      const spy = vi.fn()

      const rateIcons = dom(<Rating maxRating={3} onRate={spy} />).querySelectorAll(
        '[role="radio"]',
      )
      await user.click(rateIcons[rateIcons.length - 1])

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls[0][0]).toMatchObject({ type: 'click' })
      expect(spy.mock.calls[0][1]).toMatchObject({ rating: 3, maxRating: 3 })
    })
  })

  describe('rating', () => {
    it('controls how many icons are active', async () => {
      const { container, rerender } = render(<Rating maxRating={10} />)

      _.times(10, (rating) => {
        rerender(<Rating maxRating={10} rating={rating} />)

        expect(
          container.querySelectorAll('[role="radio"].active'),
          `Rating should have ${rating} active icons`,
        ).toHaveLength(rating)
      })
    })
  })

  describe('tabIndex', () => {
    it('sets icons tabIndex to -1 to prevent focus when element is disabled', async () => {
      for (const icon of dom(<Rating maxRating={3} />).querySelectorAll('[role="radio"]')) {
        expect(icon).toHaveAttribute('tabindex', '0')
      }

      for (const icon of dom(<Rating disabled maxRating={3} />).querySelectorAll(
        '[role="radio"]',
      )) {
        expect(icon).toHaveAttribute('tabindex', '-1')
      }
    })

    it('sets Rating element tabIndex to 0 to allow focusing the whole group when disabled', async () => {
      expect(root(<Rating maxRating={3} />)).toHaveAttribute('tabindex', '-1')

      expect(root(<Rating disabled maxRating={3} />)).toHaveAttribute('tabindex', '0')
    })
  })
})
