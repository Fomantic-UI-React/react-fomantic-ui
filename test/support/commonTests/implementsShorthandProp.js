import { render } from '@testing-library/react'
import _ from 'lodash'
import React from 'react'
import ReactIs from 'react-is'

import { createShorthand } from 'src/lib'
import consoleUtil from '../consoleUtil'
import getComponentName from '../getComponentName'
import { noDefaultClassNameFromProp } from './classNameHelpers'
import helpers from './commonHelpers'

const shorthandComponentName = (ShorthandComponent) =>
  typeof ShorthandComponent === 'string' ? ShorthandComponent : getComponentName(ShorthandComponent)

/** Renders an element on its own and returns the markup it produces. */
const markupOf = (element) => {
  const { container, unmount } = render(element)
  const html = container.innerHTML
  unmount()

  return html
}

/**
 * A CSS selector matching the root element a shorthand renders, used to assert
 * presence and absence when there is no value to compare markup against.
 */
const signatureOf = (element) => {
  const { container, unmount } = render(element)
  const root = container.firstElementChild
  const escape = (name) => (window.CSS && CSS.escape ? CSS.escape(name) : name)
  const selector = root
    ? [root.tagName.toLowerCase(), ...Array.from(root.classList).map(escape)].join('.')
    : null
  unmount()

  return selector
}

/**
 * Assert that a Component correctly implements a shorthand prop.
 *
 * Heads up! Enzyme compared the shorthand's *element* against one built by
 * `createShorthand` directly. RTL has no element tree, so the equivalent
 * assertion is that both routes produce the same markup — which is what
 * consumers actually observe. The old `key` assertion has no DOM equivalent at
 * all and is dropped; React keys are never rendered.
 */
export default (Component, options = {}) => {
  const {
    alwaysPresent,
    defaultValue,
    // When false the component adds props of its own on top of the shorthand,
    // so the rendered markup is a superset rather than a match. Enzyme switched
    // from equals() to matchesElement(); here it means asserting the shorthand's
    // element is present rather than that the markup is identical.
    assertExactMatch = true,
    autoGenerateKey = true,
    mapValueToProps,
    parentIsFragment = false,
    rendersPortal = false,
    propKey,
    shorthandDefaultProps = {},
    shorthandOverrideProps = {},
    requiredProps = {},
  } = options
  const { assertRequired } = helpers('implementsShorthandProp', Component)

  const ShorthandComponent =
    options.ShorthandComponent.$$typeof === ReactIs.Memo
      ? options.ShorthandComponent.type
      : options.ShorthandComponent

  describe(`${propKey} shorthand prop (common)`, () => {
    assertRequired(Component, 'a `Component`')
    assertRequired(_.isPlainObject(options), 'an `options` object')
    assertRequired(propKey, 'a `propKey`')
    assertRequired(ShorthandComponent, 'a `ShorthandComponent`')

    const name = shorthandComponentName(ShorthandComponent)

    const assertValidShorthand = (value) => {
      const expected = createShorthand(ShorthandComponent, mapValueToProps, value, {
        defaultProps: shorthandDefaultProps,
        overrideProps: shorthandOverrideProps,
        autoGenerateKey,
      })

      const { container } = render(
        React.createElement(Component, { ...requiredProps, [propKey]: value }),
      )
      // A portal renders outside its container, so the whole document is the
      // only place the output is guaranteed to appear.
      const scope = rendersPortal ? document.body : container

      if (!assertExactMatch) {
        const selector = signatureOf(expected)

        expect(
          selector && scope.querySelector(selector),
          `<${getComponentName(Component)} ${propKey}={...} /> did not render a ${name} ` +
            `matching "${selector}"`,
        ).not.toBeNull()

        return
      }

      expect(
        scope.innerHTML,
        `<${getComponentName(Component)} ${propKey}={...} /> did not render the same markup as ` +
          `createShorthand(${name}, ...) produced on its own`,
      ).toContain(markupOf(expected))
    }

    if (alwaysPresent) {
      it(`has default ${name} when not defined`, () => {
        consoleUtil.disableOnce()
        // The default is whatever the component chooses, so the selector has to
        // come from the bare shorthand component rather than from one built
        // around an arbitrary value.
        const selector = signatureOf(React.createElement(ShorthandComponent, shorthandDefaultProps))
        const { container } = render(React.createElement(Component, requiredProps))

        expect(selector && container.querySelector(selector)).not.toBeNull()
      })
    } else {
      if (!parentIsFragment && !rendersPortal) {
        noDefaultClassNameFromProp(Component, propKey, [], options)
      }

      if (!defaultValue) {
        it(`has no ${name} when not defined`, () => {
          consoleUtil.disableOnce()
          const { container } = render(React.createElement(Component, requiredProps))

          expect(rendersPortal ? document.body.innerHTML : container.innerHTML).not.toContain(
            markupOf(
              createShorthand(ShorthandComponent, mapValueToProps, 'x', {
                defaultProps: shorthandDefaultProps,
                overrideProps: shorthandOverrideProps,
                autoGenerateKey,
              }),
            ),
          )
        })
      }
    }

    if (!alwaysPresent && !defaultValue) {
      it(`has no ${name} when null`, () => {
        consoleUtil.disableOnce()
        const { container } = render(
          React.createElement(Component, { ...requiredProps, [propKey]: null }),
        )

        expect(rendersPortal ? document.body.innerHTML : container.innerHTML).not.toContain(
          markupOf(
            createShorthand(ShorthandComponent, mapValueToProps, 'x', {
              defaultProps: shorthandDefaultProps,
              overrideProps: shorthandOverrideProps,
              autoGenerateKey,
            }),
          ),
        )
      })
    }

    it(`renders a ${name} from strings`, () => {
      consoleUtil.disableOnce()
      assertValidShorthand('string')
    })

    it(`renders a ${name} from numbers`, () => {
      consoleUtil.disableOnce()
      assertValidShorthand(123)
    })

    // Input maps shorthand to `type`, where React substitutes its own default
    // ('text') in place of type={0}.
    if (propKey !== 'input') {
      it(`renders a ${name} from number 0`, () => {
        consoleUtil.disableOnce()
        assertValidShorthand(0)
      })
    }

    it(`renders a ${name} from a props object`, () => {
      consoleUtil.disableOnce()
      assertValidShorthand(mapValueToProps('foo'))
    })

    it(`renders a ${name} from elements`, () => {
      consoleUtil.disableOnce()
      assertValidShorthand(<ShorthandComponent />)
    })
  })
}
