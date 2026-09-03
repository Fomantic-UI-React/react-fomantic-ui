import { render } from '@testing-library/react'
import React from 'react'

import consoleUtil from '../consoleUtil'
import {
  classNamePropValueBeforePropName,
  expectHasClasses,
  noClassNameFromBoolProps,
  noDefaultClassNameFromProp,
  rootClassList,
} from './classNameHelpers'
import helpers from './commonHelpers'

const renderWith = (Component, requiredProps, propKey, value) =>
  render(React.createElement(Component, { ...requiredProps, [propKey]: value }))

/** Assert that a prop's name and value are both required to create a className. */
export const propKeyAndValueToClassName = (Component, propKey, propValues, options = {}) => {
  const { assertRequired } = helpers('propKeyAndValueToClassName', Component)

  describe(`${propKey} (common)`, () => {
    assertRequired(Component, 'a `Component`')
    assertRequired(propKey, 'a `propKey`')

    classNamePropValueBeforePropName(Component, propKey, propValues, options)
    noDefaultClassNameFromProp(Component, propKey, propValues, options)
    noClassNameFromBoolProps(Component, propKey, propValues, options)
  })
}

/** Assert that only a prop's name is converted to className. */
export const propKeyOnlyToClassName = (Component, propKey, options = {}) => {
  const { className = propKey, requiredProps = {} } = options
  const { assertRequired } = helpers('propKeyOnlyToClassName', Component)

  describe(`${propKey} (common)`, () => {
    assertRequired(Component, 'a `Component`')
    assertRequired(propKey, 'a `propKey`')

    noDefaultClassNameFromProp(Component, propKey, [], options)

    it('adds prop name to className', () => {
      consoleUtil.disableOnce()
      const { container } = renderWith(Component, requiredProps, propKey, true)

      expectHasClasses(container, className)
    })

    it('does not add prop value to className', () => {
      consoleUtil.disableOnce()
      const value = 'foo-bar-baz'
      const { container } = renderWith(Component, requiredProps, propKey, value)

      expect(rootClassList(container)).not.toContain(value)
    })
  })
}

/** Assert that a prop's name or its value converts to a className. */
export const propKeyOrValueAndKeyToClassName = (Component, propKey, propValues, options = {}) => {
  const { className = propKey, requiredProps = {} } = options
  const { assertRequired } = helpers('propKeyOrValueAndKeyToClassName', Component)

  describe(`${propKey} (common)`, () => {
    assertRequired(Component, 'a `Component`')
    assertRequired(propKey, 'a `propKey`')

    noDefaultClassNameFromProp(Component, propKey, propValues, options)
    classNamePropValueBeforePropName(Component, propKey, propValues, options)

    beforeEach(() => {
      consoleUtil.disableOnce()
    })

    it('adds only the name to className when true', () => {
      const { container } = renderWith(Component, requiredProps, propKey, true)

      expectHasClasses(container, className)
    })

    it('adds no className when false', () => {
      const { container } = renderWith(Component, requiredProps, propKey, false)
      const classes = rootClassList(container)

      expect(classes).not.toContain(className)
      expect(classes).not.toContain('true')
      expect(classes).not.toContain('false')

      for (const propVal of propValues) {
        expect(classes).not.toContain(propVal)
      }
    })
  })
}

/** Assert that only a prop's value is converted to className. */
export const propValueOnlyToClassName = (Component, propKey, propValues, options = {}) => {
  const { requiredProps = {} } = options
  const { assertRequired } = helpers('propValueOnlyToClassName', Component)

  describe(`${propKey} (common)`, () => {
    assertRequired(Component, 'a `Component`')
    assertRequired(propKey, 'a `propKey`')

    noClassNameFromBoolProps(Component, propKey, propValues, options)
    noDefaultClassNameFromProp(Component, propKey, propValues, options)

    it('adds prop value to className', () => {
      for (const propValue of propValues) {
        const { container, unmount } = renderWith(Component, requiredProps, propKey, propValue)

        expectHasClasses(container, propValue)
        unmount()
      }
    })

    it('does not add prop name to className', () => {
      consoleUtil.disableOnce()

      for (const propValue of propValues) {
        const { container, unmount } = renderWith(Component, requiredProps, propKey, propValue)

        expect(rootClassList(container)).not.toContain(propKey)
        unmount()
      }
    })
  })
}
