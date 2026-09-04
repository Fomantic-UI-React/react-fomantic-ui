import { dom, root } from 'test/support/rtl'
import { fireEvent } from '@testing-library/react'
import React from 'react'

import TextArea from 'src/addons/TextArea/TextArea'
import * as common from 'test/support/commonTests'

describe('TextArea', () => {
  common.isConformant(TextArea)
  common.forwardsRef(TextArea, { tagName: 'textarea' })

  describe('focus', () => {
    it('can be set via a ref', () => {
      const ref = React.createRef()
      const container = dom(<TextArea ref={ref} />)

      ref.current.focus()

      expect(document.activeElement).toBe(container.querySelector('textarea'))
    })
  })

  for (const [handler, fire] of [
    ['onChange', fireEvent.change],
    ['onInput', fireEvent.input],
  ]) {
    describe(handler, () => {
      it(`is called with (e, data) on ${handler.slice(2).toLowerCase()}`, () => {
        const spy = vi.fn()
        const props = { 'data-foo': 'bar', [handler]: spy }

        fire(dom(<TextArea {...props} />).querySelector('textarea'), {
          target: { value: 'name' },
        })

        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy.mock.calls[0][1]).toMatchObject({ ...props, value: 'name' })
      })
    })
  }

  describe('rows', () => {
    it('has default value', () => {
      expect(root(<TextArea />)).toHaveAttribute('rows', '3')
    })

    it('sets prop', () => {
      expect(root(<TextArea rows={1} />)).toHaveAttribute('rows', '1')
    })
  })
})
