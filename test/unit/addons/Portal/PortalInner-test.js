import { dom } from 'test/support/rtl'
import { render } from '@testing-library/react'
import React from 'react'

import PortalInner from 'src/addons/Portal/PortalInner'
import { isBrowser } from 'src/lib'
import * as common from 'test/support/commonTests'

describe('PortalInner', () => {
  common.isConformant(PortalInner, {
    rendersChildren: false,
    requiredProps: { children: <p /> },
    forwardsRef: false,
  })

  describe('children', () => {
    beforeAll(() => {
      isBrowser.override = false
    })

    afterAll(() => {
      isBrowser.override = null
    })

    it('renders `null` when during Server-Side Rendering', () => {
      const before = document.body.querySelectorAll('p').length

      dom(
        <PortalInner>
          <p />
        </PortalInner>,
      )

      expect(document.body.querySelectorAll('p')).toHaveLength(before)
    })
  })

  describe('ref', () => {
    it('returns ref a DOM element', () => {
      const portalRef = React.createRef()
      const elementRef = React.createRef()

      dom(
        <PortalInner ref={portalRef}>
          <p ref={elementRef} />
        </PortalInner>,
      )

      expect(portalRef.current).toBe(elementRef.current)
      expect(portalRef.current.tagName).toBe('P')
    })

    it('returns ref a elements that uses ref forwarding', () => {
      const CustomComponent = React.forwardRef((props, ref) => <p {...props} ref={ref} />)

      const portalRef = React.createRef()
      const elementRef = React.createRef()

      dom(
        <PortalInner ref={portalRef}>
          <CustomComponent ref={elementRef} />
        </PortalInner>,
      )

      expect(portalRef.current).toBe(elementRef.current)
      expect(portalRef.current.tagName).toBe('P')
    })

    it('returns ref to a created element in other cases', () => {
      function CustomComponent(props) {
        return <p {...props} />
      }

      const portalRef = React.createRef()

      dom(
        <PortalInner ref={portalRef}>
          <CustomComponent />
        </PortalInner>,
      )

      expect(portalRef.current.tagName).toBe('DIV')
      expect(portalRef.current.dataset.suirPortal).toBe('true')
    })
  })

  describe('onMount', () => {
    it('called when mounting', () => {
      const onMount = vi.fn()

      dom(
        <PortalInner onMount={onMount}>
          <p />
        </PortalInner>,
      )

      expect(onMount).toHaveBeenCalledTimes(1)
    })
  })

  describe('onUnmount', () => {
    it('is called only once when unmounting', () => {
      const onUnmount = vi.fn()
      const { unmount } = render(
        <PortalInner onUnmount={onUnmount}>
          <p />
        </PortalInner>,
      )

      unmount()

      expect(onUnmount).toHaveBeenCalledTimes(1)
    })
  })
})
