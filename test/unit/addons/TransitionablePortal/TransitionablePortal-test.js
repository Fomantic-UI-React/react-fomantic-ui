import { fireEvent, render, waitFor } from '@testing-library/react'
import React from 'react'

import TransitionablePortal from 'src/addons/TransitionablePortal/TransitionablePortal'
import * as common from 'test/support/commonTests'

const quickTransition = { duration: 0 }
const requiredProps = {
  children: <div id='children' />,
}

// The portal renders into document.body, so its contents are queried there
// rather than through the container RTL hands back.
const children = () => document.getElementById('children')

describe('TransitionablePortal', () => {
  common.isConformant(TransitionablePortal, {
    rendersPortal: true,
    requiredProps,
    forwardsRef: false,
    // Unhandled props go to Portal, which renders no element of its own, so
    // they never reach the DOM. The Enzyme suite passed this because it
    // asserted against the element tree. See issue #16 — remove this with the
    // fix, it is the regression test.
    spreadsUserProps: false,
  })

  describe('children', () => {
    it('renders a Transition', () => {
      render(<TransitionablePortal {...requiredProps} open />)

      expect(document.body.querySelector('.transition')).not.toBeNull()
    })
  })

  describe('onClose', () => {
    it('is called with (null, data) on a click outside', async () => {
      const onClose = vi.fn()
      const { container } = render(
        <TransitionablePortal
          {...requiredProps}
          onClose={onClose}
          transition={quickTransition}
          trigger={<button />}
        />,
      )

      fireEvent.click(container.querySelector('button'))
      fireEvent.click(document.body)

      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1)
      })
      expect(onClose.mock.calls[0][0]).toBeNull()
      expect(onClose.mock.calls[0][1]).toMatchObject({ portalOpen: false })
    })

    it('hides contents on a click outside', () => {
      const { container } = render(<TransitionablePortal {...requiredProps} trigger={<button />} />)

      fireEvent.click(container.querySelector('button'))
      expect(children()).toHaveClass('in')

      fireEvent.click(document.body)
      expect(children()).toHaveClass('out')
    })
  })

  describe('onHide', () => {
    it('is called with (null, data) when exiting transition finished', async () => {
      const onHide = vi.fn()
      const { rerender } = render(
        <TransitionablePortal
          {...requiredProps}
          onHide={onHide}
          open
          transition={quickTransition}
          trigger={<button />}
        />,
      )

      rerender(
        <TransitionablePortal
          {...requiredProps}
          onHide={onHide}
          open={false}
          transition={quickTransition}
          trigger={<button />}
        />,
      )

      await waitFor(() => {
        expect(onHide).toHaveBeenCalledTimes(1)
      })
      expect(onHide.mock.calls[0][0]).toBeNull()
      expect(onHide.mock.calls[0][1]).toMatchObject({
        ...quickTransition,
        portalOpen: false,
        transitionVisible: false,
      })
    })
  })

  describe('onOpen', () => {
    it('is called with (null, data) when opens', () => {
      const onOpen = vi.fn()
      const { container } = render(
        <TransitionablePortal {...requiredProps} onOpen={onOpen} trigger={<button />} />,
      )

      fireEvent.click(container.querySelector('button'))

      expect(onOpen).toHaveBeenCalledTimes(1)
      expect(onOpen.mock.calls[0][0]).toBeNull()
      expect(onOpen.mock.calls[0][1]).toMatchObject({ portalOpen: true })
    })

    it('renders contents', () => {
      const { container } = render(<TransitionablePortal {...requiredProps} trigger={<button />} />)

      fireEvent.click(container.querySelector('button'))

      expect(children()).toHaveClass('in')
    })
  })

  describe('open', () => {
    it('blocks update of state on a portal close', () => {
      render(<TransitionablePortal {...requiredProps} open />)
      expect(children()).toHaveClass('in')

      fireEvent.click(document.body)

      expect(children()).toHaveClass('in')
    })

    it('passes `open` prop to Transition when defined', () => {
      const { rerender } = render(<TransitionablePortal {...requiredProps} />)

      rerender(<TransitionablePortal {...requiredProps} open />)
      expect(children()).toHaveClass('in')

      rerender(<TransitionablePortal {...requiredProps} open={false} />)
      expect(children()).toHaveClass('out')
    })

    it('does not pass `open` prop to Transition when not defined', () => {
      const { rerender } = render(<TransitionablePortal {...requiredProps} />)
      expect(children()).toBeNull()

      rerender(<TransitionablePortal {...requiredProps} transition={{}} />)
      expect(children()).toBeNull()
    })
  })
})
