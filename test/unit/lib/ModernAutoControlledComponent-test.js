/* eslint-disable no-console */
import _ from 'lodash'
import { act, render } from '@testing-library/react'
import React from 'react'

import { ModernAutoControlledComponent as AutoControlledComponent } from 'src/lib'
import { consoleUtil } from 'test/support'

let TestClass

/* eslint-disable */
const createTestClass = (options = {}) =>
  class Test extends AutoControlledComponent {
    static autoControlledProps = options.autoControlledProps
    static defaultProps = options.defaultProps
    getInitialAutoControlledState() {
      return options.state
    }
    render = () => <div />
  }
/* eslint-enable */

/**
 * Renders the fixture and exposes the instance the way Enzyme's wrapper did.
 * The component under test is the base class, so reading its state directly is
 * the assertion, not an implementation detail leaking into the test.
 */
const renderTest = (element) => {
  const ref = React.createRef()
  const { rerender } = render(React.cloneElement(element, { ref }))

  return {
    get state() {
      return ref.current.state
    },
    setState(partial) {
      act(() => {
        ref.current.setState(partial)
      })
    },
    setProps(props) {
      act(() => {
        rerender(React.cloneElement(element, { ...props, ref }))
      })
    },
  }
}

const toDefaultName = (prop) => `default${prop.slice(0, 1).toUpperCase() + prop.slice(1)}`

const makeProps = () => ({
  computer: 'hardware',
  flux: 'capacitor',
  ion: 'belt',
})

const makeDefaultProps = (props) =>
  _.transform(props, (res, val, key) => {
    res[toDefaultName(key)] = val
  })

