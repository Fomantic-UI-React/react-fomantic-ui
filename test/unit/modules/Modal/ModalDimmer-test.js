import { root } from 'test/support/rtl'
import { render } from '@testing-library/react'
import React from 'react'

import ModalDimmer from 'src/modules/Modal/ModalDimmer'
import * as common from 'test/support/commonTests'

describe('ModalDimmer', () => {
  common.isConformant(ModalDimmer)
  common.forwardsRef(ModalDimmer)
  common.hasUIClassName(ModalDimmer)
  common.rendersChildren(ModalDimmer)

  common.propKeyOnlyToClassName(ModalDimmer, 'inverted')

  it('has required classes', () => {
    const dimmer = root(<ModalDimmer mountNode={null} />)

    for (const className of ['page', 'modals', 'dimmer', 'transition', 'visible', 'active']) {
      expect(dimmer).toHaveClass(className)
    }
  })

  // The mountNode classes are applied as a side effect on the node itself.
  const renderWithMountNode = (props) => {
    const element = document.createElement('div')
    render(<ModalDimmer mountNode={element} {...props} />)

    return element
  }

  describe('children', () => {
    it('adds classes to "mountNode"', () => {
      const element = renderWithMountNode()

      expect(element).toHaveClass('dimmable')
      expect(element).toHaveClass('dimmed')
    })
  })

  describe('blurring', () => {
    it('adds nothing to "mountNode" by default', () => {
      expect(renderWithMountNode()).not.toHaveClass('blurring')
    })

    it('adds a class to "mountNode" when is "true"', () => {
      expect(renderWithMountNode({ blurring: true })).toHaveClass('blurring')
    })
  })

  describe('centered', () => {
    it('adds "top aligned" to "className" by default', () => {
      expect(root(<ModalDimmer />)).toHaveClass('top', 'aligned')
    })

    it('adds nothing to "className" when is "true"', () => {
      expect(root(<ModalDimmer centered />)).not.toHaveClass('aligned')
    })
  })

  describe('scrolling', () => {
    it('adds nothing to "mountNode" by default', () => {
      expect(renderWithMountNode()).not.toHaveClass('scrolling')
    })

    it('adds "className" to "mountNode"', () => {
      expect(renderWithMountNode({ scrolling: true })).toHaveClass('scrolling')
    })
  })

  describe('style', () => {
    it('adds "display: flex" with "important"', () => {
      const { style } = root(<ModalDimmer />)

      expect(style.getPropertyValue('display')).toBe('flex')
      expect(style.getPropertyPriority('display')).toBe('important')
    })
  })
})
