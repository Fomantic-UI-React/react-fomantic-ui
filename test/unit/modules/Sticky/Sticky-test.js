import { dom } from 'test/support/rtl'
import _ from 'lodash'
import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import Sticky from 'src/modules/Sticky/Sticky'
import * as common from 'test/support/commonTests'

let contextEl
let container
let rerenderSticky
let currentProps
let positions

const mockContextEl = (values = {}) => (contextEl = { getBoundingClientRect: () => values })

/**
 * The scroll behaviour is driven entirely by measurements, which jsdom does not
 * compute, so the trigger and sticky elements have their rects stubbed. They are
 * the first and second children of the Sticky root.
 */
const mockRectOf = (index, values) => {
  const element = container.firstElementChild.childNodes[index]
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(values)
}

const mockTriggerEl = (values = {}) => mockRectOf(0, values)
const mockStickyEl = (values = {}) => mockRectOf(1, values)

const mockPositions = ({ bottomOffset = 5, offset = 5, height = 5 } = {}) =>
  (positions = { bottomOffset, height, offset })

const wrapperMount = (element) => {
  currentProps = element.props
  const view = render(element)
  container = view.container
  rerenderSticky = (next) => {
    currentProps = { ...currentProps, ...next }
    view.rerender({ ...element, props: currentProps })
  }

  return container
}

const setProps = (next) => rerenderSticky(next)

// Scroll to the top of the screen
const scrollToTop = () => {
  const { bottomOffset, height, offset } = positions

  setProps({
    context: { getBoundingClientRect: () => ({ bottom: height + offset + bottomOffset }) },
  })

  mockTriggerEl({ top: offset })
  mockStickyEl({ height, top: offset })

  fireEvent.scroll(window)
}

// Scroll until the trigger is not visible
const scrollAfterTrigger = () => {
  const { bottomOffset, height, offset } = positions

  setProps({
    context: { getBoundingClientRect: () => ({ bottom: window.innerHeight - bottomOffset + 1 }) },
  })

  mockTriggerEl({ top: offset - 1 })
  mockStickyEl({ height })

  fireEvent.scroll(window)
}

// Scroll until the context bottom is not visible
const scrollAfterContext = () => {
  const { height, offset } = positions

  setProps({ context: { getBoundingClientRect: () => ({ bottom: -1 }) } })

  mockTriggerEl({ top: offset - 1 })
  mockStickyEl({ height })

  fireEvent.scroll(window)
}

// Scroll to the last part of the context
const scrollToContextBottom = () => {
  const { height, offset } = positions

  setProps({ context: { getBoundingClientRect: () => ({ bottom: height + 1 }) } })

  mockTriggerEl({ top: offset - 1 })
  mockStickyEl({ height })

  fireEvent.scroll(window)
}

