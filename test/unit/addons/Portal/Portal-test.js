import { fireEvent, render } from '@testing-library/react'
import PropTypes from 'prop-types'
import React from 'react'

import Portal from 'src/addons/Portal/Portal'
import PortalInner from 'src/addons/Portal/PortalInner'
import * as common from 'test/support/commonTests'

/**
 * Portal renders its children into `document.body`, outside the container RTL
 * gives us, so "is the portal open" is a query for a marked child anywhere in
 * the document. Enzyme asked `wrapper.should.have.descendants(PortalInner)`,
 * which was a question about the element tree; this is the same question asked
 * of the DOM.
 */
const CHILD_MARKER = 'data-portal-child'
const isOpen = () => document.body.querySelector(`[${CHILD_MARKER}]`) !== null
const portalChild = (props = {}) => <p {...{ [CHILD_MARKER]: true }} {...props} />

const wait = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

const createHandlingComponent = (eventName) =>
  class HandlingComponent extends React.Component {
    handleEvent = (e) => this.props.handler(e, this.props)

    render() {
      return <button {...{ [eventName]: this.handleEvent }} />
    }
  }

describe('Portal', () => {
  common.hasSubcomponents(Portal, [PortalInner])
  common.hasValidTypings(Portal, { forwardsRef: false })

  it('propTypes.children should be required', () => {
    expect(Portal.propTypes.children).toBe(PropTypes.node.isRequired)
  })

  it('does not warn when an open portal is unmounted', () => {
    // Enzyme spied on wrapper.setState to prove nothing was set after unmount.
    // There is no wrapper to spy on now; the observable symptom of that bug is
    // React's "state update on an unmounted component" warning.
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { unmount } = render(<Portal open>{portalChild()}</Portal>)

    unmount()

    expect(error).not.toHaveBeenCalled()
    error.mockRestore()
  })

  describe('open', () => {
    it('opens the portal when toggled from false to true', () => {
      const { rerender } = render(<Portal open={false}>{portalChild()}</Portal>)
      expect(isOpen()).toBe(false)

      rerender(<Portal open>{portalChild()}</Portal>)
      expect(isOpen()).toBe(true)
    })

    it('closes the portal when toggled from true to false', () => {
      const { rerender } = render(<Portal open>{portalChild()}</Portal>)
      expect(isOpen()).toBe(true)

      rerender(<Portal open={false}>{portalChild()}</Portal>)
      expect(isOpen()).toBe(false)
    })
  })

  describe('onMount', () => {
    it('called when portal opens', () => {
      const onMount = vi.fn()
      const { rerender } = render(
        <Portal open={false} onMount={onMount}>
          {portalChild()}
        </Portal>,
      )

      rerender(
        <Portal open onMount={onMount}>
          {portalChild()}
        </Portal>,
      )

      expect(onMount).toHaveBeenCalledTimes(1)
    })

    it('is not called when portal receives props', () => {
      const onMount = vi.fn()
      const { rerender } = render(
        <Portal open={false} onMount={onMount}>
          {portalChild()}
        </Portal>,
      )

      rerender(
        <Portal open onMount={onMount} className='old'>
          {portalChild()}
        </Portal>,
      )
      expect(onMount).toHaveBeenCalledTimes(1)

      rerender(
        <Portal open onMount={onMount} className='new'>
          {portalChild()}
        </Portal>,
      )
      expect(onMount).toHaveBeenCalledTimes(1)
    })
  })

  describe('onUnmount', () => {
    it('is called when portal closes', () => {
      const onUnmount = vi.fn()
      const { rerender } = render(
        <Portal open onUnmount={onUnmount}>
          {portalChild()}
        </Portal>,
      )

      rerender(
        <Portal open={false} onUnmount={onUnmount}>
          {portalChild()}
        </Portal>,
      )

      expect(onUnmount).toHaveBeenCalledTimes(1)
    })

    it('is not called when portal receives props', () => {
      const onUnmount = vi.fn()
      const { rerender } = render(
        <Portal open onUnmount={onUnmount}>
          {portalChild()}
        </Portal>,
      )

      rerender(
        <Portal open={false} onUnmount={onUnmount} className='old'>
          {portalChild()}
        </Portal>,
      )
      expect(onUnmount).toHaveBeenCalledTimes(1)

      rerender(
        <Portal open={false} onUnmount={onUnmount} className='new'>
          {portalChild()}
        </Portal>,
      )
      expect(onUnmount).toHaveBeenCalledTimes(1)
    })

    it('is called only once when portal closes and then is unmounted', () => {
      const onUnmount = vi.fn()
      const { rerender, unmount } = render(
        <Portal open onUnmount={onUnmount}>
          {portalChild()}
        </Portal>,
      )

      rerender(
        <Portal open={false} onUnmount={onUnmount}>
          {portalChild()}
        </Portal>,
      )
      unmount()

      expect(onUnmount).toHaveBeenCalledTimes(1)
    })

    it('is called only once when directly unmounting', () => {
      const onUnmount = vi.fn()
      const { unmount } = render(
        <Portal open onUnmount={onUnmount}>
          {portalChild()}
        </Portal>,
      )

      unmount()

      expect(onUnmount).toHaveBeenCalledTimes(1)
    })
  })

  describe('onOpen', () => {
    it('is called on trigger click', () => {
      const onOpen = vi.fn()
      const { container } = render(
        <Portal onOpen={onOpen} trigger={<div id='trigger' />}>
          {portalChild()}
        </Portal>,
      )

      fireEvent.click(container.querySelector('#trigger'))

      expect(onOpen).toHaveBeenCalledTimes(1)
      expect(onOpen.mock.calls[0][1]).toMatchObject({ open: true })
    })
  })

  describe('onClose', () => {
    it('is called on body click', () => {
      const onClose = vi.fn()
      render(
        <Portal defaultOpen onClose={onClose} trigger={<div />}>
          {portalChild()}
        </Portal>,
      )

      fireEvent.click(document.body)

      expect(onClose).toHaveBeenCalled()
      expect(onClose.mock.calls[0][1]).toMatchObject({ open: false })
    })
  })

  describe('trigger', () => {
    it('renders nothing when not set', () => {
      const { container } = render(<Portal>{portalChild()}</Portal>)

      expect(container).toBeEmptyDOMElement()
    })

    it('renders the trigger when set', () => {
      const text = 'open by click on me'
      const { container } = render(
        <Portal trigger={<button>{text}</button>}>{portalChild()}</Portal>,
      )

      expect(container).toHaveTextContent(text)
    })

    for (const handlerName of ['onBlur', 'onClick', 'onFocus', 'onMouseLeave', 'onMouseEnter']) {
      it(`handles ${handlerName} on trigger and passes all arguments`, () => {
        const handler = vi.fn()
        const Trigger = createHandlingComponent(handlerName)
        const { container } = render(
          <Portal trigger={<Trigger color='blue' handler={handler} />}>{portalChild()}</Portal>,
        )

        const eventName = handlerName.slice(2)
        fireEvent[eventName.charAt(0).toLowerCase() + eventName.slice(1)](
          container.querySelector('button'),
        )

        expect(handler).toHaveBeenCalledTimes(1)
        expect(handler.mock.calls[0][1]).toMatchObject({ handler, color: 'blue' })
      })
    }
  })

  describe('triggerRef', () => {
    it('calls itself and an original ref', () => {
      const elementRef = React.createRef()
      const triggerRef = React.createRef()

      const { container } = render(
        <Portal trigger={<div id='trigger' ref={elementRef} />} triggerRef={triggerRef}>
          {portalChild()}
        </Portal>,
      )
      const element = container.querySelector('#trigger')

      expect(element.tagName).toBe('DIV')
      expect(elementRef.current).toBe(element)
      expect(triggerRef.current).toBe(element)
    })
  })

  describe('mountNode', () => {
    it('renders the portal into the given node', () => {
      const mountNode = document.createElement('div')
      document.body.appendChild(mountNode)

      render(
        <Portal mountNode={mountNode} open>
          {portalChild()}
        </Portal>,
      )

      expect(mountNode.querySelector(`[${CHILD_MARKER}]`)).not.toBeNull()

      document.body.removeChild(mountNode)
    })
  })

  describe('openOnTriggerClick', () => {
    it('defaults to true', () => {
      const onTriggerClick = vi.fn()
      const { container } = render(
        <Portal trigger={<button onClick={onTriggerClick}>button</button>}>{portalChild()}</Portal>,
      )
      expect(isOpen()).toBe(false)

      fireEvent.click(container.querySelector('button'))

      expect(isOpen()).toBe(true)
      expect(onTriggerClick).toHaveBeenCalledTimes(1)
    })

    it('does not open the portal on trigger click when false', () => {
      const spy = vi.fn()
      const { container } = render(
        <Portal trigger={<button onClick={spy}>button</button>} openOnTriggerClick={false}>
          {portalChild()}
        </Portal>,
      )
      expect(isOpen()).toBe(false)

      fireEvent.click(container.querySelector('button'))

      expect(isOpen()).toBe(false)
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('opens the portal on trigger click when true', () => {
      const spy = vi.fn()
      const { container } = render(
        <Portal trigger={<button onClick={spy}>button</button>} openOnTriggerClick>
          {portalChild()}
        </Portal>,
      )
      expect(isOpen()).toBe(false)

      fireEvent.click(container.querySelector('button'))

      expect(isOpen()).toBe(true)
      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('closeOnTriggerClick', () => {
    it('does not close the portal on click', () => {
      const { container } = render(
        <Portal trigger={<button />} defaultOpen>
          {portalChild()}
        </Portal>,
      )
      expect(isOpen()).toBe(true)

      fireEvent.click(container.querySelector('button'))

      expect(isOpen()).toBe(true)
    })

    it('closes the portal on click when set', () => {
      const { container } = render(
        <Portal trigger={<button />} defaultOpen closeOnTriggerClick>
          {portalChild()}
        </Portal>,
      )
      expect(isOpen()).toBe(true)

      fireEvent.click(container.querySelector('button'))

      expect(isOpen()).toBe(false)
    })
  })

  describe('openOnTriggerMouseEnter', () => {
    it('does not open the portal on mouseenter when not set', () => {
      const { container } = render(<Portal trigger={<button />}>{portalChild()}</Portal>)
      expect(isOpen()).toBe(false)

      fireEvent.mouseEnter(container.querySelector('button'))

      expect(isOpen()).toBe(false)
    })

    it('opens the portal on mouseenter when set', async () => {
      const { container } = render(
        <Portal trigger={<button />} openOnTriggerMouseEnter mouseEnterDelay={0}>
          {portalChild()}
        </Portal>,
      )
      expect(isOpen()).toBe(false)

      fireEvent.mouseEnter(container.querySelector('button'))
      await wait(5)

      expect(isOpen()).toBe(true)
    })

    /**
     * e--l--d--v
     * ^: mouseenter
     *    ^: BEFORE_DELAY: mouseleave
     *       ^: expected DELAY
     *          ^: final validation
     */
    it('does not open the portal when leave before delay', async () => {
      const DELAY = 20
      const BEFORE_DELAY = 10

      const { container } = render(
        <Portal trigger={<button />} openOnTriggerMouseEnter mouseEnterDelay={DELAY}>
          {portalChild()}
        </Portal>,
      )
      expect(isOpen()).toBe(false)

      fireEvent.mouseEnter(container.querySelector('button'))
      await wait(BEFORE_DELAY)

      expect(isOpen()).toBe(false)
      fireEvent.mouseLeave(container.querySelector('button'))
      await wait(DELAY)

      expect(isOpen()).toBe(false)
    })
  })

  describe('closeOnTriggerMouseLeave', () => {
    it('does not close the portal on mouseleave when not set', async () => {
      const { container } = render(
        <Portal trigger={<button />} defaultOpen mouseLeaveDelay={0}>
          {portalChild()}
        </Portal>,
      )
      expect(isOpen()).toBe(true)

      fireEvent.mouseLeave(container.querySelector('button'))
      await wait(5)

      expect(isOpen()).toBe(true)
    })

    it('closes the portal on mouseleave when set', async () => {
      const { container } = render(
        <Portal trigger={<button />} defaultOpen closeOnTriggerMouseLeave mouseLeaveDelay={0}>
          {portalChild()}
        </Portal>,
      )
      expect(isOpen()).toBe(true)

      fireEvent.mouseLeave(container.querySelector('button'))
      await wait(5)

      expect(isOpen()).toBe(false)
    })

    /**
     * e--l--e--d--v
     * ^: mouseenter
     *    ^: mouseleave
     *       ^: BEFORE_DELAY: reenter
     *          ^: expected DELAY
     *             ^: final validation
     */
    it('does not close the portal when reenter before delay', async () => {
      const DELAY = 20
      const BEFORE_DELAY = 10

      const { container } = render(
        <Portal
          trigger={<button />}
          defaultOpen
          closeOnTriggerMouseLeave
          openOnTriggerMouseEnter
          mouseLeaveDelay={DELAY}
          mouseEnterDelay={0}
        >
          {portalChild()}
        </Portal>,
      )
      const trigger = container.querySelector('button')
      expect(isOpen()).toBe(true)

      fireEvent.mouseLeave(trigger)
      await wait(BEFORE_DELAY)

      fireEvent.mouseEnter(trigger)
      await wait(DELAY)

      expect(isOpen()).toBe(true)
    })
  })

  describe('closeOnPortalMouseLeave', () => {
    it('does not close the portal on mouseleave of portal when not set', async () => {
      render(
        <Portal trigger={<button />} defaultOpen mouseLeaveDelay={0}>
          {portalChild({ id: 'inner' })}
        </Portal>,
      )
      expect(isOpen()).toBe(true)

      fireEvent.mouseLeave(document.getElementById('inner'))
      await wait(5)

      expect(isOpen()).toBe(true)
    })

    it('closes the portal on mouseleave of portal when set', async () => {
      render(
        <Portal closeOnPortalMouseLeave defaultOpen mouseLeaveDelay={0} trigger={<button />}>
          {portalChild({ id: 'inner' })}
        </Portal>,
      )
      expect(isOpen()).toBe(true)

      fireEvent.mouseLeave(document.getElementById('inner'))
      await wait(5)

      expect(isOpen()).toBe(false)
    })

    it("does not close the portal on mouseleave triggered by the portal's children", async () => {
      render(
        <Portal closeOnPortalMouseLeave defaultOpen mouseLeaveDelay={0} trigger={<button />}>
          <div {...{ [CHILD_MARKER]: true }}>
            <p id='child' />
          </div>
        </Portal>,
      )
      expect(isOpen()).toBe(true)

      fireEvent.mouseLeave(document.getElementById('child'))
      await wait(5)

      expect(isOpen()).toBe(true)
    })
  })

  describe('closeOnTriggerMouseLeave + closeOnPortalMouseLeave', () => {
    it('closes the portal on trigger mouseleave even when portal receives mouseenter within limit', async () => {
      const delay = 10
      const { container } = render(
        <Portal trigger={<button />} defaultOpen closeOnTriggerMouseLeave mouseLeaveDelay={delay}>
          {portalChild({ id: 'inner' })}
        </Portal>,
      )
      expect(isOpen()).toBe(true)

      fireEvent.mouseLeave(container.querySelector('button'))

      // Enter the portal inside the delay. Without closeOnPortalMouseLeave that
      // does not cancel the pending close.
      await wait(delay - 1)
      fireEvent.mouseEnter(document.getElementById('inner'))

      await wait(delay + 5)

      expect(isOpen()).toBe(false)
    })

    it('does not close the portal on trigger mouseleave when portal receives mouseenter within limit', async () => {
      const delay = 10
      const { container } = render(
        <Portal
          trigger={<button />}
          defaultOpen
          closeOnTriggerMouseLeave
          closeOnPortalMouseLeave
          mouseLeaveDelay={delay}
        >
          {portalChild({ id: 'inner' })}
        </Portal>,
      )
      expect(isOpen()).toBe(true)

      fireEvent.mouseLeave(container.querySelector('button'))

      await wait(delay - 1)
      fireEvent.mouseEnter(document.getElementById('inner'))

      await wait(delay + 5)

      expect(isOpen()).toBe(true)
    })
  })

  describe('openOnTriggerFocus', () => {
    it('does not open the portal on focus when not set', () => {
      const { container } = render(<Portal trigger={<button />}>{portalChild()}</Portal>)
      expect(isOpen()).toBe(false)

      fireEvent.focus(container.querySelector('button'))

      expect(isOpen()).toBe(false)
    })

    it('opens the portal on focus when set', () => {
      const { container } = render(
        <Portal trigger={<button />} openOnTriggerFocus>
          {portalChild({ id: 'inner' })}
        </Portal>,
      )
      expect(isOpen()).toBe(false)

      fireEvent.focus(container.querySelector('button'))

      expect(isOpen()).toBe(true)
    })
  })

  describe('closeOnTriggerBlur', () => {
    it('does not close the portal on blur when not set', () => {
      const { container } = render(
        <Portal trigger={<button />} defaultOpen>
          {portalChild({ id: 'inner' })}
        </Portal>,
      )
      expect(isOpen()).toBe(true)

      fireEvent.blur(container.querySelector('button'))

      expect(isOpen()).toBe(true)
    })

    it('closes the portal on blur when set', () => {
      const { container } = render(
        <Portal trigger={<button />} defaultOpen closeOnTriggerBlur>
          {portalChild()}
        </Portal>,
      )
      expect(isOpen()).toBe(true)

      fireEvent.blur(container.querySelector('button'))

      expect(isOpen()).toBe(false)
    })
  })

  describe('closeOnEscape', () => {
    it('closes the portal on escape', () => {
      render(
        <Portal closeOnEscape defaultOpen>
          {portalChild()}
        </Portal>,
      )
      expect(isOpen()).toBe(true)

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(isOpen()).toBe(false)
    })

    it('does not close the portal on escape when false', () => {
      render(
        <Portal closeOnEscape={false} defaultOpen>
          {portalChild()}
        </Portal>,
      )
      expect(isOpen()).toBe(true)

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(isOpen()).toBe(true)
    })
  })

  describe('closeOnDocumentClick', () => {
    it('closes the portal on document click', () => {
      render(
        <Portal closeOnDocumentClick defaultOpen>
          {portalChild()}
        </Portal>,
      )
      expect(isOpen()).toBe(true)

      fireEvent.click(document)

      expect(isOpen()).toBe(false)
    })

    it('does not close on click inside', () => {
      render(
        <Portal closeOnDocumentClick defaultOpen>
          {portalChild({ id: 'inner' })}
        </Portal>,
      )
      expect(isOpen()).toBe(true)

      fireEvent.click(document.getElementById('inner'))

      expect(isOpen()).toBe(true)
    })

    it('does not close on mousedown inside and mouseup outside', () => {
      render(
        <Portal closeOnDocumentClick defaultOpen>
          {portalChild({ id: 'inner' })}
        </Portal>,
      )
      expect(isOpen()).toBe(true)

      fireEvent.mouseDown(document.getElementById('inner'))
      fireEvent.click(document)

      expect(isOpen()).toBe(true)
    })
  })

  // Heads Up!
  // Portals used to take focus on mount and restore focus to the original
  // activeElement on unMount. One by one, those auto set/remove focus features
  // were removed and the assertions negated. These stay to ensure we are never
  // stealing focus.
  describe('focus', () => {
    it('does not take focus onMount', async () => {
      render(<Portal defaultOpen>{portalChild({ id: 'inner' })}</Portal>)

      await wait(0)

      expect(document.activeElement).not.toBe(document.getElementById('inner'))
    })

    it('does not take focus on unMount', async () => {
      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()
      expect(document.activeElement).toBe(input)

      const { rerender, unmount } = render(<Portal open>{portalChild()}</Portal>)
      expect(document.activeElement).toBe(input)

      await wait(0)

      rerender(<Portal open={false}>{portalChild()}</Portal>)
      unmount()

      expect(document.activeElement).toBe(input)
      document.body.removeChild(input)
    })

    it('does not take focus on re-render', async () => {
      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()
      expect(document.activeElement).toBe(input)

      const { rerender } = render(<Portal defaultOpen>{portalChild()}</Portal>)
      expect(document.activeElement).toBe(input)

      await wait(0)

      rerender(<Portal defaultOpen>{portalChild()}</Portal>)

      expect(document.activeElement).toBe(input)
      document.body.removeChild(input)
    })
  })
})
