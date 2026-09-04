import { dom, root } from 'test/support/rtl'
import React from 'react'

import Radio from 'src/addons/Radio/Radio'
import FormField from 'src/collections/Form/FormField'
import { SUI } from 'src/lib'
import Button from 'src/elements/Button/Button'
import Checkbox from 'src/modules/Checkbox/Checkbox'
import * as common from 'test/support/commonTests'

describe('FormField', () => {
  common.isConformant(FormField)
  common.rendersChildren(FormField)

  // No Control
  common.forwardsRef(FormField)
  common.forwardsRef(FormField, {
    tagName: 'div',
    requiredProps: {
      children: <input />,
    },
  })

  // HTML Checkbox/Radio Control
  common.forwardsRef(FormField, {
    tagName: 'input',
    requiredProps: { control: 'input', type: 'radio' },
  })
  common.forwardsRef(FormField, {
    tagName: 'input',
    requiredProps: { control: 'input', type: 'checkbox' },
  })

  // Checkbox/Radio Control
  common.forwardsRef(FormField, {
    tagName: 'input',
    requiredProps: { control: Checkbox },
  })
  common.forwardsRef(FormField, {
    tagName: 'input',
    requiredProps: { control: Radio },
  })

  // Other Control
  common.forwardsRef(FormField, {
    tagName: 'input',
    requiredProps: { control: 'input' },
  })

  common.implementsHTMLLabelProp(FormField, { autoGenerateKey: false })
  common.implementsWidthProp(FormField, SUI.WIDTHS, {
    canEqual: false,
    propKey: 'width',
  })

  common.propKeyOnlyToClassName(FormField, 'disabled')
  common.propKeyOnlyToClassName(FormField, 'error')
  common.propKeyOnlyToClassName(FormField, 'inline')
  common.propKeyOnlyToClassName(FormField, 'required', {
    requiredProps: { label: '' },
  })

  describe('control', () => {
    it('adds an HTML element child of the same type', () => {
      for (const control of ['button', 'input', 'select', 'textarea']) {
        expect(dom(<FormField control={control} />).querySelector(control)).not.toBeNull()
      }
    })
  })

  describe('error', () => {
    common.implementsLabelProp(FormField, {
      autoGenerateKey: false,
      propKey: 'error',
      requiredProps: { label: 'word' },
      shorthandDefaultProps: {
        prompt: true,
        pointing: 'above',
        role: 'alert',
        'aria-atomic': true,
      },
    })
    common.implementsLabelProp(FormField, {
      autoGenerateKey: false,
      propKey: 'error',
      requiredProps: { control: 'radio' },
      shorthandDefaultProps: {
        prompt: true,
        pointing: 'above',
        role: 'alert',
        'aria-atomic': true,
      },
    })
    common.implementsLabelProp(FormField, {
      autoGenerateKey: false,
      propKey: 'error',
      requiredProps: { control: Checkbox },
      shorthandDefaultProps: {
        prompt: true,
        pointing: 'above',
        role: 'alert',
        'aria-atomic': true,
      },
    })
    common.implementsLabelProp(FormField, {
      autoGenerateKey: false,
      propKey: 'error',
      requiredProps: { control: 'input' },
      shorthandDefaultProps: {
        prompt: true,
        pointing: 'above',
        role: 'alert',
        'aria-atomic': true,
      },
    })

    // Enzyme compared child types; the DOM equivalent is the order of the
    // field's element children.
    it('positioned in DOM according to passed "pointing" prop', () => {
      const cases = [
        { pointing: 'below', inDom: 'before' },
        { pointing: 'right', inDom: 'before' },
        { pointing: 'left', inDom: 'after' },
        { pointing: 'above', inDom: 'after' },
      ]

      for (const { pointing, inDom } of cases) {
        const children = [
          ...dom(
            <FormField control='input' error={{ content: 'the error', pointing }} type='text' />,
          ).firstElementChild.children,
        ]
        const labelIndex = inDom === 'before' ? 0 : 1

        expect(children[labelIndex]).toHaveClass('label')
        expect(children[labelIndex === 0 ? 1 : 0]).toHaveTagName('input')
      }
    })
  })

  describe('label', () => {
    const text = 'the label text'

    for (const type of ['checkbox', 'radio']) {
      it(`wraps html ${type} inputs`, () => {
        const label = dom(<FormField control='input' label={text} type={type} />).querySelector(
          'label',
        )

        expect(label.firstElementChild).toHaveTagName('input')
        expect(label).toHaveTextContent(text)
      })
    }

    it('is passed to Checkbox controls', () => {
      const container = dom(<FormField control={Checkbox} label={text} />)

      expect(container.querySelector('.ui.checkbox label')).toHaveTextContent(text)
    })

    it('is passed to Radio controls', () => {
      const container = dom(<FormField control={Radio} label={text} />)

      expect(container.querySelector('.ui.radio.checkbox label')).toHaveTextContent(text)
    })

    it('is sibling to text inputs', () => {
      const children = [
        ...dom(<FormField control='input' label={text} type='text' />).firstElementChild.children,
      ]

      expect(children[0]).toHaveTagName('label')
      expect(children[0]).toHaveTextContent(text)
      expect(children[1]).toHaveTagName('input')
    })
  })

  describe('disabled', () => {
    it('is not set by default', () => {
      const inputs = dom(<FormField control='input' />).querySelectorAll('input')

      expect(inputs).toHaveLength(1)
      expect(inputs[0]).not.toBeDisabled()
    })

    it('is passed to the control', () => {
      const inputs = dom(<FormField control='input' disabled />).querySelectorAll('input')

      expect(inputs).toHaveLength(1)
      expect(inputs[0]).toBeDisabled()
    })
  })

  describe('required', () => {
    it('is not set by default', () => {
      const inputs = dom(<FormField control='input' />).querySelectorAll('input')

      expect(inputs).toHaveLength(1)
      expect(inputs[0]).not.toBeRequired()
    })

    it('is passed to the control', () => {
      const inputs = dom(<FormField control='input' required />).querySelectorAll('input')

      expect(inputs).toHaveLength(1)
      expect(inputs[0]).toBeRequired()
    })
  })

  describe('content', () => {
    it('is not set by default', () => {
      const buttons = dom(<FormField control={Button} />).querySelectorAll('button')

      expect(buttons).toHaveLength(1)
      expect(buttons[0]).toHaveTextContent('')
    })

    it('is passed to the control', () => {
      const buttons = dom(<FormField control={Button} content='Click Me' />).querySelectorAll(
        'button',
      )

      expect(buttons).toHaveLength(1)
      expect(buttons[0]).toHaveTextContent('Click Me')
    })
  })

  describe('id', () => {
    it('is set when content is provided', () => {
      expect(root(<FormField content='content' id='testId' />)).toHaveAttribute('id', 'testId')
    })

    it('is set when have child elements', () => {
      const field = root(
        <FormField id='testId'>
          <input />
        </FormField>,
      )

      expect(field).toHaveAttribute('id', 'testId')
    })
  })

  describe('aria-invalid', () => {
    it('is not set by default', () => {
      expect(dom(<FormField control='input' />).querySelector('input')).not.toHaveAttribute(
        'aria-invalid',
      )
    })

    it('is not set when error is false', () => {
      expect(
        dom(<FormField control='input' error={false} />).querySelector('input'),
      ).not.toHaveAttribute('aria-invalid')
    })

    it('is set when error is true', () => {
      expect(dom(<FormField control='input' error />).querySelector('input')).toHaveAttribute(
        'aria-invalid',
        'true',
      )
    })

    it('is set when an error object is provided', () => {
      const container = dom(
        <FormField control='input' error={{ content: 'Error message', pointing: 'left' }} />,
      )

      expect(container.querySelector('input')).toHaveAttribute('aria-invalid', 'true')
    })
  })
})
