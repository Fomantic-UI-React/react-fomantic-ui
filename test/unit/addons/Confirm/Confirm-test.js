import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import Confirm from 'src/addons/Confirm/Confirm'
import Modal from 'src/modules/Modal/Modal'
import * as common from 'test/support/commonTests'

describe('Confirm', () => {
  common.isConformant(Confirm, { rendersPortal: true })

  common.implementsShorthandProp(Confirm, {
    autoGenerateKey: false,
    propKey: 'header',
    ShorthandComponent: Modal.Header,
    rendersPortal: true,
    mapValueToProps: (content) => ({ content }),
    requiredProps: { open: true },
  })
  common.implementsShorthandProp(Confirm, {
    defaultValue: 'OK',
    autoGenerateKey: false,
    propKey: 'content',
    ShorthandComponent: Modal.Content,
    rendersPortal: true,
    mapValueToProps: (content) => ({ content }),
    requiredProps: { open: true },
  })

  // Confirm renders a Modal, so nothing reaches the DOM until it is open and
  // what it renders lands in document.body rather than the container.
  const openConfirm = (props) => {
    render(<Confirm open {...props} />)

    return document.body.querySelector('.ui.modal')
  }

  const buttons = (props) => [...openConfirm(props).querySelectorAll('button')]

  describe('children', () => {
    it('renders a Modal', () => {
      expect(openConfirm()).not.toBeNull()
    })
  })

  describe('size', () => {
    it('has "small" size by default', () => {
      expect(openConfirm()).toHaveClass('small')
    })

    for (const size of ['mini', 'tiny', 'small', 'large', 'fullscreen']) {
      it(`applies ${size} size`, () => {
        expect(openConfirm({ size })).toHaveClass(size)
      })
    }
  })

  describe('cancelButton', () => {
    it('is "Cancel" by default', () => {
      expect(buttons()[0]).toHaveTextContent('Cancel')
    })

    it('sets the cancel button text', () => {
      expect(buttons({ cancelButton: 'foo' })[0]).toHaveTextContent('foo')
    })
  })

  describe('confirmButton', () => {
    it('is "OK" by default', () => {
      expect(openConfirm().querySelector('button.primary')).toHaveTextContent('OK')
    })

    it('sets the confirm button text', () => {
      expect(
        openConfirm({ confirmButton: 'foo' }).querySelector('button.primary'),
      ).toHaveTextContent('foo')
    })
  })

  describe('onCancel', () => {
    it('omitted when not defined', () => {
      expect(() => fireEvent.click(buttons()[0])).not.toThrow()
    })

    it('is called on Cancel button click', () => {
      const spy = vi.fn()

      fireEvent.click(buttons({ onCancel: spy })[0])

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('is called on dimmer click', () => {
      const spy = vi.fn()
      openConfirm({ onCancel: spy })

      fireEvent.click(document.body.querySelector('.ui.dimmer'))

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('is not called on click inside of the modal', () => {
      const spy = vi.fn()
      const modal = openConfirm({ onCancel: spy })

      fireEvent.click(modal)

      expect(spy).not.toHaveBeenCalled()
    })

    it('is called when pressing escape', () => {
      const spy = vi.fn()
      openConfirm({ onCancel: spy })

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('is not called when pressing a key other than "Escape"', () => {
      const spy = vi.fn()
      openConfirm({ onCancel: spy })

      for (const key of ['Enter', 'a', 'ArrowDown', ' ']) {
        fireEvent.keyDown(document, { key })
      }

      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('onConfirm', () => {
    it('omitted when not defined', () => {
      expect(() => fireEvent.click(openConfirm().querySelector('button.primary'))).not.toThrow()
    })

    it('is called on OK button click', () => {
      const spy = vi.fn()

      fireEvent.click(openConfirm({ onConfirm: spy }).querySelector('button.primary'))

      expect(spy).toHaveBeenCalledTimes(1)
    })
  })
})
