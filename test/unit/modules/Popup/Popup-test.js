import { act, fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import _ from 'lodash'
import React from 'react'

import { SUI } from 'src/lib'
import Popup from 'src/modules/Popup/Popup'
import PopupContent from 'src/modules/Popup/PopupContent'
import PopupHeader from 'src/modules/Popup/PopupHeader'
import { positionsMapping } from 'src/modules/Popup/lib/positions'
import * as common from 'test/support/commonTests'

const wait = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

// The popup renders through a Portal, so every query is against the document
// rather than the render container.
const popup = () => document.body.querySelector('.ui.popup')
const inBody = (selector) => document.body.querySelector(selector) !== null

// Popper positions a wrapping `div` rather than the popup itself, so the
// strategy and the shorthand props land one level up.
const popperElement = () => popup().parentElement

// Portal's own content node, one level up again — the element it attaches its
// mouse listeners to, and the only target `closeOnPortalMouseLeave` acts on.
const portalContent = () => document.body.querySelector('[data-suir-portal]')

/**
 * Popup's Popper configuration — `pinned`, `offset`, `popperModifiers` — has no
 * DOM trace of its own in jsdom, which computes no layout. Reading it back
 * through a modifier of our own goes via `popperModifiers`, a public prop, and
 * Popper's documented modifier API, rather than through Popup's internals.
 *
 * Disabled modifiers are dropped from `orderedModifiers`, so presence in the
 * returned list is the same question as `enabled`.
 */
const withPopperState = async (element, extraModifiers = []) => {
  let state
  const probe = {
    name: 'testProbe',
    enabled: true,
    phase: 'beforeRead',
    fn: (options) => {
      state = options.state
    },
  }

  render(React.cloneElement(element, { popperModifiers: [...extraModifiers, probe] }))
  await waitFor(() => expect(popup()).not.toBeNull())

  return {
    placement: state.options.placement,
    strategy: state.options.strategy,
    modifiers: state.orderedModifiers,
    modifier: (name) => _.find(state.orderedModifiers, { name }),
  }
}

describe('Popup', () => {
  // Interactions go through user-event, which sends the whole pointer, focus
  // and keyboard sequence a browser does. `fireEvent` is kept only for `scroll`,
  // which user-event has no gesture for and jsdom cannot produce by itself.
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  common.isConformant(Popup, { rendersChildren: false, rendersPortal: true, forwardsRef: false })
  common.hasSubcomponents(Popup, [PopupHeader, PopupContent])

  describe('children', () => {
    it('renders a Portal', async () => {
      // Enzyme asked what element type Popup returned. The observable fact is
      // that its output lands outside the tree it was rendered into.
      const { container } = render(<Popup open />)

      expect(container).toBeEmptyDOMElement()
      expect(inBody('[data-suir-portal] .ui.popup.visible')).toBe(true)
    })

    it('renders to the document body', async () => {
      render(<Popup open />)

      expect(inBody('.ui.popup.visible')).toBe(true)
    })

    it('renders child text', async () => {
      render(<Popup open>child text</Popup>)

      expect(popup()).toHaveTextContent('child text')
    })

    it('renders child components', async () => {
      const child = <div data-child />
      render(<Popup open>{child}</Popup>)

      expect(popup().querySelector('[data-child]')).not.toBeNull()
    })
  })

  describe('className', () => {
    it('should add className to the wrapping node', async () => {
      render(<Popup className='some-class' open />)

      expect(inBody('.ui.popup.visible.some-class')).toBe(true)
    })
  })

  describe('basic', () => {
    it('adds basic to the popup className', async () => {
      render(<Popup basic open />)

      expect(inBody('.ui.basic.popup.visible')).toBe(true)
    })
  })

  describe('disabled', () => {
    it('is not disabled by default', async () => {
      render(<Popup open trigger={<button />} />)

      expect(inBody('.ui.popup.visible')).toBe(true)
    })

    it('does not render Portal if disabled', async () => {
      const { container } = render(<Popup disabled trigger={<button />} />)

      expect(container.querySelector('button')).not.toBeNull()
      expect(inBody('.ui.popup')).toBe(false)
    })

    it('does not render Portal even with open prop', async () => {
      render(<Popup open disabled trigger={<button />} />)

      expect(inBody('.ui.popup')).toBe(false)
    })
  })

  describe('eventsEnabled', () => {
    // Popper's eventListeners modifier subscribes to window scroll and resize;
    // that subscription is the whole point of the prop, and it is observable.
    const windowEvents = async (element) => {
      const addEventListener = vi.spyOn(window, 'addEventListener')

      render(element)
      await waitFor(() => expect(popup()).not.toBeNull())

      const events = addEventListener.mock.calls.map(([event]) => event)
      addEventListener.mockRestore()

      return events
    }

    it('is "true" by default', async () => {
      expect(await windowEvents(<Popup open />)).toEqual(
        expect.arrayContaining(['scroll', 'resize']),
      )
    })

    it('can be set to "false"', async () => {
      const events = await windowEvents(<Popup eventsEnabled={false} open />)

      expect(events).not.toContain('scroll')
      expect(events).not.toContain('resize')
    })
  })

  describe('flowing', () => {
    it('adds flowing to the popup className', async () => {
      render(<Popup flowing open />)

      expect(inBody('.ui.flowing.popup.visible')).toBe(true)
    })
  })

  describe('hideOnScroll', () => {
    const trigger = <button>foo</button>

    it('hides on window scroll', async () => {
      const { container } = render(<Popup content='foo' hideOnScroll trigger={trigger} />)

      await user.click(container.querySelector('button'))
      expect(inBody('.ui.popup.visible')).toBe(true)

      fireEvent.scroll(window)
      expect(inBody('.ui.popup.visible')).toBe(false)
    })

    it('is called with (e, props) when scroll', async () => {
      const onClose = vi.fn()
      const { container } = render(
        <Popup content='foo' hideOnScroll onClose={onClose} trigger={trigger} />,
      )

      await user.click(container.querySelector('button'))
      fireEvent.scroll(window)

      expect(onClose).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ content: 'foo', onClose, trigger }),
      )
    })

    it('not hide on scroll from inside a popup', async () => {
      const onClose = vi.fn()
      const { container } = render(
        <Popup hideOnScroll onClose={onClose} trigger={trigger}>
          <div data-child />
        </Popup>,
      )
      await user.click(container.querySelector('button'))

      fireEvent.scroll(document.querySelector('[data-child]'))
      expect(onClose).not.toHaveBeenCalled()

      fireEvent.scroll(window)
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('hoverable', () => {
    // Enzyme read `closeOnPortalMouseLeave` off the Portal element. What the
    // option does is close the popup when the pointer leaves it — and Portal
    // acts only on a mouseleave whose target is its own content node, which is
    // neither `.ui.popup` nor the div Popper positions.
    //
    // Heads up! Portal closes on a timer, and the resulting setState lands
    // outside act(), so the DOM does not catch up until something flushes.
    // `waitFor` does; a bare `await wait(n)` does not, and would report the
    // popup still open however long it waited.
    it('can be set to stay visible while hovering the popup', async () => {
      render(<Popup content='foo' defaultOpen mouseLeaveDelay={0} trigger={<button />} />)

      await user.hover(portalContent())
      await user.unhover(portalContent())
      await act(() => wait(20))

      expect(inBody('.ui.popup')).toBe(true)
    })

    it('closes on mouse leave of the popup when set', async () => {
      render(<Popup content='foo' defaultOpen hoverable mouseLeaveDelay={0} trigger={<button />} />)

      await user.hover(portalContent())
      await user.unhover(portalContent())

      await waitFor(() => expect(inBody('.ui.popup')).toBe(false))
    })
  })

  describe('inverted', () => {
    it('adds inverted to the popup className', async () => {
      render(<Popup inverted open />)

      expect(inBody('.ui.inverted.popup.visible')).toBe(true)
    })
  })

  describe('offset', () => {
    it('passes values to Popper', async () => {
      const { modifier } = await withPopperState(
        <Popup content='foo' open offset={[50, 100]} position='bottom right' />,
      )

      expect(modifier('offset').options).toMatchObject({ offset: [50, 100] })
    })
  })

  describe('onClose', () => {
    it('is not called on click inside of the popup', async () => {
      const onClose = vi.fn()
      render(<Popup defaultOpen onClose={onClose} />)

      await user.click(popup())

      expect(onClose).not.toHaveBeenCalled()
    })

    it('is called on body click', async () => {
      const onClose = vi.fn()
      render(<Popup defaultOpen onClose={onClose} />)

      await user.click(document.body)

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('is called when pressing escape', async () => {
      const onClose = vi.fn()
      render(<Popup defaultOpen onClose={onClose} />)

      await user.keyboard('{Escape}')

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('is not called when the open prop changes to false', async () => {
      const onClose = vi.fn()
      const { rerender } = render(<Popup defaultOpen onClose={onClose} />)

      rerender(<Popup open={false} onClose={onClose} />)

      expect(onClose).not.toHaveBeenCalled()
    })

    it('is called with (e, props) on body click', async () => {
      const onClose = vi.fn()
      render(
        <Popup defaultOpen onClose={onClose} trigger={<div />}>
          <p />
        </Popup>,
      )

      await user.click(document.body)

      expect(onClose).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ open: false }),
      )
    })
  })

  describe('onOpen', () => {
    it('is called on trigger click', async () => {
      const onOpen = vi.fn()
      const { container } = render(
        <Popup onOpen={onOpen} trigger={<div id='trigger' />}>
          <p />
        </Popup>,
      )

      await user.click(container.querySelector('#trigger'))

      expect(onOpen).toHaveBeenCalledTimes(1)
      expect(onOpen).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ open: true }),
      )
    })
  })

  describe('open', () => {
    it('is not open by default', async () => {
      render(<Popup />)

      expect(inBody('.ui.popup.visible')).toBe(false)
    })

    it('does not show the popup when false', async () => {
      render(<Popup open={false} />)

      expect(inBody('.ui.popup.visible')).toBe(false)
    })

    it('shows the popup on changing from false to true', async () => {
      const { rerender } = render(<Popup open={false} />)
      expect(inBody('.ui.popup.visible')).toBe(false)

      rerender(<Popup open />)
      expect(inBody('.ui.popup.visible')).toBe(true)
    })

    it('hides the popup on changing from true to false', async () => {
      const { rerender } = render(<Popup open />)
      expect(inBody('.ui.popup.visible')).toBe(true)

      rerender(<Popup open={false} />)
      expect(inBody('.ui.popup.visible')).toBe(false)
    })
  })

  describe('pinned', () => {
    it('is "true" by default', async () => {
      const { modifier } = await withPopperState(<Popup open />)

      expect(modifier('flip')).toBeDefined()
    })

    it('disables "flip" modifier in PopperJS when is "true"', async () => {
      const { modifier } = await withPopperState(<Popup open pinned />)

      expect(modifier('flip')).toBeUndefined()
    })

    it('enables "flip" modifier in PopperJS when is "false"', async () => {
      const { modifier } = await withPopperState(<Popup open pinned={false} />)

      expect(modifier('flip')).toBeDefined()
    })
  })

  describe('position', () => {
    // Popper's resolved placement comes back as a class on the popup, so this
    // is the one Popper prop with a DOM trace of its own.
    _.forEach(positionsMapping, (placement, position) => {
      it(`passes the "${position}" as "${placement}" to Popper`, () => {
        render(<Popup open position={position} />)

        expect(popup()).toHaveClass(...position.split(' '))
      })
    })
  })

  describe('positionFixed', () => {
    it('is not defined by default', async () => {
      render(<Popup open />)

      expect(popperElement()).toHaveStyle({ position: 'absolute' })
    })

    it('can be set to "true"', async () => {
      render(<Popup positionFixed open />)

      expect(popperElement()).toHaveStyle({ position: 'fixed' })
    })
  })

  describe('popper', () => {
    it('passes a zIndex value from .popup', async () => {
      render(<Popup open style={{ zIndex: 5000 }} />)

      // The transfer happens in a Popper modifier, one frame later.
      await waitFor(() => expect(popperElement().style.zIndex).toBe('5000'))
    })

    it('zIndex passed to a shorthand wins', async () => {
      render(<Popup open popper={{ style: { zIndex: 100 } }} style={{ zIndex: 5000 }} />)

      await waitFor(() => expect(popperElement().style.zIndex).toBe('100'))
    })

    it('additional props can be passed via shorthand', async () => {
      render(<Popup open popper={{ className: 'foo', id: 'bar' }} />)

      expect(popperElement()).toHaveClass('foo')
      expect(popperElement()).toHaveAttribute('id', 'bar')
    })

    it('"style" prop is merged', async () => {
      render(<Popup open popper={{ style: { color: 'red', display: 'block' } }} />)

      // `display` is overridden by Popup, `color` is not.
      expect(popperElement()).toHaveStyle({ color: 'rgb(255, 0, 0)', display: 'flex' })
    })
  })

  describe('popperModifiers', () => {
    // Heads up! `enabled: true` is load-bearing here, and the frozen spec did
    // not have it. Popup hard-codes `enabled: !!offset` for both of these
    // modifiers, and Popper merges by name without a later entry's missing
    // `enabled` overriding an earlier one — so the shape Popper's own docs
    // show, `{ name, options }`, arrives merged but still disabled. The frozen
    // assertion read the raw array prop, where membership says nothing about
    // effect. See issue #28.
    it('are passed to Popper', async () => {
      const modifierOffset = { name: 'offset', enabled: true, options: { offset: [0, 10] } }
      const modifierPreventOverflow = {
        name: 'preventOverflow',
        enabled: true,
        options: { padding: 0 },
      }
      const { modifier } = await withPopperState(<Popup open />, [
        modifierOffset,
        modifierPreventOverflow,
      ])

      expect(modifier('offset').options).toMatchObject({ offset: [0, 10] })
      expect(modifier('preventOverflow').options).toMatchObject({ padding: 0 })
    })

    it('cannot enable a modifier Popup disables, without an explicit "enabled"', async () => {
      const { modifier } = await withPopperState(<Popup open />, [
        { name: 'offset', options: { offset: [0, 10] } },
      ])

      // Documents today's behaviour, not the desired one — see issue #28.
      expect(modifier('offset')).toBeUndefined()
    })
  })

  describe('size', () => {
    const sizes = _.without(SUI.SIZES, 'medium', 'big', 'massive')

    sizes.forEach((size) => {
      it(`adds the ${size} to the popup className`, () => {
        render(<Popup size={size} open />)

        expect(inBody(`.ui.${size}.popup`)).toBe(true)
      })
    })
  })

  describe('trigger', () => {
    it('opens Popup on click', async () => {
      const { container } = render(<Popup on='click' content='foo' trigger={<button />} />)

      await user.click(container.querySelector('button'))

      expect(inBody('.ui.popup.visible')).toBe(true)
    })

    it('opens Popup on hover', async () => {
      const { container } = render(<Popup content='foo' mouseEnterDelay={0} trigger={<button />} />)

      await user.hover(container.querySelector('button'))

      await waitFor(() => expect(inBody('.ui.popup.visible')).toBe(true))
    })

    it('opens Popup on focus', async () => {
      const { container } = render(<Popup on='focus' content='foo' trigger={<input />} />)

      // Tab rather than click, so it is the focus opening the popup and not
      // the click that would come with it.
      await user.tab()
      expect(document.activeElement).toBe(container.querySelector('input'))

      expect(inBody('.ui.popup.visible')).toBe(true)
    })

    it('opens Popup on multiple', async () => {
      const { container } = render(
        <Popup on={['click', 'hover']} content='foo' mouseEnterDelay={0} trigger={<button />} />,
      )
      const button = container.querySelector('button')

      // Heads up! With both triggers on, a real pointer always hovers before it
      // clicks, so the hover is what opens the popup and the click that follows
      // toggles it shut — `closeOnTriggerClick` is set by the 'click' entry.
      // The frozen spec's `simulate('click')` sent no hover, so it saw the
      // click do the opening.
      await user.hover(button)
      await waitFor(() => expect(inBody('.ui.popup.visible')).toBe(true))

      await user.click(button)
      expect(inBody('.ui.popup.visible')).toBe(false)

      await user.click(button)
      expect(inBody('.ui.popup.visible')).toBe(true)
    })
  })

  describe('wide', () => {
    it('adds to the popup className', async () => {
      render(<Popup wide open />)

      expect(inBody('.ui.wide.popup.visible')).toBe(true)
    })

    it('adds "very" to the popup className', async () => {
      render(<Popup wide='very' open />)

      expect(inBody('.ui.very.wide.popup.visible')).toBe(true)
    })
  })
})