describe('extending AutoControlledComponent', () => {
  beforeEach(() => {
    TestClass = createTestClass({ autoControlledProps: [], state: {} })
  })

  it('does not throw with a `null` state', () => {
    TestClass = createTestClass({ autoControlledProps: [], state: null })
    renderTest(<TestClass />)
  })

  it('getAutoControlledStateFromProps', () => {
    consoleUtil.disableOnce()

    TestClass = createTestClass({
      autoControlledProps: ['open'],
      defaultProps: ['defaultOpen'],
      state: { open: false, value: 'initial' },
    })
    TestClass.getAutoControlledStateFromProps = (props, state) => {
      return {
        openProp: props.open,
        openState: state.open,
        modifiedValue: `${state.value} + auto`,
      }
    }
    const wrapper = renderTest(<TestClass open />)

    expect(wrapper.state).toHaveProperty('open', true)
    expect(wrapper.state).toHaveProperty('openProp', true)

    // will be "true" because logic of ACC was executed before
    expect(wrapper.state).toHaveProperty('openState', true)

    // "getAutoControlledStateFromProps" has access to whole state
    expect(wrapper.state).toHaveProperty('modifiedValue', 'initial + auto')
    // original "value" will be kept
    expect(wrapper.state).toHaveProperty('value', 'initial')
  })

  describe('setState', () => {
    it('sets state for autoControlledProps', () => {
      consoleUtil.disableOnce()

      const autoControlledProps = _.keys(makeProps())
      const randomProp = _.sample(autoControlledProps)
      const randomValue = 'verb'

      TestClass = createTestClass({ autoControlledProps })
      const wrapper = renderTest(<TestClass />)

      wrapper.setState({ [randomProp]: randomValue })
      expect(wrapper.state).toHaveProperty(randomProp, randomValue)
    })

    it('does not set state for props defined by the parent', () => {
      consoleUtil.disableOnce()

      const props = makeProps()
      const autoControlledProps = _.keys(props)

      const randomProp = _.sample(autoControlledProps)
      const randomValue = 'faker phrase text'

      TestClass = createTestClass({ autoControlledProps, state: {} })
      const wrapper = renderTest(<TestClass {...props} />)

      wrapper.setState({ [randomProp]: randomValue })

      // not updated
      expect(wrapper.state).not.toHaveProperty(randomProp, randomValue)

      // is original value
      expect(wrapper.state).toHaveProperty(randomProp, props[randomProp])
    })

    it('sets state for props passed as undefined by the parent', () => {
      consoleUtil.disableOnce()

      const props = makeProps()
      const autoControlledProps = _.keys(props)

      const randomProp = _.sample(autoControlledProps)
      const randomValue = 'faker phrase text'

      props[randomProp] = undefined

      TestClass = createTestClass({ autoControlledProps, state: {} })
      const wrapper = renderTest(<TestClass {...props} />)

      wrapper.setState({ [randomProp]: randomValue })

      expect(wrapper.state).toHaveProperty(randomProp, randomValue)
    })

    it('does not set state for props passed as null by the parent', () => {
      consoleUtil.disableOnce()

      const props = makeProps()
      const autoControlledProps = _.keys(props)

      const randomProp = _.sample(autoControlledProps)
      const randomValue = 'faker phrase text'

      props[randomProp] = null

      TestClass = createTestClass({ autoControlledProps, state: {} })
      const wrapper = renderTest(<TestClass {...props} />)

      wrapper.setState({ [randomProp]: randomValue })

      // not updated
      expect(wrapper.state).not.toHaveProperty(randomProp, randomValue)

      // is original value
      expect(wrapper.state).toHaveProperty(randomProp, props[randomProp])
    })
  })

  describe('initial state', () => {
    it('is derived from autoControlledProps in props', () => {
      consoleUtil.disableOnce()

      const props = makeProps()
      const autoControlledProps = _.keys(props)

      TestClass = createTestClass({ autoControlledProps, state: {} })
      const wrapper = renderTest(<TestClass {...props} />)

      _.each(props, (val, key) => expect(wrapper.state).toHaveProperty(key, val))
    })

    it('does not include non autoControlledProps', () => {
      const props = makeProps()
      const wrapper = renderTest(<TestClass {...props} />)

      _.each(props, (val, key) => expect(wrapper.state).not.toHaveProperty(key, val))
    })

    it('includes non autoControlled state', () => {
      const props = makeProps()

      TestClass = createTestClass({ autoControlledProps: [], state: { foo: 'bar' } })
      expect(renderTest(<TestClass {...props} />).state).toHaveProperty('foo', 'bar')
    })

    it('uses the initial state if default and regular props are undefined', () => {
      consoleUtil.disableOnce()

      const defaultProps = { defaultFoo: undefined }
      const autoControlledProps = ['foo']

      TestClass = createTestClass({ autoControlledProps, defaultProps, state: { foo: 'bar' } })

      expect(renderTest(<TestClass foo={undefined} />).state).toHaveProperty('foo', 'bar')
    })

    it('uses the default prop if the regular prop is undefined', () => {
      consoleUtil.disableOnce()

      const defaultProps = { defaultFoo: 'default' }
      const autoControlledProps = ['foo']

      TestClass = createTestClass({ autoControlledProps, defaultProps, state: {} })

      expect(renderTest(<TestClass foo={undefined} />).state).toHaveProperty('foo', 'default')
    })

    it('uses the regular prop when a default is also defined', () => {
      consoleUtil.disableOnce()

      const defaultProps = { defaultFoo: 'default' }
      const autoControlledProps = ['foo']

      TestClass = createTestClass({ autoControlledProps, defaultProps, state: {} })

      expect(renderTest(<TestClass foo='initial' />).state).toHaveProperty('foo', 'initial')
    })

    it('defaults "checked" to false if not present', () => {
      consoleUtil.disableOnce()
      TestClass.autoControlledProps.push('checked')

      expect(renderTest(<TestClass />).state).toHaveProperty('checked', false)
    })

    it('defaults "value" to an empty string if not present', () => {
      consoleUtil.disableOnce()
      TestClass.autoControlledProps.push('value')

      expect(renderTest(<TestClass />).state).toHaveProperty('value', '')
    })

    it('defaults "value" to an empty array if "multiple"', () => {
      consoleUtil.disableOnce()
      TestClass.autoControlledProps.push('value')

      expect(renderTest(<TestClass multiple />).state.value).toEqual([])
    })
  })

  describe('default props', () => {
    it('are applied to state for props in autoControlledProps', () => {
      consoleUtil.disableOnce()

      const props = makeProps()
      const autoControlledProps = _.keys(props)
      const defaultProps = makeDefaultProps(props)

      TestClass = createTestClass({ autoControlledProps, state: {} })
      const wrapper = renderTest(<TestClass {...defaultProps} />)

      _.each(props, (val, key) => expect(wrapper.state).toHaveProperty(key, val))
    })

    it('are not applied to state for normal props', () => {
      const props = makeProps()
      const defaultProps = makeDefaultProps(props)

      const wrapper = renderTest(<TestClass {...defaultProps} />)

      _.each(props, (val, key) => expect(wrapper.state).not.toHaveProperty(key, val))
    })

    it('allows setState to work on non-default autoControlledProps', () => {
      consoleUtil.disableOnce()

      const props = makeProps()
      const autoControlledProps = _.keys(props)
      const defaultProps = makeDefaultProps(props)

      const randomProp = _.sample(autoControlledProps)
      const randomValue = 'faker phrase text'

      TestClass = createTestClass({ autoControlledProps, state: {} })
      const wrapper = renderTest(<TestClass {...defaultProps} />)

      wrapper.setState({ [randomProp]: randomValue })
      expect(wrapper.state).toHaveProperty(randomProp, randomValue)
    })
  })

  describe('changing props', () => {
    it('sets state for props in autoControlledProps', () => {
      consoleUtil.disableOnce()

      const props = makeProps()
      const autoControlledProps = _.keys(props)

      const randomProp = _.sample(autoControlledProps)
      const randomValue = 'faker phrase text'

      TestClass = createTestClass({ autoControlledProps, state: {} })
      const wrapper = renderTest(<TestClass {...props} />)

      wrapper.setProps({ [randomProp]: randomValue })

      expect(wrapper.state).toHaveProperty(randomProp, randomValue)
    })

    it('does not set state for props not in autoControlledProps', () => {
      consoleUtil.disableOnce()
      const props = makeProps()

      const randomProp = _.sample(_.keys(props))
      const randomValue = 'faker phrase text'

      TestClass = createTestClass({ autoControlledProps: [], state: {} })
      const wrapper = renderTest(<TestClass {...props} />)

      wrapper.setProps({ [randomProp]: randomValue })

      expect(wrapper.state).not.toHaveProperty(randomProp, randomValue)
    })

    it('does not set state for default props when changed', () => {
      consoleUtil.disableOnce()

      const props = makeProps()
      const autoControlledProps = _.keys(props)
      const defaultProps = makeDefaultProps(props)

      const randomDefaultProp = _.sample(defaultProps)
      const randomValue = 'faker phrase text'

      TestClass = createTestClass({ autoControlledProps, state: {} })
      const wrapper = renderTest(<TestClass {...defaultProps} />)

      wrapper.setProps({ [randomDefaultProp]: randomValue })

      expect(wrapper.state).not.toHaveProperty(randomDefaultProp, randomValue)
    })

    it('does not return state to default props when setting props undefined', () => {
      consoleUtil.disableOnce()

      const autoControlledProps = ['foo']
      const defaultProps = { defaultFoo: 'default' }

      TestClass = createTestClass({ autoControlledProps, defaultProps, state: {} })
      const wrapper = renderTest(<TestClass foo='initial' />)

      // default value
      expect(wrapper.state).toHaveProperty('foo', 'initial')

      wrapper.setProps({ foo: undefined })

      expect(wrapper.state).toHaveProperty('foo', 'initial')
    })

    it('does not set state for props passed as null by the parent', () => {
      consoleUtil.disableOnce()

      const props = makeProps()
      const autoControlledProps = _.keys(props)

      const randomProp = _.sample(autoControlledProps)

      TestClass = createTestClass({ autoControlledProps, state: {} })
      const wrapper = renderTest(<TestClass {...props} />)

      wrapper.setProps({ [randomProp]: null })

      expect(wrapper.state).toHaveProperty(randomProp, null)
    })
  })
})
