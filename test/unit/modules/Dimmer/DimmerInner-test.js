import { dom, root } from 'test/support/rtl'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import DimmerInner from 'src/modules/Dimmer/DimmerInner'
import * as common from 'test/support/commonTests'

describe('DimmerInner', () => {
  // Interactions go through user-event, which sends the pointer, focus and
  // keyboard sequence a browser does rather than the single event `fireEvent`
  // dispatches.
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

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
    it('adds "display: flex" after set to "true"', async () => {
      const { container, rerender } = render(<DimmerInner />)
      expect(container.firstElementChild).not.toHaveStyle({ display: 'flex' })

      rerender(<DimmerInner active />)
      expect(container.firstElementChild).toHaveStyle({ display: 'flex' })
    })
  })

  describe('onClickOutside', () => {
    it('called when Dimmer has no children', async () => {
      const onClickOutside = vi.fn()

      await user.click(root(<DimmerInner onClickOutside={onClickOutside} />))

      expect(onClickOutside).toHaveBeenCalledTimes(1)
    })

    it('omitted when click on children', async () => {
      const onClickOutside = vi.fn()
      const container = dom(
        <DimmerInner onClickOutside={onClickOutside}>
          <div id='child'>the content</div>
        </DimmerInner>,
      )

      await user.click(container.querySelector('#child'))

      expect(onClickOutside).not.toHaveBeenCalled()
    })

    it('called when click on Dimmer', async () => {
      const onClickOutside = vi.fn()

      await user.click(root(<DimmerInner onClickOutside={onClickOutside}>the content</DimmerInner>))

      expect(onClickOutside).toHaveBeenCalledTimes(1)
    })

    it('called when click on center', async () => {
      const onClickOutside = vi.fn()
      const container = dom(<DimmerInner onClickOutside={onClickOutside}>the content</DimmerInner>)

      await user.click(container.querySelector('div.content'))

      expect(onClickOutside).toHaveBeenCalledTimes(1)
    })
  })
})
