import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import Sidebar from 'src/modules/Sidebar/Sidebar'
import * as common from 'test/support/commonTests'

describe('Sidebar', () => {
  // Interactions go through user-event, which sends the pointer, focus and
  // keyboard sequence a browser does rather than the single event `fireEvent`
  // dispatches.
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  common.isConformant(Sidebar)
  common.forwardsRef(Sidebar)
  common.hasUIClassName(Sidebar)
  common.rendersChildren(Sidebar)

  common.propKeyOnlyToClassName(Sidebar, 'visible')

  common.propValueOnlyToClassName(Sidebar, 'animation', [
    'overlay',
    'push',
    'scale down',
    'uncover',
    'slide out',
    'slide along',
  ])
  common.propValueOnlyToClassName(Sidebar, 'direction', ['top', 'right', 'bottom', 'left'], {
    defaultValue: 'left',
  })
  common.propValueOnlyToClassName(Sidebar, 'width', ['very thin', 'thin', 'wide', 'very wide'])

  describe('componentWillUnmount', () => {
    it('will call "clearTimeout"', async () => {
      const clear = vi.spyOn(window, 'clearTimeout')
      const { rerender, unmount } = render(<Sidebar />)

      // start animation
      rerender(<Sidebar visible />)
      unmount()

      await waitFor(() => {
        expect(clear).toHaveBeenCalled()
      })
      clear.mockRestore()
    })
  })

  describe('onHide', () => {
    it('is called when the "visible" prop changes to "false"', async () => {
      const onHide = vi.fn()
      const { rerender } = render(<Sidebar onHide={onHide} visible />)
      expect(onHide).not.toHaveBeenCalled()

      rerender(<Sidebar onHide={onHide} visible={false} />)

      expect(onHide).toHaveBeenCalledTimes(1)
      expect(onHide.mock.calls[0][0]).toBeNull()
      expect(onHide.mock.calls[0][1]).toMatchObject({ visible: false })
    })

    it('is called when a click on the document was done', async () => {
      const onHide = vi.fn()
      render(<Sidebar onHide={onHide} visible />)
      expect(onHide).not.toHaveBeenCalled()

      await user.click(document.body)

      expect(onHide).toHaveBeenCalledTimes(1)
      expect(onHide.mock.calls[0][1]).toMatchObject({ visible: false })
    })

    it('is called when a click on the document was done only once', async () => {
      const onHide = vi.fn()
      const { rerender } = render(<Sidebar onHide={onHide} visible />)

      await user.click(document.body)
      rerender(<Sidebar onHide={onHide} visible={false} />)

      expect(onHide).toHaveBeenCalledTimes(1)
    })

    it('is not called when a click was done inside the component', async () => {
      const onHide = vi.fn()
      const { container } = render(
        <Sidebar onHide={onHide} visible>
          <div id='child' />
        </Sidebar>,
      )

      await user.click(container.querySelector('div#child'))

      expect(onHide).not.toHaveBeenCalled()
    })
  })

  describe('onHidden', () => {
    it('is called when the "visible" prop was changed to "false"', async () => {
      Sidebar.animationDuration = 0
      const onHidden = vi.fn()
      const { rerender } = render(<Sidebar onHidden={onHidden} visible />)
      expect(onHidden).not.toHaveBeenCalled()

      rerender(<Sidebar onHidden={onHidden} visible={false} />)

      await waitFor(() => {
        expect(onHidden).toHaveBeenCalledTimes(1)
      })
      expect(onHidden.mock.calls[0][0]).toBeNull()
      expect(onHidden.mock.calls[0][1]).toMatchObject({ visible: false })
    })
  })

  describe('onShow', () => {
    it('is called when the "visible" prop was changed to "true"', async () => {
      Sidebar.animationDuration = 0
      const onShow = vi.fn()
      const { rerender } = render(<Sidebar onShow={onShow} />)
      expect(onShow).not.toHaveBeenCalled()

      rerender(<Sidebar onShow={onShow} visible />)

      await waitFor(() => {
        expect(onShow).toHaveBeenCalledTimes(1)
      })
      expect(onShow.mock.calls[0][0]).toBeNull()
      expect(onShow.mock.calls[0][1]).toMatchObject({ visible: true })
    })
  })

  describe('onVisible', () => {
    it('is called when the "visible" prop changes to "true"', async () => {
      const onVisible = vi.fn()
      const { rerender } = render(<Sidebar onVisible={onVisible} />)
      expect(onVisible).not.toHaveBeenCalled()

      rerender(<Sidebar onVisible={onVisible} visible />)

      expect(onVisible).toHaveBeenCalledTimes(1)
      expect(onVisible.mock.calls[0][0]).toBeNull()
      expect(onVisible.mock.calls[0][1]).toMatchObject({ visible: true })
    })
  })

  describe('target', () => {
    // The EventListener is an implementation detail with no DOM presence; what
    // it does is observable, so assert that a click on the target hides.
    it('listens for clicks on the given target', async () => {
      const target = document.createElement('div')
      document.body.appendChild(target)

      const onHide = vi.fn()
      render(<Sidebar onHide={onHide} target={target} visible />)

      await user.click(target)

      expect(onHide).toHaveBeenCalledTimes(1)
      document.body.removeChild(target)
    })
  })
})
