import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import ReactDOMServer from 'react-dom/server'

import Modal from 'src/modules/Modal/Modal'
import ModalHeader from 'src/modules/Modal/ModalHeader'
import ModalContent from 'src/modules/Modal/ModalContent'
import ModalActions from 'src/modules/Modal/ModalActions'
import ModalDescription from 'src/modules/Modal/ModalDescription'
import ModalDimmer from 'src/modules/Modal/ModalDimmer'

import * as common from 'test/support/commonTests'
import isBrowser from 'src/lib/isBrowser'

// Modal renders through a Portal, so everything it produces lands in
// document.body rather than in the container RTL hands back. `props` is tracked
// so a rerender can merge like Enzyme's setProps did.
let view
let currentProps
let currentElement

const wrapperMount = (element) => {
  currentElement = element
  currentProps = element.props
  view = render(element)

  return view
}

const setProps = (next) => {
  currentProps = { ...currentProps, ...next }
  view.rerender({ ...currentElement, props: currentProps })
}

const inBody = (selector) => document.body.querySelector(selector)

describe('Modal', () => {
  // Interactions go through user-event, which sends the pointer, focus and
  // keyboard sequence a browser does rather than the single event `fireEvent`
  // dispatches.
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  beforeEach(() => {
    for (const selector of ['.ui.dimmer', '.ui.modal']) {
      const node = document.body.querySelector(selector)
      if (node) node.parentNode.removeChild(node)
    }
  })

  common.isConformant(Modal, { rendersPortal: true })
  common.hasSubcomponents(Modal, [
    ModalHeader,
    ModalContent,
    ModalActions,
    ModalDescription,
    ModalDimmer,
  ])
  common.hasValidTypings(Modal)

  common.implementsShorthandProp(Modal, {
    autoGenerateKey: false,
    propKey: 'header',
    ShorthandComponent: ModalHeader,
    mapValueToProps: (content) => ({ content }),
    rendersPortal: true,
    requiredProps: { open: true },
  })
  common.implementsShorthandProp(Modal, {
    autoGenerateKey: false,
    propKey: 'content',
    ShorthandComponent: ModalContent,
    mapValueToProps: (content) => ({ content }),
    rendersPortal: true,
    requiredProps: { open: true },
  })

  // Heads up!
  //
  // Our commonTests do not currently handle wrapped components.
  // Nor do they handle components rendered to the body with Portal.
  // The Modal is wrapped in a Portal, so we manually test a few things here.

  it('renders a Portal', async () => {
    const { container } = render(<Modal open />)

    // A Portal renders nothing into its own container; the modal is in the body.
    expect(container).toBeEmptyDOMElement()
    expect(inBody('.ui.modal')).not.toBeNull()
  })

  it('renders to the document body', async () => {
    wrapperMount(<Modal open />)
    expect(inBody('.ui.modal')).not.toBeNull()
  })

  it('renders child text', async () => {
    wrapperMount(<Modal open>child text</Modal>)

    expect(inBody('.ui.modal')).toHaveTextContent('child text')
  })

  it('renders child components', async () => {
    const child = <div data-child />
    wrapperMount(<Modal open>{child}</Modal>)

    expect(document.querySelector('.ui.modal').querySelector('[data-child]')).not.toBe(
      null,
      'Modal did not render the child component.',
    )
  })

  it("spreads the user's style prop on the Modal", async () => {
    const style = { marginTop: '1em', top: 0 }

    wrapperMount(<Modal open style={style} />)
    const element = document.querySelector('.ui.modal')

    expect(element.style).toHaveProperty('marginTop', '1em')
    expect(element.style).toHaveProperty('top', '0px')
  })

  describe('actions', () => {
    it('closes the modal on action click', async () => {
      wrapperMount(<Modal actions={['OK']} defaultOpen />)

      expect(inBody('.ui.modal')).not.toBeNull()
      await user.click(inBody('.ui.modal .actions .button'))
      expect(inBody('.ui.modal')).toBeNull()
    })

    it('calls shorthand onActionClick callback', async () => {
      const onActionClick = vi.fn()
      const modalActions = { onActionClick, actions: [{ key: 'ok', content: 'OK' }] }
      wrapperMount(<Modal actions={modalActions} defaultOpen />)

      expect(onActionClick).not.toHaveBeenCalled()
      await user.click(inBody('.ui.modal .actions .button'))
      expect(onActionClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('onActionClick', () => {
    it('is called when an action is clicked', async () => {
      const onActionClick = vi.fn()
      const props = { actions: ['OK'], defaultOpen: true, onActionClick }

      wrapperMount(<Modal {...props} />)
      await user.click(inBody('.ui.modal .actions .button'))

      expect(onActionClick).toHaveBeenCalledTimes(1)
      expect(onActionClick).toHaveBeenCalledWith(expect.objectContaining({}), props)
    })
  })

  describe('open', () => {
    it('is not open by default', async () => {
      wrapperMount(<Modal />)
      expect(inBody('.ui.modal.open')).toBeNull()
    })

    it('is passed to Portal open', async () => {
      const first = render(<Modal open />)
      expect(inBody('.ui.modal')).not.toBeNull()
      first.unmount()

      render(<Modal open={false} />)
      expect(inBody('.ui.modal')).toBeNull()
    })

    it('is not passed to Modal', async () => {
      // `open` drives the Portal; it must not leak onto the modal element.
      const { unmount } = render(<Modal open />)

      expect(inBody('.ui.modal')).not.toHaveAttribute('open')

      unmount()
      render(<Modal open={false} />)

      expect(inBody('.ui.modal')).toBeNull()
    })

    it('does not show the modal when false', async () => {
      wrapperMount(<Modal open={false} />)
      expect(inBody('.ui.modal')).toBeNull()
    })

    it('does not show the dimmer when false', async () => {
      wrapperMount(<Modal open={false} />)
      expect(inBody('.ui.dimmer')).toBeNull()
    })

    it('shows the dimmer when true', async () => {
      wrapperMount(<Modal open dimmer />)
      expect(inBody('.ui.dimmer')).not.toBeNull()
    })

    it('shows the modal when true', async () => {
      wrapperMount(<Modal open />)
      expect(inBody('.ui.modal')).not.toBeNull()
    })

    it('shows the modal and dimmer on changing from false to true', async () => {
      wrapperMount(<Modal open={false} />)
      expect(inBody('.ui.modal')).toBeNull()
      expect(inBody('.ui.dimmer')).toBeNull()

      setProps({ open: true })

      expect(inBody('.ui.modal')).not.toBeNull()
      expect(inBody('.ui.dimmer')).not.toBeNull()
    })

    it('hides the modal and dimmer on changing from true to false', async () => {
      wrapperMount(<Modal open />)
      expect(inBody('.ui.modal')).not.toBeNull()
      expect(inBody('.ui.dimmer')).not.toBeNull()

      setProps({ open: false })

      expect(inBody('.ui.modal')).toBeNull()
      expect(inBody('.ui.dimmer')).toBeNull()
    })
  })

  describe('basic', () => {
    it('adds basic to the modal className', async () => {
      wrapperMount(<Modal basic open />)
      expect(inBody('.ui.basic.modal')).not.toBeNull()
    })
  })

  describe('size', () => {
    const sizes = ['mini', 'tiny', 'small', 'large', 'fullscreen']

    sizes.forEach((size) => {
      it(`adds the "${size}" to the modal className`, () => {
        wrapperMount(<Modal size={size} open />)
        expect(inBody(`.ui.${size}.modal`)).not.toBeNull()
      })
    })
  })

  describe('dimmer', () => {
    it('renders ModalDimmer by default', async () => {
      wrapperMount(<Modal open />)
      expect(inBody('.ui.dimmer')).not.toBeNull()
    })

    it('renders ModalDimmer when is "true"', async () => {
      wrapperMount(<Modal open dimmer />)
      expect(inBody('.ui.dimmer')).not.toBeNull()
    })

    it('passes "blurring" to ModalDimmer', async () => {
      wrapperMount(<Modal open dimmer='blurring' />)
      expect(document.body).toHaveClass('blurring')
    })

    it('passes "inverted" to ModalDimmer', async () => {
      wrapperMount(<Modal open dimmer='inverted' />)
      expect(inBody('.ui.dimmer')).toHaveClass('inverted')
    })

    describe('object', () => {
      it('passes props to a dimmer element', async () => {
        wrapperMount(<Modal open dimmer={{ className: 'bar', id: 'dimmer', inverted: true }} />)

        expect(inBody('.ui.dimmer')).toHaveClass('inverted')
        expect(inBody('.ui.dimmer')).toHaveClass('bar')
        expect(inBody('.ui.dimmer')).toHaveAttribute('id', 'dimmer')
      })
    })
  })

  describe('onOpen', () => {
    it('is called on trigger click', async () => {
      const onOpen = vi.fn()
      wrapperMount(<Modal onOpen={onOpen} trigger={<div id='trigger' />} />)

      await user.click(inBody('#trigger'))
      expect(onOpen).toHaveBeenCalledTimes(1)
      expect(onOpen).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'click' }),
        expect.objectContaining({ open: true }),
      )
    })

    it('is not called on body click', async () => {
      const onOpen = vi.fn()
      wrapperMount(<Modal onOpen={onOpen} />)

      await user.click(document.body)
      expect(onOpen).not.toHaveBeenCalled()
    })
  })

  describe('onClose', () => {
    it('is called on dimmer click', async () => {
      const onClose = vi.fn()
      wrapperMount(<Modal onClose={onClose} defaultOpen />)

      await user.click(inBody('.ui.dimmer'))
      expect(onClose).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ open: false }),
      )
    })

    it('is called on click outside of the modal', async () => {
      const onClose = vi.fn()
      wrapperMount(<Modal onClose={onClose} defaultOpen />)

      await user.click(document.querySelector('.ui.modal').parentNode)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('is not called on mousedown inside and mouseup outside of the modal', async () => {
      const onClose = vi.fn()
      wrapperMount(<Modal onClose={onClose} defaultOpen />)

      // A drag that starts inside the modal and ends outside it: press on the
      // modal, release on the dimmer. `user.click` on the dimmer would send its
      // own mousedown there, which is the case this test exists to exclude.
      await user.pointer([
        { target: document.querySelector('.ui.modal'), keys: '[MouseLeft>]' },
        { target: document.querySelector('.ui.modal').parentNode, keys: '[/MouseLeft]' },
      ])
      expect(onClose).not.toHaveBeenCalled()
    })

    it('is not called on click inside of the modal', async () => {
      const onClose = vi.fn()
      wrapperMount(<Modal onClose={onClose} defaultOpen />)

      await user.click(document.querySelector('.ui.modal'))
      expect(onClose).not.toHaveBeenCalled()
    })

    it('is not called on body click', async () => {
      const onClose = vi.fn()
      wrapperMount(<Modal onClose={onClose} defaultOpen />)

      await user.click(document.body)
      expect(onClose).not.toHaveBeenCalled()
    })

    it('is called when pressing escape', async () => {
      const onClose = vi.fn()
      wrapperMount(<Modal onClose={onClose} defaultOpen />)

      await user.keyboard('{Escape}')
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('is not called when the open prop changes to false', async () => {
      const onClose = vi.fn()
      wrapperMount(<Modal onClose={onClose} defaultOpen />)

      setProps({ open: false })
      expect(onClose).not.toHaveBeenCalled()
    })

    it('is not called when open changes to false programmatically', async () => {
      const onClose = vi.fn()
      wrapperMount(<Modal onClose={onClose} defaultOpen />)

      setProps({ open: false })
      expect(onClose).not.toHaveBeenCalled()
    })

    it('is not called on dimmer click when closeOnDimmerClick is false', async () => {
      const onClose = vi.fn()
      wrapperMount(<Modal onClose={onClose} defaultOpen closeOnDimmerClick={false} />)

      await user.click(inBody('.ui.dimmer'))
      expect(onClose).not.toHaveBeenCalled()
    })

    it('is not called on body click when closeOnDocumentClick is false', async () => {
      const onClose = vi.fn()
      wrapperMount(<Modal onClose={onClose} defaultOpen closeOnDocumentClick={false} />)

      await user.click(document.body)
      expect(onClose).not.toHaveBeenCalled()
    })

    it('handles unmount without errors', async () => {
      function ControlledExample() {
        const [open, setState] = React.useState(true)

        return (
          <>
            {open && <Modal open onClose={() => setState(false)} />}
            <button id='close-button' />
          </>
        )
      }

      wrapperMount(<ControlledExample />)
      expect(inBody('.ui.modal')).not.toBeNull()

      await user.keyboard('{Escape}')
      expect(inBody('.ui.modal')).toBeNull()
    })
  })

  describe('closeOnEscape', () => {
    it('closes the modal when Escape is pressed by default', async () => {
      wrapperMount(<Modal defaultOpen closeOnEscape />)

      expect(inBody('.ui.dimmer')).not.toBeNull()
      await user.keyboard('{Escape}')
      expect(inBody('.ui.dimmer')).toBeNull()
    })

    it('closes the modal when true and Escape is pressed', async () => {
      wrapperMount(<Modal defaultOpen closeOnEscape />)

      expect(inBody('.ui.dimmer')).not.toBeNull()
      await user.keyboard('{Escape}')
      expect(inBody('.ui.dimmer')).toBeNull()
    })

    it('does not close the modal when false and Escape is pressed', async () => {
      wrapperMount(<Modal defaultOpen closeOnEscape={false} />)

      expect(inBody('.ui.dimmer')).not.toBeNull()
      await user.keyboard('{Escape}')
      expect(inBody('.ui.dimmer')).not.toBeNull()
    })
  })

  describe('closeOnDocumentClick', () => {
    it('is false by default', async () => {
      wrapperMount(<Modal defaultOpen />)

      expect(inBody('.ui.dimmer')).not.toBeNull()
      await user.click(document.body)
      expect(inBody('.ui.dimmer')).not.toBeNull()
    })
    it('closes the modal on document click when true', async () => {
      wrapperMount(<Modal defaultOpen closeOnDocumentClick />)

      expect(inBody('.ui.dimmer')).not.toBeNull()
      await user.click(document.body)
      expect(inBody('.ui.dimmer')).toBeNull()
    })
    it('does not close the modal on document click when false', async () => {
      wrapperMount(<Modal defaultOpen closeOnDocumentClick={false} />)

      expect(inBody('.ui.dimmer')).not.toBeNull()
      await user.click(document.body)
      expect(inBody('.ui.dimmer')).not.toBeNull()
    })
  })

  describe('mountNode', () => {
    it('render modal within mountNode', async () => {
      const mountNode = document.createElement('div')
      document.body.appendChild(mountNode)

      wrapperMount(
        <Modal mountNode={mountNode} open>
          foo
        </Modal>,
      )
      expect(mountNode.querySelector('.ui.modal')).not.toBeNull()
    })
  })

  describe('closeIcon', () => {
    it('is not present by default', async () => {
      wrapperMount(<Modal open>foo</Modal>)
      expect(inBody('.ui.modal .icon')).toBeNull()
    })

    it('defaults to `close` when boolean', async () => {
      wrapperMount(
        <Modal open closeIcon>
          foo
        </Modal>,
      )
      expect(inBody('.ui.modal .icon.close')).not.toBeNull()
    })

    it('is present when passed', async () => {
      wrapperMount(
        <Modal open closeIcon='bullseye'>
          foo
        </Modal>,
      )
      expect(inBody('.ui.modal .icon.bullseye')).not.toBeNull()
    })

    it('triggers onClose when clicked', async () => {
      const spy = vi.fn()

      wrapperMount(
        <Modal onClose={spy} open closeIcon='bullseye'>
          foo
        </Modal>,
      )
      await user.click(inBody('.ui.modal .icon.bullseye'))
      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('scrolling', () => {
    const innerHeight = window.innerHeight

    afterEach(() => {
      document.body.classList.remove('scrolling')
    })

    afterAll(() => {
      window.innerHeight = innerHeight
    })

    it('does not pass "scrolling" by default', async () => {
      wrapperMount(<Modal open />)
      expect(document.body).not.toHaveClass('scrolling')
    })

    it('does not pass "scrolling" when equal to the window height', async () => {
      /* 101 is `padding * 2 + 1, see Modal/utils */
      const height = window.innerHeight - 101

      wrapperMount(
        <Modal open style={{ height }}>
          foo
        </Modal>,
      )

      // Modal measures on the next frame, so wait for one before asserting.
      // Asserting inside the callback lets the test finish first and the
      // failure then escapes the test entirely.
      await new Promise((resolve) => {
        requestAnimationFrame(resolve)
      })

      expect(document.body).not.toHaveClass('scrolling')
    })

    it('passes "scrolling" when taller than the window', async () => {
      window.innerHeight = 10
      wrapperMount(<Modal open>foo</Modal>)

      await waitFor(() => {
        expect(document.body).toHaveClass('scrolling')
      })
    })

    it('passes "scrolling" when the window grows/shrinks', async () => {
      wrapperMount(
        <Modal open>
          <span />
        </Modal>,
      )
      window.innerHeight = 10

      await waitFor(() => {
        expect(document.body).toHaveClass('scrolling')
      })

      window.innerHeight = 10000

      await waitFor(() => {
        expect(document.body).not.toHaveClass('scrolling')
      })
    })
  })

  describe('server-side', () => {
    beforeAll(() => {
      isBrowser.override = false
    })

    afterAll(() => {
      isBrowser.override = null
    })

    it('renders empty content when trigger is not a valid component', async () => {
      const markup = ReactDOMServer.renderToStaticMarkup(<Modal />)
      expect(markup).toBe('')
    })

    it('renders a valid trigger component', async () => {
      const markup = ReactDOMServer.renderToStaticMarkup(<Modal trigger={<div id='trigger' />} />)
      expect(markup).toBe('<div id="trigger"></div>')
    })
  })
})
