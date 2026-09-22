import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import useEventListener, { documentRef } from 'src/lib/hooks/useEventListener'

function TestComponent(props) {
  useEventListener(props.options)
  return null
}

describe('useEventListener', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  describe('target', () => {
    it('subscribes on the given element', async () => {
      const node = document.createElement('div')
      document.body.appendChild(node)

      const listener = vi.fn()
      render(<TestComponent options={{ listener, target: node, type: 'click' }} />)

      await user.click(node)

      expect(listener).toHaveBeenCalledTimes(1)
      document.body.removeChild(node)
    })

    it('subscribes on a ref via targetRef', async () => {
      const node = document.createElement('div')
      document.body.appendChild(node)

      const listener = vi.fn()
      render(<TestComponent options={{ listener, targetRef: { current: node }, type: 'click' }} />)

      await user.click(node)

      expect(listener).toHaveBeenCalledTimes(1)
      document.body.removeChild(node)
    })

    it('documentRef points at the document', async () => {
      expect(documentRef.current).toBe(document)

      const listener = vi.fn()
      render(<TestComponent options={{ listener, targetRef: documentRef, type: 'click' }} />)

      await user.click(document.body)

      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('throws when neither target nor targetRef is given', () => {
      const listener = vi.fn()

      expect(() => render(<TestComponent options={{ listener, type: 'click' }} />)).toThrow(
        /one of `target` or `targetRef` is required/,
      )
    })

    it('throws when both target and targetRef are given', () => {
      const listener = vi.fn()

      expect(() =>
        render(
          <TestComponent
            options={{ listener, target: document, targetRef: documentRef, type: 'click' }}
          />,
        ),
      ).toThrow(/mutually exclusive/)
    })
  })

  describe('enabled', () => {
    it('does not subscribe while false', async () => {
      const listener = vi.fn()
      render(
        <TestComponent options={{ enabled: false, listener, target: document, type: 'click' }} />,
      )

      await user.click(document.body)

      expect(listener).not.toHaveBeenCalled()
    })

    it('subscribes and unsubscribes as it changes', async () => {
      const listener = vi.fn()
      const options = { listener, target: document, type: 'click' }
      const { rerender } = render(<TestComponent options={{ ...options, enabled: false }} />)

      rerender(<TestComponent options={{ ...options, enabled: true }} />)
      await user.click(document.body)
      expect(listener).toHaveBeenCalledTimes(1)

      rerender(<TestComponent options={{ ...options, enabled: false }} />)
      await user.click(document.body)
      expect(listener).toHaveBeenCalledTimes(1)
    })
  })

  describe('listener', () => {
    it('calls the latest listener without resubscribing', async () => {
      const first = vi.fn()
      const second = vi.fn()
      const { rerender } = render(
        <TestComponent options={{ listener: first, target: document, type: 'click' }} />,
      )

      rerender(<TestComponent options={{ listener: second, target: document, type: 'click' }} />)
      await user.click(document.body)

      expect(first).not.toHaveBeenCalled()
      expect(second).toHaveBeenCalledTimes(1)
    })

    it('unsubscribes on unmount', async () => {
      const listener = vi.fn()
      const { unmount } = render(
        <TestComponent options={{ listener, target: document, type: 'click' }} />,
      )

      unmount()
      await user.click(document.body)

      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('capture', () => {
    it('listens during the capture phase when set', async () => {
      const node = document.createElement('div')
      document.body.appendChild(node)

      const order = []
      node.addEventListener('click', () => order.push('target'))

      render(
        <TestComponent
          options={{
            capture: true,
            listener: () => order.push('capture'),
            target: document,
            type: 'click',
          }}
        />,
      )

      await user.click(node)

      expect(order).toEqual(['capture', 'target'])
      document.body.removeChild(node)
    })

    it('listens during the bubble phase by default', async () => {
      const node = document.createElement('div')
      document.body.appendChild(node)

      const order = []
      node.addEventListener('click', () => order.push('target'))

      render(
        <TestComponent
          options={{ listener: () => order.push('bubble'), target: document, type: 'click' }}
        />,
      )

      await user.click(node)

      expect(order).toEqual(['target', 'bubble'])
      document.body.removeChild(node)
    })
  })
})
