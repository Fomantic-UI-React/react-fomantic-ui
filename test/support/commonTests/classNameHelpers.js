import { render } from '@testing-library/react'
import _ from 'lodash'
import React from 'react'

import consoleUtil from '../consoleUtil'

// Enzyme asserted on `wrapper.childAt(0).getDOMNode()`; the RTL equivalent of
// "the element the component rendered" is the container's first element child.
const rootClassName = (container) => container.firstElementChild?.className ?? ''

/** The root element's classes, as a list. */
export const rootClassList = (container) => rootClassName(container).split(/\s+/).filter(Boolean)

/**
 * Assert the root element carries every class in `expected`.
 *
 * Some prop values are themselves multi-word ("google plus"), so both sides are
 * split before comparison — `classList` never holds a class containing a space.
 */
export const expectHasClasses = (container, expected) => {
  const actual = rootClassList(container)

  for (const className of String(expected).split(/\s+/).filter(Boolean)) {
    expect(actual, `expected className "${actual.join(' ')}" to include "${expected}"`).toContain(
      className,
    )
  }
}

export const classNamePropValueBeforePropName = (Component, propKey, propValues, options = {}) => {
  const { className = propKey, requiredProps = {} } = options

  for (const propVal of propValues) {
    it(`adds "${propVal} ${className}" to className`, () => {
      const { container } = render(
        React.createElement(Component, { ...requiredProps, [propKey]: propVal }),
      )

      expect(rootClassName(container)).toContain(`${propVal} ${className}`)
    })
  }
}

export const noClassNameFromBoolProps = (Component, propKey, propValues, options = {}) => {
  const { className = propKey, requiredProps = {} } = options

  for (const bool of [true, false]) {
    it(`does not add any className when ${bool}`, () => {
      consoleUtil.disableOnce()

      const { container } = render(
        React.createElement(Component, { ...requiredProps, [propKey]: bool }),
      )
      const classes = rootClassName(container).split(' ')

      expect(classes).not.toContain(className)
      expect(classes).not.toContain('true')
      expect(classes).not.toContain('false')

      for (const propVal of propValues) {
        expect(classes).not.toContain(propVal.toString())
      }
    })
  }
}

export const noDefaultClassNameFromProp = (Component, propKey, propValues, options = {}) => {
  const { className = propKey, requiredProps = {}, defaultValue } = options

  // A required prop may itself produce a className, in which case its absence
  // cannot be asserted.
  if (defaultValue) return
  if (propKey in requiredProps) return

  it('is not included in className when not defined', () => {
    consoleUtil.disableOnce()

    const { container } = render(<Component {...requiredProps} />)
    const classes = rootClassName(container).split(' ')

    expect(classes).not.toContain(className)

    // SUI classes ought to be built up through a declarative component API,
    // so no prop value should leak into className on its own.
    for (const propValue of _.castArray(propValues)) {
      expect(classes).not.toContain(propValue.toString())
    }
  })
}
