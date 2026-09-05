import { dom, root } from 'test/support/rtl'
import userEvent from '@testing-library/user-event'
import React from 'react'

import TextArea from 'src/addons/TextArea/TextArea'
import * as common from 'test/support/commonTests'

describe('TextArea', () => {
  // Interactions go through user-event, which sends the pointer, focus and
  // keyboard sequence a browser does rather than the single event `fireEvent`
  // dispatches. Set up per test below, because the only tests that need it are
  // generated in a loop.

  common.isConformant(TextArea)
  common.forwardsRef(TextArea, { tagName: 'textarea' })

  describe('focus', () => {
    it('can be set via a ref', async () => {
      const ref = React.createRef()
      const container = dom(<TextArea ref={ref} />)

      ref.current.focus()

      expect(document.activeElement).toBe(container.querySelector('textarea'))
    })
  })

  for (const handler of ['onChange', 'onInput']) {
    describe(handler, () => {
      it(`is called with (e, data) on ${handler.slice(2).toLowerCase()}`, async () => {
        // Set up inside the test rather than closing over the shared `user`,
        // which this loop would capture by reference.
        const typist = userEvent.setup()
        const spy = vi.fn()
        const props = { 'data-foo': 'bar', [handler]: spy }
        const textarea = dom(<TextArea {...props} />).querySelector('textarea')

        await typist.type(textarea, 'name')

        // Typing fires per keystroke, which is what a user does; the frozen
        // spec set the whole value in one synthetic event.
        expect(spy).toHaveBeenCalledTimes('name'.length)
        expect(spy.mock.calls.at(-1)[1]).toMatchObject({ ...props, value: 'name' })
      })
    })
  }

  describe('rows', () => {
    it('has default value', async () => {
      expect(root(<TextArea />)).toHaveAttribute('rows', '3')
    })

    it('sets prop', async () => {
      expect(root(<TextArea rows={1} />)).toHaveAttribute('rows', '1')
    })
  })
})
