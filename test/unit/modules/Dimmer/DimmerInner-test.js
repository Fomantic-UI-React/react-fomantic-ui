import { dom, root } from 'test/support/rtl'
import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import DimmerInner from 'src/modules/Dimmer/DimmerInner'
import * as common from 'test/support/commonTests'

describe('DimmerInner', () => {
  common.isConformant(DimmerInner)
  common.forwardsRef(DimmerInner)
  common.hasUIClassName(DimmerInner)
  common.rendersChildren(DimmerInner)

  common.implementsVerticalAlignProp(DimmerInner, ['bottom', 'top'])

  common.propKeyOnlyToClassName(DimmerInner, 'active', {
    className: 'active transition visible',
  })
  common.propKeyOnlyToClassName(DimmerInner, 'disabled')
  common.propKeyOnlyToClassName(DimmerInner, 'inverted')
  common.propKeyOnlyToClassName(DimmerInner, 'simple')

  describe('active', () => {
    it('adds "display: flex" after set to "true"', () => {
      const { container, rerender } = render(<DimmerInner />)
      expect(container.firstElementChild).not.toHaveStyle({ display: 'flex' })

      rerender(<DimmerInner active />)
      expect(container.firstElementChild).toHaveStyle({ display: 'flex' })
    })
  })

  describe('onClickOutside', () => {
    it('called when Dimmer has no children', () => {
      const onClickOutside = vi.fn()

      fireEvent.click(root(<DimmerInner onClickOutside={onClickOutside} />))

      expect(onClickOutside).toHaveBeenCalledTimes(1)
    })

    it('omitted when click on children', () => {
      const onClickOutside = vi.fn()
      const container = dom(
        <DimmerInner onClickOutside={onClickOutside}>
          <div id='child'>the content</div>
        </DimmerInner>,
      )

      fireEvent.click(container.querySelector('#child'))

      expect(onClickOutside).not.toHaveBeenCalled()
    })

    it('called when click on Dimmer', () => {
      const onClickOutside = vi.fn()

      fireEvent.click(root(<DimmerInner onClickOutside={onClickOutside}>the content</DimmerInner>))

      expect(onClickOutside).toHaveBeenCalledTimes(1)
    })

    it('called when click on center', () => {
      const onClickOutside = vi.fn()
      const container = dom(<DimmerInner onClickOutside={onClickOutside}>the content</DimmerInner>)

      fireEvent.click(container.querySelector('div.content'))

      expect(onClickOutside).toHaveBeenCalledTimes(1)
    })
  })
})
