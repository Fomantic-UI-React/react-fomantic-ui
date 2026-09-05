import { dom } from 'test/support/rtl'

import userEvent from '@testing-library/user-event'
import React from 'react'

import ModalActions from 'src/modules/Modal/ModalActions'
import * as common from 'test/support/commonTests'

describe('ModalActions', () => {
  // Interactions go through user-event, which sends the pointer, focus and
  // keyboard sequence a browser does rather than the single event `fireEvent`
  // dispatches.
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  common.isConformant(ModalActions)
  common.forwardsRef(ModalActions)
  common.forwardsRef(ModalActions, { requiredProps: { children: <span /> } })
  common.rendersChildren(ModalActions)

  common.implementsCreateMethod(ModalActions)

  const actions = [
    { key: 'cancel', content: 'Cancel', 'data-foo': 'something' },
    { key: 'ok', content: 'OK', 'data-foo': 'something' },
  ]

  describe('actions', () => {
    // Heads up! The frozen spec mounted once outside its tests and shared the
    // result. Each test renders its own now.
    const buttonsOf = (element) => [...dom(element).querySelectorAll('button')]

    it('renders children', async () => {
      const buttons = buttonsOf(<ModalActions actions={actions} />)

      expect(buttons[0]).toHaveTextContent('Cancel')
      expect(buttons[1]).toHaveTextContent('OK')
    })

    it('passes arbitrary props', async () => {
      for (const button of buttonsOf(<ModalActions actions={actions} />)) {
        expect(button).toHaveAttribute('data-foo', 'something')
      }
    })
  })

  describe('onActionClick', () => {
    const buttonsOf = (element) => [...dom(element).querySelectorAll('button')]

    it('can be omitted', async () => {
      const buttons = buttonsOf(<ModalActions actions={actions} />)

      // No handler to invoke — clicking must simply not throw.
      await user.click(buttons[0])
    })

    it('is called with (e, actionProps) when clicked', async () => {
      const onActionClick = vi.fn()
      const onButtonClick = vi.fn()
      const action = { key: 'users', content: 'Disable', onClick: onButtonClick }

      const buttons = buttonsOf(
        <ModalActions actions={[...actions, action]} onActionClick={onActionClick} />,
      )
      await user.click(buttons[buttons.length - 1])

      expect(onActionClick).toHaveBeenCalledTimes(1)
      expect(onActionClick.mock.calls[0][1]).toMatchObject({ content: 'Disable' })
      expect(onButtonClick).toHaveBeenCalledTimes(1)
      expect(onButtonClick.mock.calls[0][1]).toMatchObject({ content: 'Disable' })
    })
  })
})
