import { root } from 'test/support/rtl'
import { render } from '@testing-library/react'
import React from 'react'

import Dimmer from 'src/modules/Dimmer/Dimmer'
import DimmerDimmable from 'src/modules/Dimmer/DimmerDimmable'
import DimmerInner from 'src/modules/Dimmer/DimmerInner'
import * as common from 'test/support/commonTests'

describe('Dimmer', () => {
  common.isConformant(Dimmer)
  common.forwardsRef(Dimmer)
  common.hasSubcomponents(Dimmer, [DimmerDimmable, DimmerInner])

  common.implementsCreateMethod(Dimmer)

  describe('children', () => {
    it('renders a DimmerInner', () => {
      expect(root(<Dimmer />)).toHaveClass('dimmer')
    })
  })

  describe('page', () => {
    // A page Dimmer renders through a Portal, so its element is in the
    // document rather than in the container.
    const pageDimmer = () => document.body.querySelector('.ui.dimmer')

    it('renders a Portal', () => {
      const { container } = render(<Dimmer page active />)

      expect(container).toBeEmptyDOMElement()
      expect(pageDimmer()).not.toBeNull()
    })

    describe('active', () => {
      beforeEach(() => {
        document.body.classList.remove('dimmable', 'dimmed')
      })

      it('when true, Portal is opened dimmer classes are present on body', () => {
        render(<Dimmer page active />)

        expect(pageDimmer()).not.toBeNull()
        expect(document.body).toHaveClass('dimmable')
        expect(document.body).toHaveClass('dimmed')
      })

      it('when false, Portal is closed dimmer classes are absent on body', () => {
        render(<Dimmer page active={false} />)

        expect(pageDimmer()).toBeNull()
        expect(document.body).not.toHaveClass('dimmable')
        expect(document.body).not.toHaveClass('dimmed')
      })

      it('when changed to false, dimmer classes are removed from body', () => {
        const { rerender } = render(<Dimmer page active />)

        rerender(<Dimmer page active={false} />)

        expect(document.body).not.toHaveClass('dimmable')
        expect(document.body).not.toHaveClass('dimmed')
      })
    })
  })
})
