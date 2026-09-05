import { root } from 'test/support/rtl'

import userEvent from '@testing-library/user-event'
import React from 'react'

import RatingIcon from 'src/modules/Rating/RatingIcon'
import * as common from 'test/support/commonTests'

describe('RatingIcon', () => {
  // Interactions go through user-event, which sends the pointer, focus and
  // keyboard sequence a browser does rather than the single event `fireEvent`
  // dispatches.
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  common.isConformant(RatingIcon)
  common.forwardsRef(RatingIcon, { tagName: 'i' })

  common.propKeyOnlyToClassName(RatingIcon, 'active')
  common.propKeyOnlyToClassName(RatingIcon, 'selected')

  describe('onClick', () => {
    // The key is pressed on a focused icon, the way a keyboard user does.
    // Focus is taken by clicking rather than tabbing, because releasing Tab
    // fires a keyup on the element that just received focus. The event is kept
    // and read afterwards: a listener on the element runs before React's
    // handler on the container, so `defaultPrevented` there is always false.
    const pressKey = async (element, keys) => {
      let event = null

      element.addEventListener('keyup', (e) => {
        event = e
      })
      await user.click(element)
      await user.keyboard(keys)

      return event
    }

    for (const [name, keys] of [
      ['space', '[Space]'],
      ['enter', '{Enter}'],
    ]) {
      it(`calls onClick with (e, data) when ${name} key is pressed`, async () => {
        const onClick = vi.fn()
        const element = root(<RatingIcon index={0} onClick={onClick} tabIndex={0} />)
        const event = await pressKey(element, keys)

        // The click that takes focus calls onClick too, so the key press is the
        // second call rather than the only one.
        expect(onClick).toHaveBeenCalledTimes(2)
        expect(onClick.mock.calls.at(-1)[1]).toMatchObject({ index: 0 })
        expect(event.defaultPrevented).toBe(true)
      })
    }

    it('does not call onClick when non space/enter key is pressed', async () => {
      const onClick = vi.fn()
      const element = root(<RatingIcon index={0} onClick={onClick} tabIndex={0} />)
      const event = await pressKey(element, 'a')

      // Only the click that took focus.
      expect(onClick).toHaveBeenCalledTimes(1)
      expect(event.defaultPrevented).toBe(false)
    })
  })

  describe('onKeyUp', () => {
    it('calls onKeyUp with (e, data) when key is pressed', async () => {
      const onKeyUp = vi.fn()

      // A bare RatingIcon has no tabIndex of its own — Rating gives its icons
      // one — so the fixture gets the same. Focus is taken by clicking rather
      // than tabbing: releasing Tab fires a keyup on the element that just
      // received focus, which this handler would count.
      const element = root(<RatingIcon index={0} onKeyUp={onKeyUp} tabIndex={0} />)

      await user.click(element)
      await user.keyboard('a')

      expect(onKeyUp).toHaveBeenCalledTimes(1)
      expect(onKeyUp.mock.calls[0][1]).toMatchObject({ index: 0 })
    })
  })
})
