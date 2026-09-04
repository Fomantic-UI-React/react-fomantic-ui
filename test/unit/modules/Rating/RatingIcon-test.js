import { root } from 'test/support/rtl'
import { fireEvent } from '@testing-library/react'
import React from 'react'

import RatingIcon from 'src/modules/Rating/RatingIcon'
import * as common from 'test/support/commonTests'

describe('RatingIcon', () => {
  common.isConformant(RatingIcon)
  common.forwardsRef(RatingIcon, { tagName: 'i' })

  common.propKeyOnlyToClassName(RatingIcon, 'active')
  common.propKeyOnlyToClassName(RatingIcon, 'selected')

  describe('onClick', () => {
    // fireEvent dispatches a real cancelable event, so "prevented default" is
    // read off the event rather than from a spy on preventDefault.
    const keyUp = (element, init) => {
      const event = new KeyboardEvent('keyup', { bubbles: true, cancelable: true, ...init })
      fireEvent(element, event)

      return event
    }

    for (const [name, key] of [
      ['space', ' '],
      ['enter', 'Enter'],
    ]) {
      it(`calls onClick with (e, data) when ${name} key is pressed`, () => {
        const onClick = vi.fn()
        const event = keyUp(root(<RatingIcon index={0} onClick={onClick} />), { key })

        expect(onClick).toHaveBeenCalledTimes(1)
        expect(onClick.mock.calls[0][1]).toMatchObject({ index: 0 })
        expect(event.defaultPrevented).toBe(true)
      })
    }

    it('does not call onClick when non space/enter key is pressed', () => {
      const onClick = vi.fn()
      const event = keyUp(root(<RatingIcon index={0} onClick={onClick} />), { key: 'a' })

      expect(onClick).not.toHaveBeenCalled()
      expect(event.defaultPrevented).toBe(false)
    })
  })

  describe('onKeyUp', () => {
    it('calls onKeyUp with (e, data) when key is pressed', () => {
      const onKeyUp = vi.fn()

      fireEvent.keyUp(root(<RatingIcon index={0} onKeyUp={onKeyUp} />), { key: 'a' })

      expect(onKeyUp).toHaveBeenCalledTimes(1)
      expect(onKeyUp.mock.calls[0][1]).toMatchObject({ index: 0 })
    })
  })
})