describe('Sticky', () => {
  common.isConformant(Sticky)
  common.forwardsRef(Sticky, { requiredProps: { active: false } })
  common.rendersChildren(Sticky, {
    rendersContent: false,
  })

  beforeEach(() => {
    // Sticky schedules its measurements on an animation frame; running the
    // callback synchronously keeps the tests assertions-after-scroll rather
    // than assertions-after-waiting.
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb()
      return 0
    })
  })

  describe('children', () => {
    it('should create two divs', () => {
      const children = dom(<Sticky />).firstElementChild.childNodes

      expect(children).toHaveLength(2)
      for (const child of children) {
        expect(child).toHaveTagName('div')
      }
    })
  })

  describe('active', () => {
    it('should handle update on mount when active', () => {
      const onTop = vi.fn()
      wrapperMount(<Sticky context={mockContextEl()} onTop={onTop} />)

      expect(onTop).toHaveBeenCalledTimes(1)
    })

    it('should not handle update on mount when not active', () => {
      const onTop = vi.fn()
      wrapperMount(<Sticky active={false} context={mockContextEl()} onTop={onTop} />)

      expect(onTop).not.toHaveBeenCalled()
    })

    it('fires event when changes to true', () => {
      const onTop = vi.fn()

      wrapperMount(<Sticky active={false} context={mockContextEl()} onTop={onTop} />)
      expect(onTop).not.toHaveBeenCalled()

      setProps({ active: true })
      expect(onTop).toHaveBeenCalledTimes(1)
    })

    it('omits event and removes styles when changes to false', () => {
      const onStick = vi.fn()
      const onUnStick = vi.fn()

      mockContextEl()
      mockPositions({ bottomOffset: 10, height: 50 })

      wrapperMount(
        <Sticky {...positions} context={contextEl} onStick={onStick} onUnstick={onUnStick} />,
      )

      _.forEach(['ui', 'sticky', 'fixed', 'top'], (className) =>
        expect(container.firstElementChild.childNodes[1]).toHaveClass(className),
      )

      expect(onStick).toHaveBeenCalledTimes(1)
      expect(onStick.mock.calls[0][1]).toMatchObject(positions)

      setProps({ active: false })
      scrollToTop()
      expect(container.firstElementChild.childNodes[1]).not.toHaveClass('fixed')
      expect(onUnStick).not.toHaveBeenCalled()
    })
  })

  describe('context', () => {
    it('should handle React refs', () => {
      const contextRef = { current: mockContextEl() }
      const onTop = vi.fn()
      wrapperMount(<Sticky context={contextRef} onTop={onTop} />)

      expect(onTop).toHaveBeenCalledTimes(1)
    })
  })

  describe('behaviour', () => {
    it('should stick to top of screen', () => {
      mockContextEl()
      mockPositions({ bottomOffset: 12, height: 200, offset: 12 })

      wrapperMount(<Sticky {...positions} context={contextEl} />)

      // Scroll after trigger
      scrollAfterTrigger()

      _.forEach(['ui', 'sticky', 'fixed', 'top'], (className) =>
        expect(container.firstElementChild.childNodes[1]).toHaveClass(className),
      )

      expect(container.firstElementChild.childNodes[1]).toHaveStyle({ top: '12px' })
    })

    it('should stick to bottom of context', () => {
      mockContextEl()
      mockPositions({ bottomOffset: 10, height: 100, offset: 20 })
      wrapperMount(<Sticky {...positions} context={contextEl} />)

      scrollAfterContext()
      _.forEach(['ui', 'sticky', 'bound', 'bottom'], (className) =>
        expect(container.firstElementChild.childNodes[1]).toHaveClass(className),
      )
      expect(container.firstElementChild.childNodes[1]).toHaveStyle({ bottom: '0px' })
    })

    it('should preserve sticky element height', () => {
      mockContextEl()
      mockPositions({ bottomOffset: 0, height: 100, offset: 0 })
      wrapperMount(<Sticky {...positions} context={contextEl} />)

      // Scroll after trigger
      scrollAfterTrigger()

      expect(container.firstElementChild.childNodes[0]).toHaveStyle({ height: '100px' })
    })
  })
  describe('onBottom', () => {
    it('is called with (e, data) when is on bottom', () => {
      const onBottom = vi.fn()
      mockContextEl()
      mockPositions()
      wrapperMount(<Sticky {...positions} context={contextEl} onBottom={onBottom} />)

      scrollAfterContext()
      expect(onBottom).toHaveBeenCalledTimes(1)
      expect(onBottom.mock.calls[0][1]).toMatchObject(positions)
      onBottom.mockClear()

      scrollToTop()
      expect(onBottom).not.toHaveBeenCalled()
    })
  })

  describe('onStick', () => {
    it('is called with (e, data) when stick', () => {
      const onStick = vi.fn()
      mockContextEl()
      mockPositions({ bottomOffset: 10, height: 50 })
      wrapperMount(<Sticky {...positions} context={contextEl} onStick={onStick} />)

      scrollAfterTrigger()
      expect(onStick).toHaveBeenCalledTimes(2)
      expect(onStick.mock.calls[0][1]).toMatchObject(positions)
      onStick.mockClear()

      scrollToTop()
      expect(onStick).not.toHaveBeenCalled()
    })
  })

  describe('onTop', () => {
    it('is called with (e, data) when is on top', () => {
      const onTop = vi.fn()
      mockContextEl()
      mockPositions({ bottomOffset: 10, height: 50 })
      wrapperMount(<Sticky {...positions} context={contextEl} onTop={onTop} />)

      scrollAfterContext()
      expect(onTop).not.toHaveBeenCalled()

      scrollToTop()
      expect(onTop).toHaveBeenCalledTimes(1)
      expect(onTop.mock.calls[0][1]).toMatchObject(positions)
    })
  })

  describe('onUnstick', () => {
    it('is called with (e, data) when unstick', () => {
      const onUnstick = vi.fn()
      mockContextEl()
      mockPositions({ bottomOffset: 10, height: 50 })
      wrapperMount(<Sticky {...positions} context={contextEl} onUnstick={onUnstick} />)

      scrollAfterTrigger()
      expect(onUnstick).not.toHaveBeenCalled()

      scrollToTop()
      expect(onUnstick).toHaveBeenCalledTimes(1)
      expect(onUnstick.mock.calls[0][1]).toMatchObject(positions)
    })
  })

  describe('pushing', () => {
    it('should push component back', () => {
      mockContextEl()
      mockPositions({ bottomOffset: 30, height: 100, offset: 10 })
      wrapperMount(<Sticky {...positions} context={contextEl} pushing />)

      scrollAfterTrigger()

      // Scroll back: component should still stick to context bottom
      scrollToContextBottom()
      setProps({ context: mockContextEl({ bottom: 0 }) })
      fireEvent.scroll(window)

      _.forEach(['ui', 'sticky', 'bound', 'bottom'], (className) =>
        expect(container.firstElementChild.childNodes[1]).toHaveClass(className),
      )
      expect(container.firstElementChild.childNodes[1]).toHaveStyle({ bottom: '0px' })

      // Scroll a bit before the top: component should stick to screen bottom
      scrollAfterTrigger()

      expect(container.firstElementChild.childNodes[1]).toHaveStyle({ bottom: '30px' })

      _.forEach(['ui', 'sticky', 'fixed', 'bottom'], (className) =>
        expect(container.firstElementChild.childNodes[1]).toHaveClass(className),
      )

      expect(container.firstElementChild.childNodes[1]).not.toHaveStyle({ top: '0px' })
    })

    it('should stop pushing when reaching top', () => {
      mockContextEl()
      mockPositions({ bottomOffset: 10, height: 100, offset: 10 })

      wrapperMount(<Sticky {...positions} context={contextEl} pushing />)

      scrollAfterTrigger()
      scrollToContextBottom()
      scrollToTop()
      scrollAfterTrigger()

      // Component should stick again to the top
      _.forEach(['ui', 'sticky', 'fixed', 'top'], (className) =>
        expect(container.firstElementChild.childNodes[1]).toHaveClass(className),
      )

      expect(container.firstElementChild.childNodes[1]).toHaveStyle({ top: '10px' })
    })
  })

  describe('scrollContext', () => {
    it('should use window as default', () => {
      const onStick = vi.fn()

      wrapperMount(<Sticky onStick={onStick} />)
      mockTriggerEl({ top: -1 })

      fireEvent.scroll(window)
      expect(onStick).toHaveBeenCalled()
    })

    it('should set a scroll context', () => {
      const div = document.createElement('div')
      const onStick = vi.fn()

      wrapperMount(<Sticky scrollContext={div} onStick={onStick} />)
      mockTriggerEl({ top: -1 })

      fireEvent.scroll(window)
      expect(onStick).not.toHaveBeenCalled()

      fireEvent.scroll(div)
      expect(onStick).toHaveBeenCalled()
    })

    it('should set a scroll context via React refs', () => {
      const scrollContextRef = { current: document.createElement('div') }
      const onStick = vi.fn()

      wrapperMount(<Sticky scrollContext={scrollContextRef} onStick={onStick} />)
      mockTriggerEl({ top: -1 })

      fireEvent.scroll(window)
      expect(onStick).not.toHaveBeenCalled()

      fireEvent.scroll(scrollContextRef.current)
      expect(onStick).toHaveBeenCalled()
    })

    it('should not call onStick when context is null', () => {
      const onStick = vi.fn()

      wrapperMount(<Sticky scrollContext={null} onStick={onStick} />)
      mockTriggerEl({ top: -1 })

      fireEvent.scroll(document)
      expect(onStick).not.toHaveBeenCalled()
    })

    it('should call onStick when scrollContext changes', () => {
      const div = document.createElement('div')
      const onStick = vi.fn()
      wrapperMount(<Sticky scrollContext={null} onStick={onStick} />)

      setProps({ scrollContext: div })
      mockTriggerEl({ top: -1 })

      fireEvent.scroll(div)
      expect(onStick).toHaveBeenCalled()
    })
  })

  describe('styleElement', () => {
    it('is passed to macthing element', () => {
      wrapperMount(<Sticky styleElement={{ zIndex: 10 }} />)
      const element = container.firstElementChild.childNodes[1]

      expect(element).toHaveStyle({ 'z-index': '10' })
    })
  })
})
