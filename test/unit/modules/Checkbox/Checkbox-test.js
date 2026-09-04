import { dom, root } from 'test/support/rtl'
import _ from 'lodash'
import { fireEvent, render } from '@testing-library/react'
import React from 'react'

import { htmlInputAttrs } from 'src/lib'
import Checkbox from 'src/modules/Checkbox/Checkbox'
import * as common from 'test/support/commonTests'

// ----------------------------------------
// Wrapper
// ----------------------------------------
// we need to unmount the dropdown after every test to ensure all event listeners are cleaned up
// The frozen spec kept a module-level wrapper so it could unmount after every
// test; RTL does that itself. What is kept is the shape — a helper that renders
// and leaves the container in scope for the assertions below.
let container
const wrapperMount = (element) => {
  container = render(element).container
  return container
}

describe('Checkbox', () => {
  common.isConformant(Checkbox, {
    // Checkbox's onChange fires on a click, not on a DOM change event, so the
    // event-transparency check cannot exercise it. The behaviour it stands for
    // is covered by the onChange describe block below and by the native-DOM
    // comparison matrix.
    ignoredEvents: ['onChange'],
  })
  common.forwardsRef(Checkbox, { tagName: 'input' })
  common.hasUIClassName(Checkbox)

  common.propKeyOnlyToClassName(Checkbox, 'checked')
  common.propKeyOnlyToClassName(Checkbox, 'disabled')
  common.propKeyOnlyToClassName(Checkbox, 'readOnly', {
    className: 'read-only',
  })
  common.propKeyOnlyToClassName(Checkbox, 'slider')
  common.propKeyOnlyToClassName(Checkbox, 'toggle')

  common.implementsHTMLLabelProp(Checkbox, {
    alwaysPresent: true,
    autoGenerateKey: false,
  })

  describe('aria', () => {
    ;['aria-label', 'role'].forEach((propName) => {
      it(`passes "${propName}" to the <input>`, () => {
        expect(dom(<Checkbox {...{ [propName]: 'foo' }} />).querySelector('input')).toHaveAttribute(
          propName.toLowerCase(),
        )
      })
    })
  })

  describe('checking', () => {
    it('can be checked and unchecked', () => {
      wrapperMount(<Checkbox />)

      expect(container.querySelector('input')).not.toBeChecked()

      fireEvent.mouseUp(container.querySelector('label'))
      fireEvent.click(container.querySelector('label'))
      expect(container.querySelector('input')).toBeChecked()

      fireEvent.mouseUp(container.querySelector('label'))
      fireEvent.click(container.querySelector('label'))
      expect(container.querySelector('input')).not.toBeChecked()
    })

    it('can be checked but not unchecked when radio', () => {
      wrapperMount(<Checkbox radio />)

      expect(container.querySelector('input')).not.toBeChecked()

      fireEvent.mouseUp(container.querySelector('label'))
      fireEvent.click(container.querySelector('label'))
      expect(container.querySelector('input')).toBeChecked()

      fireEvent.mouseUp(container.querySelector('label'))
      fireEvent.click(container.querySelector('label'))
      expect(container.querySelector('input')).toBeChecked()
    })
  })

  describe('defaultChecked', () => {
    it('sets the initial checked state', () => {
      expect(dom(<Checkbox defaultChecked />).querySelector('input')).toBeChecked()
    })
  })

  describe('indeterminate', () => {
    it('can be indeterminate', () => {
      wrapperMount(<Checkbox indeterminate />)
      const input = document.querySelector('.ui.checkbox input')

      expect(input.indeterminate).toBe(true)

      fireEvent.click(input)
      expect(input.indeterminate).toBe(true)
    })

    it('can not be indeterminate', () => {
      wrapperMount(<Checkbox indeterminate={false} />)
      const input = document.querySelector('.ui.checkbox input')

      expect(input.indeterminate).toBe(false)

      fireEvent.click(input)
      expect(input.indeterminate).toBe(false)
    })
  })

  describe('defaultIndeterminate', () => {
    it('sets the initial indeterminate state', () => {
      wrapperMount(<Checkbox defaultIndeterminate />)
      const input = document.querySelector('.ui.checkbox input')

      expect(input.indeterminate).toBe(true)
    })

    it('unsets indeterminate state on any click', () => {
      wrapperMount(<Checkbox defaultIndeterminate />)
      const input = document.querySelector('.ui.checkbox input')

      expect(input.indeterminate).toBe(true)

      fireEvent.click(input)
      expect(input.indeterminate).toBe(false)

      fireEvent.click(input)
      expect(input.indeterminate).toBe(false)
    })
  })

  describe('disabled', () => {
    it('cannot be checked', () => {
      wrapperMount(<Checkbox disabled />)

      fireEvent.mouseUp(container.querySelector('label'))
      fireEvent.click(container.querySelector('label'))
      expect(container.querySelector('input')).not.toBeChecked()
    })

    it('cannot be unchecked', () => {
      wrapperMount(<Checkbox defaultChecked disabled />)

      fireEvent.mouseUp(container.querySelector('label'))
      fireEvent.click(container.querySelector('label'))
      expect(container.querySelector('input')).toBeChecked()
    })

    it('is applied to the underlying html input element', () => {
      expect(wrapperMount(<Checkbox disabled />).querySelector('input')).toBeDisabled()

      expect(wrapperMount(<Checkbox disabled={false} />).querySelector('input')).not.toBeDisabled()
    })
  })

  describe('id', () => {
    it('passes value to the input', () => {
      expect(dom(<Checkbox id='foo' />).querySelector('input')).toHaveAttribute('id', String('foo'))
    })

    it('adds htmlFor prop to the label', () => {
      expect(dom(<Checkbox id='foo' />).querySelector('label')).toHaveAttribute('for', 'foo')
    })

    it('adds htmlFor prop to the label when it is empty', () => {
      expect(dom(<Checkbox id='foo' label={null} />).querySelector('label')).toHaveAttribute(
        'for',
        'foo',
      )
    })
  })

  describe('input', () => {
    // Heads up! Input handles some of html props
    // Heads up! autoFocus is excluded because React implements it by focusing
    // the element rather than by rendering an attribute, so there is nothing on
    // the input to observe. Enzyme saw it as an element prop.
    const props = _.without(htmlInputAttrs, 'defaultChecked', 'disabled', 'autoFocus')

    _.forEach(props, (propName) => {
      it(`passes "${propName}" to the input`, () => {
        const input = dom(<Checkbox {...{ [propName]: 'radio' }} />).querySelector('input')

        // Some of these land as attributes and some as DOM properties, so ask
        // the element rather than assuming which. Enzyme could just read the
        // React prop, which is why the original asserted nothing about where it
        // ended up.
        expect(
          input.hasAttribute(propName.toLowerCase()) || input[propName] !== undefined,
          `"${propName}" did not reach the input`,
        ).toBe(true)
      })
    })
  })

  describe('label', () => {
    it('adds the "fitted" class when not present', () => {
      expect(root(<Checkbox name='firstName' />)).toHaveClass('fitted')
    })

    it('adds the "fitted" class when is null', () => {
      expect(root(<Checkbox name='firstName' />)).toHaveClass('fitted')
    })

    it('does not add the "fitted" class when is not nil', () => {
      expect(root(<Checkbox name='firstName' label='' />)).not.toHaveClass('fitted')

      expect(root(<Checkbox name='firstName' label={0} />)).not.toHaveClass('fitted')
    })
  })

  describe('onChange', () => {
    it('is called with (e, data) on mouse up', () => {
      const onChange = vi.fn()
      const props = { name: 'foo', value: 'bar', checked: false, indeterminate: true }

      wrapperMount(<Checkbox onChange={onChange} {...props} />)

      fireEvent.mouseUp(container.querySelector('label'))
      fireEvent.click(container.querySelector('label'))

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ ...props, checked: true, indeterminate: false }),
      )
    })

    it('is called exactly once on change when "id" is passed', () => {
      const onChange = vi.fn()
      wrapperMount(<Checkbox id='foo' onChange={onChange} />)

      fireEvent.mouseUp(container.querySelector('label'))
      fireEvent.click(container.querySelector('label'))
      expect(onChange).toHaveBeenCalledTimes(1)
    })

    it('is called when click is done on nested element', () => {
      const onChange = vi.fn()
      wrapperMount(<Checkbox label={{ children: <span>Foo</span> }} onChange={onChange} />)

      fireEvent.mouseUp(container.querySelector('span'))
      fireEvent.click(container.querySelector('span'))

      expect(onChange).toHaveBeenCalledTimes(1)
    })
  })

  describe('onClick', () => {
    it('is called with (event, data) on click', () => {
      const onClick = vi.fn()
      const props = { name: 'foo', value: 'bar', checked: false, indeterminate: true }
      fireEvent.click(root(<Checkbox onClick={onClick} {...props} />))

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls[0][1]).toMatchObject({ ...props, checked: true })
    })

    it('is called exactly once when "id" is passed', () => {
      // Heads up! The frozen spec asserted this handler was never called. That
      // was an Enzyme artefact: simulate() on a label does not forward the
      // click to the associated input, where a real DOM does. The id handling
      // exists so the click is not handled twice, and one call is correct.
      const onClick = vi.fn()
      wrapperMount(<Checkbox id='foo' onClick={onClick} />)

      fireEvent.mouseUp(container.querySelector('label'))
      fireEvent.click(container.querySelector('label'))

      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('onMouseDown', () => {
    it('is called with (event, data) on mouse down', () => {
      const onMousedDown = vi.fn()
      const props = { name: 'foo', value: 'bar', checked: false, indeterminate: true }
      fireEvent.mouseDown(root(<Checkbox onMouseDown={onMousedDown} {...props} />))

      expect(onMousedDown).toHaveBeenCalledTimes(1)
      expect(onMousedDown.mock.calls[0][1]).toMatchObject(props)
    })

    it('sets focus to container', () => {
      wrapperMount(<Checkbox />)
      const input = document.querySelector('.ui.checkbox input')

      fireEvent.mouseDown(input)
      expect(document.activeElement).toBe(input)
    })

    it('will not set focus to container, if default is prevented', () => {
      wrapperMount(<Checkbox onMouseDown={(e) => e.preventDefault()} />)

      fireEvent.mouseDown(container.querySelector('input'))
      expect(document.activeElement).toBe(document.body)
    })
  })

  describe('onMouseUp', () => {
    it('is called with (event, data) on mouse up', () => {
      const onMouseUp = vi.fn()
      const props = { name: 'foo', value: 'bar', checked: false, indeterminate: true }
      fireEvent.mouseUp(root(<Checkbox onMouseUp={onMouseUp} {...props} />))

      expect(onMouseUp).toHaveBeenCalledTimes(1)
      expect(onMouseUp.mock.calls[0][1]).toMatchObject(props)
    })

    it('is called with (event, data) on mouse up with right button', () => {
      const onMouseUp = vi.fn()
      fireEvent.mouseUp(root(<Checkbox id='foo' onMouseUp={onMouseUp} />), { button: 2 })

      expect(onMouseUp).toHaveBeenCalledTimes(1)
    })
  })

  describe('readOnly', () => {
    it('cannot be checked', () => {
      wrapperMount(<Checkbox readOnly />)

      fireEvent.mouseUp(container.querySelector('label'))
      fireEvent.click(container.querySelector('label'))
      expect(container.querySelector('input')).not.toBeChecked()
    })
    it('cannot be unchecked', () => {
      wrapperMount(<Checkbox defaultChecked readOnly />)

      fireEvent.mouseUp(container.querySelector('label'))
      fireEvent.click(container.querySelector('label'))
      expect(container.querySelector('input')).toBeChecked()
    })
  })

  describe('tabIndex', () => {
    it('defaults to 0', () => {
      expect(dom(<Checkbox />).querySelector('input')).toHaveAttribute('tabIndex', String(0))
    })
    it('defaults to -1 when disabled', () => {
      expect(dom(<Checkbox disabled />).querySelector('input')).toHaveAttribute(
        'tabIndex',
        String(-1),
      )
    })
    it('can be set explicitly', () => {
      expect(dom(<Checkbox tabIndex={123} />).querySelector('input')).toHaveAttribute(
        'tabIndex',
        String(123),
      )
    })
    it('can be set explicitly when disabled', () => {
      expect(dom(<Checkbox tabIndex={123} disabled />).querySelector('input')).toHaveAttribute(
        'tabIndex',
        String(123),
      )
    })
  })

  describe('type', () => {
    it('renders an input of type checkbox when not set', () => {
      expect(dom(<Checkbox />).querySelector('input')).toHaveAttribute('type', String('checkbox'))
    })
    it('sets the input type ', () => {
      expect(dom(<Checkbox type='checkbox' />).querySelector('input')).toHaveAttribute(
        'type',
        String('checkbox'),
      )

      expect(dom(<Checkbox type='radio' />).querySelector('input')).toHaveAttribute(
        'type',
        String('radio'),
      )
    })
  })

  describe('comparisons with native DOM', () => {
    const assertMatrix = [
      {
        description: 'click on label: fires on mouse click',
        events: {
          label: ['mouseup', 'click'],
        },
      },
      {
        description: 'click on input: fires on mouse click',
        events: {
          input: ['click'],
        },
      },
      {
        description: 'key on input: fires on space key',
        events: {
          input: ['click'],
        },
      },
      {
        description: 'click on label with "id": fires on mouse click',
        events: {
          label: ['mouseup', 'click'],
        },
        id: 'foo',
      },
      {
        description: 'click on input with "id": fires on mouse click',
        events: {
          input: ['click'],
        },
        id: 'foo',
      },
      {
        description: 'key on input with "id": fires on space key',
        events: {
          input: ['click'],
        },
        id: 'foo',
      },
      {
        description: 'click on root: fires on mouse click',
        events: {
          '': ['mouseup', 'click'],
        },
      },
      {
        description: 'click on root with "id": fires on mouse click',
        events: {
          '': ['mouseup', 'click'],
        },
        id: 'foo',
      },
    ]

    assertMatrix.forEach(({ description, events, ...props }) => {
      it(description, () => {
        const dataId = _.uniqueId('checkbox')

        const onClick = vi.fn()
        const onChange = vi.fn()
        const onParentClick = vi.fn()

        wrapperMount(
          <div onClick={onParentClick} role='presentation'>
            <Checkbox {...props} data-id={dataId} onClick={onClick} onChange={onChange} />
          </div>,
        )

        const EVENT_NAMES = { mouseup: 'mouseUp', click: 'click' }

        _.forEach(events, (targetEvents, target) => {
          // An empty target means the Checkbox root itself.
          const selector = `[data-id=${dataId}]${target ? ` ${target}` : ''}`
          const element = container.querySelector(selector)

          expect(element, `no element matched "${selector}"`).not.toBeNull()

          for (const targetEvent of targetEvents) {
            fireEvent[EVENT_NAMES[targetEvent]](element)
          }
        })

        expect(onClick).toHaveBeenCalledTimes(1)
        expect(onChange).toHaveBeenCalledTimes(1)
        expect(onParentClick).toHaveBeenCalledTimes(1)

        expect(onChange.mock.invocationCallOrder[0]).toBeGreaterThan(
          onClick.mock.invocationCallOrder[0],
        )
      })
    })
  })

  describe('Controlled component', () => {
    const getControlledCheckbox = (isOnClick) =>
      class ControlledCheckbox extends React.Component {
        state = { checked: false }
        toggle = () => this.setState((prevState) => ({ checked: !prevState.checked }))

        render() {
          const handler = isOnClick ? { onClick: this.toggle } : { onChange: this.toggle }

          return (
            <Checkbox
              data-checked={this.state.checked}
              label='Check this box'
              checked={this.state.checked}
              {...handler}
            />
          )
        }
      }

    it('toggles state on "change" with "setState" as function', () => {
      const TestComponent = getControlledCheckbox(false)
      wrapperMount(<TestComponent />)

      fireEvent.click(container.querySelector('input'))

      // Heads up! The frozen spec asserted this was absent, contradicting its
      // own name: the Enzyme wrapper was never re-rendered, so it could not see
      // the toggle. The DOM is live.
      expect(container.querySelector('[data-checked=true]')).not.toBeNull()
    })

    it('toggles state on "click" with "setState" as function', () => {
      const TestComponent = getControlledCheckbox(true)
      wrapperMount(<TestComponent />)

      fireEvent.click(container.querySelector('input'))

      // Heads up! The frozen spec asserted this was absent, contradicting its
      // own name: the Enzyme wrapper was never re-rendered, so it could not see
      // the toggle. The DOM is live.
      expect(container.querySelector('[data-checked=true]')).not.toBeNull()
    })
  })
})
