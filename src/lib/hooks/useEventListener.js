import * as React from 'react'

import isBrowser from '../isBrowser'

/**
 * A ref object pointing at `document`, for use as a `targetRef`.
 *
 * Module-level and therefore referentially stable, which matters: it is the
 * default `target` for subscriptions that want the document, and a fresh object
 * each render would resubscribe the listener on every render.
 */
export const documentRef = { current: isBrowser() ? document : null }

const getWindowEvent = () => (typeof window === 'undefined' ? undefined : window.event)

/**
 * Subscribes to a DOM event for the lifetime of the component.
 *
 * Replaces `@fluentui/react-component-event-listener`, which set `defaultProps`
 * on a function component — React 18 warns about that and React 19 removes the
 * feature outright, so the defaults would silently become `undefined`. See
 * issue #35.
 *
 * @param {object} options
 * @param {Function} options.listener Called with the event.
 * @param {String} options.type An event name to subscribe to.
 * @param {Boolean} [options.capture=false] Listen during the capture phase.
 * @param {Boolean} [options.enabled=true] Subscribe only while true. A hook
 *   cannot be called conditionally, so this stands in for rendering a listener
 *   component conditionally.
 * @param {Document|Window|HTMLElement} [options.target] The element to subscribe
 *   on. Mutually exclusive with `targetRef`.
 * @param {React.RefObject} [options.targetRef] A ref to that element. Mutually
 *   exclusive with `target`.
 */
export default function useEventListener(options) {
  const { capture = false, enabled = true, listener, target, targetRef, type } = options

  // The listener is usually redefined every render and closes over current
  // props. Keeping the latest in a ref means it can be read at dispatch time
  // without the subscription being torn down and rebuilt each render.
  const latestListener = React.useRef(listener)
  latestListener.current = listener

  const eventHandler = React.useCallback((event) => latestListener.current(event), [])
  const timeoutId = React.useRef()

  if (process.env.NODE_ENV !== 'production') {
    // Environment variables do not change during a component's lifecycle, so
    // the conditional hook is safe here.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      if (typeof target !== 'undefined' && typeof targetRef !== 'undefined') {
        throw new Error(
          'useEventListener(): `target` and `targetRef` are mutually exclusive, use one of them.',
        )
      }

      if (typeof target === 'undefined' && typeof targetRef === 'undefined') {
        throw new Error('useEventListener(): one of `target` or `targetRef` is required.')
      }
    }, [target, targetRef])
  }

  React.useEffect(() => {
    if (!enabled) {
      return undefined
    }

    const element = typeof targetRef === 'undefined' ? target : targetRef.current

    if (!element || typeof element.addEventListener !== 'function') {
      if (process.env.NODE_ENV !== 'production') {
        throw new Error(
          'useEventListener(): the passed element does not support addEventListener().',
        )
      }

      return undefined
    }

    // Heads up!
    // An effect can run while the event that caused it is still propagating, so
    // a listener subscribed here can be called with that very event — which
    // would, for instance, let the click that opens a Sidebar immediately close
    // it again. Comparing against the in-flight event skips that one dispatch.
    // This relies on a deprecated but very well supported quirk of the platform.
    // https://github.com/facebook/react/issues/20074
    let currentEvent = getWindowEvent()

    const conditionalHandler = (event) => {
      if (event === currentEvent) {
        currentEvent = undefined
        return
      }

      eventHandler(event)
    }

    element.addEventListener(type, conditionalHandler, capture)

    // The in-flight event is only worth skipping for the tick it belongs to.
    timeoutId.current = setTimeout(() => {
      currentEvent = undefined
    }, 1)

    return () => {
      clearTimeout(timeoutId.current)
      currentEvent = undefined
      element.removeEventListener(type, conditionalHandler, capture)
    }
  }, [capture, enabled, eventHandler, target, targetRef, type])
}
