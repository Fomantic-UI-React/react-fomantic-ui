import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import Confirm from 'src/addons/Confirm/Confirm'
import Modal from 'src/modules/Modal/Modal'
import * as common from 'test/support/commonTests'

describe('Confirm', () => {
  // Interactions go through user-event, which sends the pointer, focus and
  // keyboard sequence a browser does rather than the single event `fireEvent`
  // dispatches.
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

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
    it('renders a Modal', async () => {
      expect(openConfirm()).not.toBeNull()
    })
  })

  describe('size', () => {
    it('has "small" size by default', async () => {
      expect(openConfirm()).toHaveClass('small')
    })

    for (const size of ['mini', 'tiny', 'small', 'large', 'fullscreen']) {
      it(`applies ${size} size`, () => {
        expect(openConfirm({ size })).toHaveClass(size)
      })
    }
  })

  describe('cancelButton', () => {
    it('is "Cancel" by default', async () => {
      expect(buttons()[0]).toHaveTextContent('Cancel')
    })

    it('sets the cancel button text', async () => {
      expect(buttons({ cancelButton: 'foo' })[0]).toHaveTextContent('foo')
    })
  })

  describe('confirmButton', () => {
    it('is "OK" by default', async () => {
      expect(openConfirm().querySelector('button.primary')).toHaveTextContent('OK')
    })

    it('sets the confirm button text', async () => {
      expect(
        openConfirm({ confirmButton: 'foo' }).querySelector('button.primary'),
      ).toHaveTextContent('foo')
    })
  })

  describe('onCancel', () => {
    it('omitted when not defined', async () => {
      // No handler to invoke — clicking must simply not throw.
      await user.click(buttons()[0])
    })

    it('is called on Cancel button click', async () => {
      const spy = vi.fn()

      await user.click(buttons({ onCancel: spy })[0])

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('is called on dimmer click', async () => {
      const spy = vi.fn()
      openConfirm({ onCancel: spy })

      await user.click(document.body.querySelector('.ui.dimmer'))

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('is not called on click inside of the modal', async () => {
      const spy = vi.fn()
      const modal = openConfirm({ onCancel: spy })

      await user.click(modal)

      expect(spy).not.toHaveBeenCalled()
    })

    it('is called when pressing escape', async () => {
      const spy = vi.fn()
      openConfirm({ onCancel: spy })

      await user.keyboard('{Escape}')

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('is not called when pressing a key other than "Escape"', async () => {
      const spy = vi.fn()
      openConfirm({ onCancel: spy })

      // Nothing but Escape should cancel: an enter, a letter, an arrow, a space.
      await user.keyboard('{Enter}a{ArrowDown}[Space]')

      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('onConfirm', () => {
    it('omitted when not defined', async () => {
      // No handler to invoke — clicking must simply not throw.
      await user.click(openConfirm().querySelector('button.primary'))
    })

    it('is called on OK button click', async () => {
      const spy = vi.fn()

      await user.click(openConfirm({ onConfirm: spy }).querySelector('button.primary'))

      expect(spy).toHaveBeenCalledTimes(1)
    })
  })
})
