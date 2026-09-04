import { dom } from 'test/support/rtl'
import { fireEvent } from '@testing-library/react'
import React from 'react'

import Input from 'src/elements/Input/Input'
import { htmlInputProps } from 'src/lib'
import * as common from 'test/support/commonTests'
import { dispatchableListeners, fireEventInit, fireEventName } from 'test/support/syntheticEvent'

describe('Input', () => {
  common.isConformant(Input, {
    eventTargets: {
      // keyboard
      onKeyDown: 'input',
      onKeyPress: 'input',
      onKeyUp: 'input',

      // focus
      onFocus: 'input',
      onBlur: 'input',

      // form
      onChange: 'input',
      onInput: 'input',

      // mouse
      onClick: 'input',
      onContextMenu: 'input',
      onDrag: 'input',
      onDragEnd: 'input',
      onDragEnter: 'input',
      onDragExit: 'input',
      onDragLeave: 'input',
      onDragOver: 'input',
      onDragStart: 'input',
      onDrop: 'input',
      onMouseDown: 'input',
      onMouseEnter: 'input',
      onMouseLeave: 'input',
      onMouseMove: 'input',
      onMouseOut: 'input',
      onMouseOver: 'input',
      onMouseUp: 'input',

      // selection
      onSelect: 'input',

      // touch
      onTouchCancel: 'input',
      onTouchEnd: 'input',
      onTouchMove: 'input',
      onTouchStart: 'input',
    },
  })
  common.forwardsRef(Input, { tagName: 'input' })
  common.hasUIClassName(Input)
  common.rendersChildren(Input, {
    rendersContent: false,
  })

  common.implementsButtonProp(Input, {
    autoGenerateKey: false,
    propKey: 'action',
  })
  common.implementsCreateMethod(Input)
  common.implementsIconProp(Input, { autoGenerateKey: false })
  common.implementsLabelProp(Input, {
    autoGenerateKey: false,
    shorthandDefaultProps: { className: 'label' },
  })
  common.implementsHTMLInputProp(Input, {
    alwaysPresent: true,
    assertExactMatch: false,
    autoGenerateKey: false,
    shorthandDefaultProps: { type: 'text' },
  })

  common.propKeyAndValueToClassName(Input, 'actionPosition', ['left'], { className: 'action' })
  common.propKeyAndValueToClassName(Input, 'iconPosition', ['left'], { className: 'icon' })
  common.propKeyAndValueToClassName(
    Input,
    'labelPosition',
    ['left', 'right', 'left corner', 'right corner'],
    {
      className: 'labeled',
    },
  )

  common.propKeyOnlyToClassName(Input, 'action')
  common.propKeyOnlyToClassName(Input, 'disabled')
  common.propKeyOnlyToClassName(Input, 'error')
  common.propKeyOnlyToClassName(Input, 'fluid')
  common.propKeyOnlyToClassName(Input, 'focus')
  common.propKeyOnlyToClassName(Input, 'inverted')
  common.propKeyOnlyToClassName(Input, 'label', { className: 'labeled' })
  common.propKeyOnlyToClassName(Input, 'loading')
  common.propKeyOnlyToClassName(Input, 'loading', { className: 'icon' })
  common.propKeyOnlyToClassName(Input, 'transparent')
  common.propKeyOnlyToClassName(Input, 'icon')

  common.propValueOnlyToClassName(Input, 'size', [
    'mini',
    'small',
    'large',
    'big',
    'huge',
    'massive',
  ])

  it('renders with conditional children', () => {
    const container = dom(
      <Input>
        {true && <span />}
        {false && <div />}
      </Input>,
    )

    expect(container.querySelector('span')).not.toBeNull()
    expect(container.querySelector('div:not(.input)')).toBeNull()
  })

  it('renders a text <input> by default', () => {
    expect(dom(<Input />).querySelector('input')).toHaveAttribute('type', 'text')
  })

  describe('input props', () => {
    // Enzyme could read a handler prop straight off the element. RTL cannot, so
    // handlers are asserted by dispatching the event they listen for; value
    // props are asserted where they actually land, on the <input>.
    const handlers = htmlInputProps.filter(
      (name) => name.startsWith('on') && dispatchableListeners.includes(name),
    )
    const booleans = [
      'selected',
      'defaultChecked',
      'checked',
      'disabled',
      'multiple',
      'readOnly',
      'required',
      'autoFocus',
    ]
    const values = htmlInputProps.filter(
      (name) => !name.startsWith('on') && !booleans.includes(name),
    )

    for (const propName of handlers) {
      it(`passes \`${propName}\` to the <input>`, () => {
        const spy = vi.fn()
        const input = dom(<Input {...{ [propName]: spy }} />).querySelector('input')

        fireEvent[fireEventName(propName)](input, fireEventInit(propName))

        expect(spy).toHaveBeenCalled()
      })

      it(`passes \`${propName}\` to the <input> when using children`, () => {
        const spy = vi.fn()
        const container = dom(
          <Input {...{ [propName]: spy }}>
            <input />
          </Input>,
        )

        fireEvent[fireEventName(propName)](
          container.querySelector('input'),
          fireEventInit(propName),
        )

        expect(spy).toHaveBeenCalled()
      })
    }

    // React writes defaultValue out as the `value` attribute.
    const attributeFor = (propName) =>
      propName === 'defaultValue' ? 'value' : propName.toLowerCase()

    for (const propName of values) {
      it(`passes \`${propName}\` to the <input>`, () => {
        const input = dom(<Input {...{ [propName]: 'foo' }} />).querySelector('input')

        expect(input).toHaveAttribute(attributeFor(propName), 'foo')
      })

      it(`passes \`${propName}\` to the <input> when using children`, () => {
        const container = dom(
          <Input {...{ [propName]: 'foo' }}>
            <input />
          </Input>,
        )

        expect(container.querySelector('input')).toHaveAttribute(attributeFor(propName), 'foo')
      })
    }
  })

  describe('loading', () => {
    it("don't add icon if it's defined", () => {
      expect(dom(<Input icon='user' loading />).querySelector('i.icon')).toHaveClass('user')
    })

    it('add icon if it is not defined', () => {
      expect(dom(<Input loading />).querySelector('i.icon')).toHaveClass('spinner')
    })
  })

  describe('onChange', () => {
    it('is called with (e, data) on change', () => {
      const onChange = vi.fn()
      const props = { 'data-foo': 'bar', onChange }

      const input = dom(<Input {...props} />).querySelector('input')
      fireEvent.change(input, { target: { value: 'name' } })

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange.mock.calls[0][1]).toMatchObject({ ...props, value: 'name' })
    })

    it('is called with (e, data) on change when using children', () => {
      const onChange = vi.fn()
      const props = { 'data-foo': 'bar', onChange }

      const container = dom(
        <Input {...props}>
          <input />
        </Input>,
      )
      fireEvent.change(container.querySelector('input'), { target: { value: 'name' } })

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange.mock.calls[0][1]).toMatchObject({ ...props, value: 'name' })
    })
  })

  describe('ref', () => {
    it('"focus" can be set via a ref', () => {
      const inputRef = React.createRef()
      const container = dom(<Input ref={inputRef} />)

      inputRef.current.focus()

      expect(document.activeElement).toBe(container.querySelector('input'))
    })

    it('"select" can be set via a ref', () => {
      const inputRef = React.createRef()
      const value = 'expect this text to be selected'
      const container = dom(<Input ref={inputRef} value={value} onChange={vi.fn()} />)

      inputRef.current.select()

      // Input selection is not part of window.getSelection(); the observable
      // effect is the selection range on the element itself.
      const input = container.querySelector('input')
      expect(input.selectionStart).toBe(0)
      expect(input.selectionEnd).toBe(value.length)
    })

    it('maintains ref on child node', () => {
      const elementRef = vi.fn()
      const inputRef = vi.fn()

      const container = dom(
        <Input ref={inputRef}>
          <input ref={elementRef} />
        </Input>,
      )
      const input = container.querySelector('input')

      expect(elementRef).toHaveBeenCalledTimes(1)
      expect(elementRef).toHaveBeenCalledWith(input)
      expect(inputRef).toHaveBeenCalledWith(input)
    })
  })

  describe('disabled', () => {
    it('is applied to the underlying <input>', () => {
      expect(dom(<Input disabled />).querySelector('input')).toBeDisabled()
    })

    it('is not applied when false', () => {
      expect(dom(<Input disabled={false} />).querySelector('input')).not.toBeDisabled()
    })
  })

  describe('tabIndex', () => {
    it('is not set by default', () => {
      expect(dom(<Input />).querySelector('input')).not.toHaveAttribute('tabindex')
    })

    it('defaults to -1 when disabled', () => {
      expect(dom(<Input disabled />).querySelector('input')).toHaveAttribute('tabindex', '-1')
    })

    it('can be set explicitly', () => {
      expect(dom(<Input tabIndex={123} />).querySelector('input')).toHaveAttribute(
        'tabindex',
        '123',
      )
    })

    it('can be set explicitly when disabled', () => {
      expect(dom(<Input tabIndex={123} disabled />).querySelector('input')).toHaveAttribute(
        'tabindex',
        '123',
      )
    })
  })

  describe('icon', () => {
    // Enzyme asserted the Icon's index among the rendered children; the DOM
    // equivalent is its position among the wrapper's element children.
    const iconIndex = (element) => {
      const children = [...dom(element).firstElementChild.children]

      return children.findIndex((child) => child.matches('i.icon'))
    }

    it('is last child by default', () => {
      expect(iconIndex(<Input icon='search' />)).toBe(1)
    })

    it('is last child with an action on the left', () => {
      expect(iconIndex(<Input icon='search' action='foo' actionPosition='left' />)).toBe(2)
    })

    it('is last child with a label', () => {
      expect(iconIndex(<Input icon='search' label='foo' />)).toBe(2)
    })

    it('follows the input when positioned left with an action', () => {
      expect(iconIndex(<Input icon='search' iconPosition='left' action='foo' />)).toBe(1)
    })

    it('follows the input when positioned left with a label', () => {
      expect(
        iconIndex(<Input icon='search' iconPosition='left' label='foo' labelPosition='right' />),
      ).toBe(1)
    })
  })
})
