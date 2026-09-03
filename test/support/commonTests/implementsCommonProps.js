import { render } from '@testing-library/react'
import React, { createElement } from 'react'

import Button from 'src/elements/Button'
import Icon from 'src/elements/Icon'
import Image from 'src/elements/Image'
import Label from 'src/elements/Label'
import { numberToWord, SUI } from 'src/lib'
import {
  expectHasClasses,
  noClassNameFromBoolProps,
  noDefaultClassNameFromProp,
  rootClassList,
} from './classNameHelpers'
import helpers from './commonHelpers'
import implementsShorthandProp from './implementsShorthandProp'

const expectClasses = (element, expected) => {
  const { container, unmount } = render(element)

  expectHasClasses(container, expected)
  unmount()
}

const expectNoClass = (element, className) => {
  const { container, unmount } = render(element)

  expect(rootClassList(container)).not.toContain(className)
  unmount()
}

// ----------------------------------------
// Shorthand props
// ----------------------------------------

export const implementsButtonProp = (Component, options = {}) =>
  implementsShorthandProp(Component, {
    propKey: 'button',
    ShorthandComponent: Button,
    mapValueToProps: (val) => ({ content: val }),
    ...options,
  })

export const implementsHTMLIFrameProp = (Component, options = {}) =>
  implementsShorthandProp(Component, {
    propKey: 'iframe',
    ShorthandComponent: 'iframe',
    mapValueToProps: (src) => ({ src }),
    ...options,
  })

export const implementsHTMLInputProp = (Component, options = {}) =>
  implementsShorthandProp(Component, {
    propKey: 'input',
    ShorthandComponent: 'input',
    mapValueToProps: (val) => ({ type: val }),
    ...options,
  })

export const implementsHTMLLabelProp = (Component, options = {}) =>
  implementsShorthandProp(Component, {
    propKey: 'label',
    ShorthandComponent: 'label',
    mapValueToProps: (val) => ({ children: val }),
    ...options,
  })

export const implementsIconProp = (Component, options = {}) =>
  implementsShorthandProp(Component, {
    propKey: 'icon',
    ShorthandComponent: Icon,
    mapValueToProps: (val) => ({ name: val }),
    ...options,
  })

export const implementsImageProp = (Component, options = {}) =>
  implementsShorthandProp(Component, {
    propKey: 'image',
    ShorthandComponent: Image,
    mapValueToProps: (val) => ({ src: val }),
    ...options,
  })

export const implementsLabelProp = (Component, options = {}) =>
  implementsShorthandProp(Component, {
    propKey: 'label',
    ShorthandComponent: Label,
    mapValueToProps: (val) => ({ content: val }),
    ...options,
  })

// ----------------------------------------
// className props
// ----------------------------------------

/** Assert that a Component correctly implements the "multiple" style props. */
export const implementsMultipleProp = (Component, propKey, propValues) => {
  const { assertRequired } = helpers('implementsMultipleProp', Component)

  describe(`${propKey} (common)`, () => {
    assertRequired(Component, 'a `Component`')

    noDefaultClassNameFromProp(Component, propKey, propValues)
    noClassNameFromBoolProps(Component, propKey, propValues)

    for (const propVal of propValues) {
      it(`adds "${propVal} ${propKey}" to className`, () => {
        expectClasses(createElement(Component, { [propKey]: propVal }), `${propVal} ${propKey}`)
      })
    }

    it('adds all possible values to className', () => {
      const expected = propValues.map((prop) => `${prop} ${propKey}`).join(' ')

      expectClasses(createElement(Component, { [propKey]: propValues.join(' ') }), expected)
    })
  })
}

/** Assert that a Component correctly implements the "textAlign" prop. */
export const implementsTextAlignProp = (
  Component,
  alignments = SUI.TEXT_ALIGNMENTS,
  options = {},
) => {
  const { requiredProps = {} } = options
  const { assertRequired } = helpers('implementsTextAlignProp', Component)

  describe('aligned (common)', () => {
    assertRequired(Component, 'a `Component`')

    noClassNameFromBoolProps(Component, 'textAlign', alignments, options)
    noDefaultClassNameFromProp(Component, 'textAlign', alignments, options)

    for (const propVal of alignments) {
      if (propVal === 'justified') {
        it('adds "justified" without "aligned" to className', () => {
          const element = <Component {...requiredProps} textAlign='justified' />

          expectClasses(element, 'justified')
          expectNoClass(element, 'aligned')
        })
      } else {
        it(`adds "${propVal} aligned" to className`, () => {
          expectClasses(<Component {...requiredProps} textAlign={propVal} />, `${propVal} aligned`)
        })
      }
    }
  })
}

/** Assert that a Component correctly implements the "verticalAlign" prop. */
export const implementsVerticalAlignProp = (
  Component,
  alignments = SUI.VERTICAL_ALIGNMENTS,
  options = {},
) => {
  const { requiredProps = {} } = options
  const { assertRequired } = helpers('implementsVerticalAlignProp', Component)

  describe('verticalAlign (common)', () => {
    assertRequired(Component, 'a `Component`')

    noClassNameFromBoolProps(Component, 'verticalAlign', alignments, options)
    noDefaultClassNameFromProp(Component, 'verticalAlign', alignments, options)

    for (const propVal of alignments) {
      it(`adds "${propVal} aligned" to className`, () => {
        expectClasses(
          <Component {...requiredProps} verticalAlign={propVal} />,
          `${propVal} aligned`,
        )
      })
    }
  })
}

/** Assert that a Component correctly implements a width prop. */
export const implementsWidthProp = (Component, widths = SUI.WIDTHS, options = {}) => {
  const { canEqual = true, propKey, requiredProps, widthClass } = options
  const { assertRequired } = helpers('implementsWidthProp', Component)
  const propValues = canEqual ? [...widths, 'equal'] : widths

  describe(`${propKey} (common)`, () => {
    assertRequired(Component, 'a `Component`')

    noClassNameFromBoolProps(Component, propKey, propValues, options)
    noDefaultClassNameFromProp(Component, propKey, propValues, options)

    it('adds numberToWord value to className', () => {
      for (const width of widths) {
        const expected = widthClass ? `${numberToWord(width)} ${widthClass}` : numberToWord(width)

        expectClasses(createElement(Component, { ...requiredProps, [propKey]: width }), expected)
      }
    })

    if (canEqual) {
      it('adds "equal width" to className', () => {
        expectClasses(
          createElement(Component, { ...requiredProps, [propKey]: 'equal' }),
          'equal width',
        )
      })
    }
  })
}

/** Assert that a Component with a label correctly implements "id" and "htmlFor". */
export const labelImplementsHtmlForProp = (Component, options = {}) => {
  const { requiredProps = {} } = options
  const { assertRequired } = helpers('labelImplementsHtmlForProp', Component)

  describe('htmlFor (common)', () => {
    assertRequired(Component, 'a `Component`')

    it('adds htmlFor to label', () => {
      const id = 'id-for-test'
      const { container } = render(<Component {...requiredProps} id={id} label='label-for-test' />)

      expect(container.querySelector(`#${id}`)).not.toBeNull()
      expect(container.querySelector('label')).toHaveAttribute('for', id)
    })
  })
}
