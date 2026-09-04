import { dom } from 'test/support/rtl'
import { fireEvent } from '@testing-library/react'
import React from 'react'

import ModalActions from 'src/modules/Modal/ModalActions'
import * as common from 'test/support/commonTests'

describe('ModalActions', () => {
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

    it('renders children', () => {
      const buttons = buttonsOf(<ModalActions actions={actions} />)

      expect(buttons[0]).toHaveTextContent('Cancel')
      expect(buttons[1]).toHaveTextContent('OK')
    })

    it('passes arbitrary props', () => {
      for (const button of buttonsOf(<ModalActions actions={actions} />)) {
        expect(button).toHaveAttribute('data-foo', 'something')
      }
    })
  })

  describe('onActionClick', () => {
    const buttonsOf = (element) => [...dom(element).querySelectorAll('button')]

    it('can be omitted', () => {
      const buttons = buttonsOf(<ModalActions actions={actions} />)

      expect(() => fireEvent.click(buttons[0])).not.toThrow()
    })

    it('is called with (e, actionProps) when clicked', () => {
      const onActionClick = vi.fn()
      const onButtonClick = vi.fn()
      const action = { key: 'users', content: 'Disable', onClick: onButtonClick }

      const buttons = buttonsOf(
        <ModalActions actions={[...actions, action]} onActionClick={onActionClick} />,
      )
      fireEvent.click(buttons[buttons.length - 1])

      expect(onActionClick).toHaveBeenCalledTimes(1)
      expect(onActionClick.mock.calls[0][1]).toMatchObject({ content: 'Disable' })
      expect(onButtonClick).toHaveBeenCalledTimes(1)
      expect(onButtonClick.mock.calls[0][1]).toMatchObject({ content: 'Disable' })
    })
  })
})
