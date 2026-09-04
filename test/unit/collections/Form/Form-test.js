import { root } from 'test/support/rtl'
import _ from 'lodash'
import { fireEvent } from '@testing-library/react'
import React from 'react'

import Form from 'src/collections/Form/Form'
import FormButton from 'src/collections/Form/FormButton'
import FormCheckbox from 'src/collections/Form/FormCheckbox'
import FormDropdown from 'src/collections/Form/FormDropdown'
import FormField from 'src/collections/Form/FormField'
import FormGroup from 'src/collections/Form/FormGroup'
import FormInput from 'src/collections/Form/FormInput'
import FormRadio from 'src/collections/Form/FormRadio'
import FormSelect from 'src/collections/Form/FormSelect'
import FormTextArea from 'src/collections/Form/FormTextArea'
import { SUI } from 'src/lib'
import * as common from 'test/support/commonTests'
import { consoleUtil } from 'test/support'

describe('Form', () => {
  common.isConformant(Form)
  common.hasSubcomponents(Form, [
    FormButton,
    FormCheckbox,
    FormDropdown,
    FormField,
    FormTextArea,
    FormGroup,
    FormInput,
    FormRadio,
    FormSelect,
  ])
  common.hasUIClassName(Form)
  common.rendersChildren(Form, {
    rendersContent: false,
  })

  common.forwardsRef(Form, {
    tagName: 'form',
    requiredProps: { children: <input /> },
  })
  common.implementsWidthProp(Form, [], {
    propKey: 'widths',
  })

  common.propKeyOnlyToClassName(Form, 'error')
  common.propKeyOnlyToClassName(Form, 'inverted')
  common.propKeyOnlyToClassName(Form, 'loading')
  common.propKeyOnlyToClassName(Form, 'reply')
  common.propKeyOnlyToClassName(Form, 'success')
  common.propKeyOnlyToClassName(Form, 'unstackable')
  common.propKeyOnlyToClassName(Form, 'warning')

  common.propValueOnlyToClassName(Form, 'size', _.without(SUI.SIZES, 'medium'))

  describe('action', () => {
    it('is not set by default', () => {
      expect(root(<Form />)).not.toHaveAttribute('action')
    })

    it('applied when defined', () => {
      const action = 'https://example.com'

      expect(root(<Form action={action} />)).toHaveAttribute('action', action)
    })
  })

  describe('onSubmit', () => {
    // fireEvent.submit dispatches a real cancelable event, so "prevented
    // default" is read off the event afterwards rather than from a spy.
    const submit = (element) => {
      const event = new Event('submit', { bubbles: true, cancelable: true })
      fireEvent(root(element), event)

      return event
    }

    it('prevents default on the event when there is no action', () => {
      // Heads up! Invalid values are passed on purpose here.
      consoleUtil.disableOnce()

      expect(submit(<Form />).defaultPrevented).toBe(true)
      expect(submit(<Form action={false} />).defaultPrevented).toBe(true)
      expect(submit(<Form action={null} />).defaultPrevented).toBe(true)
    })

    it('does not prevent default on the event when there is an action', () => {
      expect(submit(<Form action='do not prevent default!' />).defaultPrevented).toBe(false)
      expect(submit(<Form action='' />).defaultPrevented).toBe(false)
    })

    it('is called with (e, props) on submit', () => {
      const onSubmit = vi.fn()
      const props = { 'data-bar': 'baz' }

      submit(<Form {...props} onSubmit={onSubmit} />)

      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(onSubmit.mock.calls[0][0]).toMatchObject({ type: 'submit' })
      expect(onSubmit.mock.calls[0][1]).toMatchObject(props)
    })
  })
})
