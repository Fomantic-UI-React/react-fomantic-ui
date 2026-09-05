import { root } from 'test/support/rtl'
import _ from 'lodash'

import userEvent from '@testing-library/user-event'
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
  // Interactions go through user-event, which sends the pointer, focus and
  // keyboard sequence a browser does rather than the single event `fireEvent`
  // dispatches.
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

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
    it('is not set by default', async () => {
      expect(root(<Form />)).not.toHaveAttribute('action')
    })

    it('applied when defined', async () => {
      const action = 'https://example.com'

      expect(root(<Form action={action} />)).toHaveAttribute('action', action)
    })
  })

  describe('onSubmit', () => {
    // A user submits a form by activating a submit button inside it. The event
    // is kept and read once every handler has run — reading `defaultPrevented`
    // inside the listener would be too early, because a listener on the form
    // runs before React's handler on the container.
    const submit = async (element) => {
      const form = root(React.cloneElement(element, null, <button type='submit'>submit</button>))
      let event = null

      form.addEventListener('submit', (e) => {
        event = e
      })
      await user.click(form.querySelector('button'))

      return event
    }

    it('prevents default on the event when there is no action', async () => {
      // Heads up! Invalid values are passed on purpose here.
      consoleUtil.disableOnce()

      expect((await submit(<Form />)).defaultPrevented).toBe(true)
      expect((await submit(<Form action={false} />)).defaultPrevented).toBe(true)
      expect((await submit(<Form action={null} />)).defaultPrevented).toBe(true)
    })

    it('does not prevent default on the event when there is an action', async () => {
      expect((await submit(<Form action='do not prevent default!' />)).defaultPrevented).toBe(false)
      expect((await submit(<Form action='' />)).defaultPrevented).toBe(false)
    })

    it('is called with (e, props) on submit', async () => {
      const onSubmit = vi.fn()
      const props = { 'data-bar': 'baz' }

      await submit(<Form {...props} onSubmit={onSubmit} />)

      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(onSubmit.mock.calls[0][0]).toMatchObject({ type: 'submit' })
      expect(onSubmit.mock.calls[0][1]).toMatchObject(props)
    })
  })
})
