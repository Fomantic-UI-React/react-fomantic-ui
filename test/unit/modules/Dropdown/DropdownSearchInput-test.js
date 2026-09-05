import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { root } from 'test/support/rtl'
import React from 'react'

import DropdownSearchInput from 'src/modules/Dropdown/DropdownSearchInput'
import * as common from 'test/support/commonTests'

describe('DropdownSearchInput', () => {
  common.isConformant(DropdownSearchInput)
  common.forwardsRef(DropdownSearchInput, { tagName: 'input' })

  describe('aria', () => {
    it('should have aria-autocomplete', () => {
      expect(root(<DropdownSearchInput />)).toHaveAttribute('aria-autocomplete', 'list')
    })
  })

  describe('autoComplete', () => {
    it('should have autoComplete by default', () => {
      expect(root(<DropdownSearchInput />)).toHaveAttribute('autocomplete', 'off')
    })

    it('should pass a defined value', () => {
      expect(root(<DropdownSearchInput autoComplete='on' />)).toHaveAttribute('autocomplete', 'on')
    })
  })

  describe('onChange', () => {
    it('is called with (e, data) on change', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const element = root(<DropdownSearchInput onChange={onChange} />)

      // One character, one change — typing a longer value would fire once per
      // keystroke, which is what a user does but not what this asserts.
      await user.type(element, 'v')

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ target: element }),
        expect.objectContaining({ value: 'v' }),
      )
    })
  })

  describe('tabIndex', () => {
    it('is not set by default', () => {
      expect(root(<DropdownSearchInput />)).not.toHaveAttribute('tabindex')
    })

    it('can be set explicitly', () => {
      expect(root(<DropdownSearchInput tabIndex={123} />)).toHaveAttribute('tabindex', '123')
    })
  })

  describe('type', () => {
    it('should have text by default', () => {
      expect(root(<DropdownSearchInput />)).toHaveAttribute('type', 'text')
    })

    it('can be set explicitly', () => {
      expect(root(<DropdownSearchInput type='number' />)).toHaveAttribute('type', 'number')
    })
  })

  describe('value', () => {
    it('is not set by default', () => {
      expect(root(<DropdownSearchInput />)).toHaveValue('')
    })

    it('can be set explicitly', () => {
      // `onChange` keeps React from warning about a controlled input; the
      // component supplies one of its own regardless.
      const { container } = render(<DropdownSearchInput onChange={() => {}} value='word' />)

      expect(container.firstElementChild).toHaveValue('word')
    })
  })
})
