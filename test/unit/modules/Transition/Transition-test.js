import { act, render, waitFor } from '@testing-library/react'
import React from 'react'

import { SUI } from 'src/lib'
import Transition from 'src/modules/Transition/Transition'
import TransitionGroup from 'src/modules/Transition/TransitionGroup'
import {
  TRANSITION_STATUS_ENTERED,
  TRANSITION_STATUS_ENTERING,
  TRANSITION_STATUS_EXITED,
  TRANSITION_STATUS_EXITING,
} from 'src/modules/Transition/utils/computeStatuses'
import * as common from 'test/support/commonTests'

// Transition renders nothing of its own — it clones its child — so the child is
// both Enzyme's `wrapper` and its `wrapper.find('p')`. `setProps` merges onto
// the original props, the way the Enzyme wrapper's did.
const renderTransition = (props, child = <p />) => {
  const { container, rerender } = render(<Transition {...props}>{child}</Transition>)

  return {
    container,
    child: () => container.querySelector('p'),
    setProps: (next) =>
      rerender(
        <Transition {...props} {...next}>
          {child}
        </Transition>,
      ),
  }
}

const expectStatus = (element, status) =>
  expect(element).toHaveAttribute('data-test-status', status)

describe('Transition', () => {
  common.hasSubcomponents(Transition, [TransitionGroup])
  common.hasValidTypings(Transition, { forwardsRef: false })

  describe('animation', () => {
    SUI.DIRECTIONAL_TRANSITIONS.forEach((animation) => {
      it(`directional ${animation}`, () => {
        const { child, setProps } = renderTransition({ animation, transitionOnMount: true })

        expectStatus(child(), TRANSITION_STATUS_ENTERING)
        expect(child()).toHaveClass(...animation.split(' '), 'in')

        setProps({ visible: false })
        expectStatus(child(), TRANSITION_STATUS_EXITING)
        expect(child()).toHaveClass(...animation.split(' '), 'out')
      })
    })

    SUI.STATIC_TRANSITIONS.forEach((animation) => {
      it(`static ${animation}`, () => {
        const { child, setProps } = renderTransition({ animation, transitionOnMount: true })

        expectStatus(child(), TRANSITION_STATUS_ENTERING)
        expect(child()).toHaveClass(animation)
        expect(child()).not.toHaveClass('in')

        setProps({ visible: false })
        expectStatus(child(), TRANSITION_STATUS_EXITING)
        expect(child()).toHaveClass(animation)
        expect(child()).not.toHaveClass('out')
      })
    })

    it('supports custom animations', () => {
      const { child, setProps } = renderTransition({ animation: 'jump', transitionOnMount: true })

      expectStatus(child(), TRANSITION_STATUS_ENTERING)
      expect(child()).toHaveClass('jump')

      setProps({ visible: false })
      expectStatus(child(), TRANSITION_STATUS_EXITING)
      expect(child()).toHaveClass('jump')
    })
  })

  describe('className', () => {
    it("passes element's className", () => {
      const { child } = renderTransition({}, <p className='foo bar' />)

      expect(child()).toHaveClass('foo', 'bar')
    })

    it('adds classes when ENTERED', () => {
      const { child } = renderTransition({ transitionOnMount: false })

      expect(child()).toHaveClass('visible', 'transition')
    })

    it('adds classes when ENTERING', () => {
      const { child } = renderTransition({ transitionOnMount: true })

      expect(child()).toHaveClass('animating', 'visible', 'transition')
    })

    it('adds classes when EXITED', () => {
      const { child } = renderTransition({
        visible: false,
        mountOnShow: false,
        unmountOnHide: false,
      })

      expect(child()).toHaveClass('hidden', 'transition')
    })

    it('adds classes when EXITING', () => {
      const { child, setProps } = renderTransition({ transitionOnMount: false })
      setProps({ visible: false })

      expect(child()).toHaveClass('animating', 'visible', 'transition')
    })
  })

  describe('directional', () => {
    it('adds classes when is "true"', () => {
      const { child, setProps } = renderTransition({ directional: true, transitionOnMount: true })

      expectStatus(child(), TRANSITION_STATUS_ENTERING)
      expect(child()).toHaveClass('in')

      setProps({ visible: false })
      expectStatus(child(), TRANSITION_STATUS_EXITING)
      expect(child()).toHaveClass('out')
    })

    it('do not add classes when is "false"', () => {
      const { child, setProps } = renderTransition({ directional: false, transitionOnMount: true })

      expectStatus(child(), TRANSITION_STATUS_ENTERING)
      expect(child()).not.toHaveClass('in')

      setProps({ visible: false })
      expectStatus(child(), TRANSITION_STATUS_EXITING)
      expect(child()).not.toHaveClass('out')
    })
  })

  describe('children', () => {
    it('clones element', () => {
      const { child } = renderTransition({}, <p className='foo' />)

      expect(child()).toHaveClass('foo')
    })

    it('returns null when UNMOUNTED', () => {
      // The frozen spec passed `mountOnShow={false} unmountOnHide={false}`,
      // which computes to EXITED rather than UNMOUNTED — and its `blank()`
      // assertion passed anyway, because the rendered <p> holds no text.
      // UNMOUNTED is what `visible={false}` with the default `mountOnShow`
      // produces, and it is the case that renders nothing.
      const { container } = renderTransition({ visible: false }, <p className='foo bar' />)

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('constructor', () => {
    it('has default statuses', () => {
      const { child } = renderTransition({})

      expectStatus(child(), TRANSITION_STATUS_ENTERED)
      expect(child()).not.toHaveAttribute('data-test-next-status')
    })

    it('sets statuses when `visible` is false', () => {
      const { child } = renderTransition({ visible: false })

      expect(child()).toBeNull()
    })

    it('sets statuses when mount is disabled', () => {
      const { child } = renderTransition({
        visible: false,
        mountOnShow: false,
        unmountOnHide: false,
      })

      expectStatus(child(), TRANSITION_STATUS_EXITED)
      expect(child()).not.toHaveAttribute('data-test-next-status')
    })
  })

  describe('duration', () => {
    it('does not apply to style when ENTERED', () => {
      const { child } = renderTransition({ transitionOnMount: false })

      expect(child().style.animationDuration).toBe('')
    })

    it('applies default value to style when ENTERING', () => {
      const { child } = renderTransition({ transitionOnMount: true })

      expectStatus(child(), TRANSITION_STATUS_ENTERING)
      expect(child()).toHaveStyle({ animationDuration: '500ms' })
    })

    it('applies numeric value to style when ENTERING', () => {
      const { child } = renderTransition({ duration: 1000, transitionOnMount: true })

      expectStatus(child(), TRANSITION_STATUS_ENTERING)
      expect(child()).toHaveStyle({ animationDuration: '1000ms' })
    })

    it('applies object value to style when ENTERING', () => {
      const { child } = renderTransition({
        duration: { hide: 1000, show: 2000 },
        transitionOnMount: true,
      })

      expectStatus(child(), TRANSITION_STATUS_ENTERING)
      expect(child()).toHaveStyle({ animationDuration: '2000ms' })
    })

    it('does not apply to style when EXITED', () => {
      const { child } = renderTransition({
        visible: false,
        mountOnShow: false,
        unmountOnHide: false,
      })

      expectStatus(child(), TRANSITION_STATUS_EXITED)
      expect(child().style.animationDuration).toBe('')
    })

    it('applies default value to style when EXITING', () => {
      const { child, setProps } = renderTransition({})
      setProps({ visible: false })

      expectStatus(child(), TRANSITION_STATUS_EXITING)
      expect(child()).toHaveStyle({ animationDuration: '500ms' })
    })

    it('applies numeric value to style when EXITING', () => {
      // The frozen version of this test was a copy of the ENTERING one — it
      // passed `transitionOnMount` and asserted ENTERING — so it never covered
      // the exiting side of `normalizeTransitionDuration`. It does now.
      const { child, setProps } = renderTransition({ duration: 1000, transitionOnMount: false })
      setProps({ visible: false })

      expectStatus(child(), TRANSITION_STATUS_EXITING)
      expect(child()).toHaveStyle({ animationDuration: '1000ms' })
    })

    it('applies object value to style when EXITING', () => {
      const { child, setProps } = renderTransition({ duration: { hide: 1000, show: 2000 } })
      setProps({ visible: false })

      expectStatus(child(), TRANSITION_STATUS_EXITING)
      expect(child()).toHaveStyle({ animationDuration: '1000ms' })
    })
  })

  describe('visible', () => {
    it('updates status when set to false while ENTERING', () => {
      const { child, setProps } = renderTransition({ transitionOnMount: true })

      expectStatus(child(), TRANSITION_STATUS_ENTERING)

      setProps({ visible: false })
      expectStatus(child(), TRANSITION_STATUS_EXITING)
      expect(child()).toHaveAttribute('data-test-next-status', TRANSITION_STATUS_EXITED)
    })

    it('updates status when set to false while ENTERED', () => {
      const { child, setProps } = renderTransition({ transitionOnMount: false })

      expectStatus(child(), TRANSITION_STATUS_ENTERED)

      setProps({ visible: false })
      expectStatus(child(), TRANSITION_STATUS_EXITING)
      expect(child()).toHaveAttribute('data-test-next-status', TRANSITION_STATUS_EXITED)
    })

    it('updates status when set to true while UNMOUNTED', () => {
      const { child, setProps } = renderTransition({ visible: false })

      expect(child()).toBeNull()

      setProps({ visible: true })
      expectStatus(child(), TRANSITION_STATUS_ENTERING)
      expect(child()).toHaveAttribute('data-test-next-status', TRANSITION_STATUS_ENTERED)
    })

    it('updates next status when set to false while performs an ENTERING transition', async () => {
      const onHide = vi.fn()
      const { child, setProps } = renderTransition({
        duration: 10,
        transitionOnMount: true,
        onHide,
      })

      expectStatus(child(), TRANSITION_STATUS_ENTERING)

      setProps({ visible: false })
      expectStatus(child(), TRANSITION_STATUS_EXITING)
      expect(child()).toHaveAttribute('data-test-next-status', TRANSITION_STATUS_EXITED)

      await waitFor(() => expect(onHide).toHaveBeenCalled())
    })

    it('updates next status when set to true while performs an EXITING transition', async () => {
      const onShow = vi.fn()
      const { child, setProps } = renderTransition({ duration: 10, onShow, visible: true })

      expectStatus(child(), TRANSITION_STATUS_ENTERED)

      setProps({ visible: false })
      expectStatus(child(), TRANSITION_STATUS_EXITING)
      expect(child()).toHaveAttribute('data-test-next-status', TRANSITION_STATUS_EXITED)

      setProps({ visible: true })
      expectStatus(child(), TRANSITION_STATUS_ENTERING)
      expect(child()).toHaveAttribute('data-test-next-status', TRANSITION_STATUS_ENTERED)

      await waitFor(() => expect(onShow).toHaveBeenCalled())
    })
  })

  describe('onComplete', () => {
    it('is called with (null, props) when transition completed', async () => {
      const onComplete = vi.fn()
      renderTransition({ duration: 0, onComplete, transitionOnMount: true })

      await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1))
      expect(onComplete).toHaveBeenCalledWith(
        null,
        expect.objectContaining({ duration: 0, status: TRANSITION_STATUS_ENTERED }),
      )
    })

    it('is called after a render with visibility changes', () => {
      // A plain rerender mid-transition must not clear the pending timeout.
      // https://github.com/Semantic-Org/Semantic-UI-React/issues/4059
      vi.useFakeTimers()

      try {
        const onComplete = vi.fn()
        const { setProps } = renderTransition({
          duration: 200,
          onComplete,
          transitionOnMount: true,
        })

        act(() => vi.advanceTimersByTime(100))
        setProps({})
        act(() => vi.advanceTimersByTime(150))

        expect(onComplete).toHaveBeenCalledTimes(1)
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('onHide', () => {
    it('is called with (null, props) when hidden', async () => {
      const onHide = vi.fn()
      const { setProps } = renderTransition({ duration: 0, onHide, transitionOnMount: false })

      setProps({ visible: false })

      await waitFor(() => expect(onHide).toHaveBeenCalledTimes(1))
      expect(onHide).toHaveBeenCalledWith(
        null,
        expect.objectContaining({ duration: 0, status: TRANSITION_STATUS_EXITED }),
      )
    })

    it('depends on the specified duration', () => {
      vi.useFakeTimers()

      try {
        const onHide = vi.fn()
        const { child, setProps } = renderTransition({
          duration: { hide: 200 },
          onHide,
          transitionOnMount: false,
        })

        setProps({ visible: false })
        expectStatus(child(), TRANSITION_STATUS_EXITING)

        act(() => vi.advanceTimersByTime(100))
        expectStatus(child(), TRANSITION_STATUS_EXITING)
        expect(onHide).not.toHaveBeenCalled()

        act(() => vi.advanceTimersByTime(100))
        expect(onHide).toHaveBeenCalledTimes(1)
        expectStatus(child(), TRANSITION_STATUS_EXITED)
      } finally {
        vi.useRealTimers()
      }
    })

    it('will be called once even during rerender', () => {
      const onStart = vi.fn()
      const { child, setProps } = renderTransition({ duration: 200, onStart })

      setProps({ visible: false })

      expectStatus(child(), TRANSITION_STATUS_EXITING)
      expect(child()).toHaveAttribute('data-test-next-status', TRANSITION_STATUS_EXITED)

      setProps({ visible: false })

      expectStatus(child(), TRANSITION_STATUS_EXITING)
      expect(child()).toHaveAttribute('data-test-next-status', TRANSITION_STATUS_EXITED)

      expect(onStart).toHaveBeenCalledTimes(1)
    })
  })

  describe('onShow', () => {
    it('is called with (null, props) when shown', async () => {
      const onShow = vi.fn()
      renderTransition({ duration: 0, onShow, transitionOnMount: true })

      await waitFor(() => expect(onShow).toHaveBeenCalledTimes(1))
      expect(onShow).toHaveBeenCalledWith(
        null,
        expect.objectContaining({ duration: 0, status: TRANSITION_STATUS_ENTERED }),
      )
    })

    it('depends on the specified duration', () => {
      vi.useFakeTimers()

      try {
        const onShow = vi.fn()
        const { child } = renderTransition({
          duration: { show: 200 },
          onShow,
          transitionOnMount: true,
        })

        expectStatus(child(), TRANSITION_STATUS_ENTERING)

        act(() => vi.advanceTimersByTime(100))
        expectStatus(child(), TRANSITION_STATUS_ENTERING)
        expect(onShow).not.toHaveBeenCalled()

        act(() => vi.advanceTimersByTime(100))
        expect(onShow).toHaveBeenCalledTimes(1)
        expectStatus(child(), TRANSITION_STATUS_ENTERED)
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('onStart', () => {
    it('is called with (null, props) when transition started', async () => {
      const onStart = vi.fn()
      renderTransition({ duration: 0, onStart, transitionOnMount: true })

      await waitFor(() => expect(onStart).toHaveBeenCalledTimes(1))
      expect(onStart).toHaveBeenCalledWith(
        null,
        expect.objectContaining({ duration: 0, status: TRANSITION_STATUS_ENTERING }),
      )
    })

    it('will be called once even during rerender', () => {
      const onStart = vi.fn()
      const { child, setProps } = renderTransition({
        duration: 200,
        onStart,
        transitionOnMount: true,
      })

      expectStatus(child(), TRANSITION_STATUS_ENTERING)
      expect(child()).toHaveAttribute('data-test-next-status', TRANSITION_STATUS_ENTERED)

      setProps({})

      expectStatus(child(), TRANSITION_STATUS_ENTERING)
      expect(child()).toHaveAttribute('data-test-next-status', TRANSITION_STATUS_ENTERED)

      expect(onStart).toHaveBeenCalledTimes(1)
    })
  })

  describe('style', () => {
    it("passes element's style", () => {
      const { child } = renderTransition({}, <p style={{ bottom: 5, top: 10 }} />)

      expect(child()).toHaveStyle({ bottom: '5px', top: '10px' })
    })
  })

  describe('unmountOnHide', () => {
    it('unmounts child when true', async () => {
      const { child, setProps } = renderTransition({
        duration: 0,
        transitionOnMount: false,
        unmountOnHide: true,
      })

      setProps({ visible: false })

      await waitFor(() => expect(child()).toBeNull())
    })

    it('lefts mounted when false', async () => {
      const { child, setProps } = renderTransition({
        duration: 0,
        transitionOnMount: false,
        unmountOnHide: false,
      })

      setProps({ visible: false })

      await waitFor(() => expectStatus(child(), TRANSITION_STATUS_EXITED))
    })
  })
})
