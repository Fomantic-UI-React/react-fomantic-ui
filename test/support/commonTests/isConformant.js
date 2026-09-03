import { fireEvent, render } from '@testing-library/react'
import _ from 'lodash'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import ReactIs from 'react-is'

import * as reactFomanticUI from 'src/index'
import { componentInfoContext } from '../componentInfo'
import consoleUtil from '../consoleUtil'
import getComponentName from '../getComponentName'
import getComponentProps from '../getComponentProps'
import { dispatchableListeners, fireEventName } from '../syntheticEvent'
import hasValidTypings from './hasValidTypings'

// Enzyme's `render`/`shallow` asserted on the element a component returned.
// RTL renders to the DOM, so the equivalent of "the root element" is the first
// element child of the container.
const rootOf = (container) => container.firstElementChild

/**
 * Assert Component conforms to guidelines that are applicable to all components.
 *
 * @param {React.ComponentType} Component A component that should conform.
 * @param {Object} [options={}]
 * @param {Object} [options.eventTargets={}] Map of listener name to a selector for the element to fire on.
 * @param {boolean} [options.rendersChildren=true] Does this component render any children?
 * @param {boolean} [options.rendersFragmentByDefault=false] Does this component render a Fragment by default?
 * @param {boolean} [options.rendersPortal=false] Does this component render through a Portal?
 * @param {Object} [options.requiredProps={}] Props required to render without errors or warnings.
 */
export default function isConformant(Component, options = {}) {
  const {
    eventTargets = {},
    requiredProps = {},
    rendersChildren = true,
    rendersFragmentByDefault = false,
    rendersPortal = false,
  } = options

  const constructorName = getComponentName(Component)
  const asProp = rendersFragmentByDefault ? 'div' : undefined

  it('is a valid component', () => {
    expect(ReactIs.isValidElementType(Component)).toBe(true)
  })

  it('is a named function/class or defines displayName', () => {
    if (!constructorName) {
      throw new Error(
        'Component is not a named function and does not have a "displayName". ' +
          `This should help identify it:\n\n${ReactDOMServer.renderToStaticMarkup(
            <Component {...requiredProps} />,
          )}`,
      )
    }
  })

  const info = componentInfoContext.byDisplayName[constructorName]

  it(`is described by componentInfo as "${constructorName}"`, () => {
    expect(info, `No component info found for "${constructorName}"`).toBeDefined()
    expect(constructorName).toBe(info.filenameWithoutExt)
  })

  // ----------------------------------------
  // Is exported
  // ----------------------------------------

  it('is exported at the top level', () => {
    expect(
      _.has(reactFomanticUI, constructorName),
      `"${constructorName}" must be exported from src/index.js`,
    ).toBe(true)
  })

  if (info?.isChild && info.apiPath.includes('.')) {
    it(`is a static component on ${info.parentDisplayName}`, () => {
      expect(
        ReactIs.isValidElementType(_.get(reactFomanticUI, info.apiPath)),
        `"${constructorName}" is a child component (${info.repoPath}), so it must be a static ` +
          `prop of its parent: ${info.apiPath}`,
      ).toBe(true)
    })
  }

  // ----------------------------------------
  // Props
  // ----------------------------------------

  if (rendersChildren) {
    it('spreads user props', () => {
      const propName = 'data-is-conformant-spread-props'
      const { container } = render(
        <Component as={asProp} {...requiredProps} {...{ [propName]: true }} />,
      )

      expect(container.querySelector(`[${propName}]`)).not.toBeNull()
    })
  }

  if (rendersChildren && !rendersPortal) {
    describe('"as" prop (common)', () => {
      it('renders as the given HTML tag', () => {
        // Nesting warnings are expected: not every tag is valid inside every parent.
        consoleUtil.disableOnce()

        for (const tag of ['a', 'em', 'div', 'h1', 'i', 'p', 'span', 'strong']) {
          const { container, unmount } = render(<Component {...requiredProps} as={tag} />)

          expect(
            container.querySelector(tag),
            `<${constructorName} as='${tag}' /> did not render a <${tag}>`,
          ).not.toBeNull()

          unmount()
        }
      })

      it('renders as a function component', () => {
        const MyComponent = vi.fn(() => <div data-my-component />)
        const { container } = render(<Component {...requiredProps} as={MyComponent} />)

        expect(MyComponent).toHaveBeenCalled()
        expect(container.querySelector('[data-my-component]')).not.toBeNull()
      })

      it('renders as a class component', () => {
        // eslint-disable-next-line react/prefer-stateless-function
        class MyComponent extends React.Component {
          render() {
            return <div data-my-react-class />
          }
        }

        const { container } = render(<Component {...requiredProps} as={MyComponent} />)

        expect(container.querySelector('[data-my-react-class]')).not.toBeNull()
      })

      it('passes extra props to the component it renders as', () => {
        const MyComponent = ({ ...rest }) => <div {...rest} />
        const { container } = render(
          <Component {...requiredProps} as={MyComponent} data-extra-prop='foo' />,
        )

        expect(container.querySelector('[data-extra-prop="foo"]')).not.toBeNull()
      })
    })
  }

  // ----------------------------------------
  // handledProps
  // ----------------------------------------

  describe('handles props', () => {
    const componentProps = getComponentProps(Component)

    it('defines handled props in Component.handledProps', () => {
      expect(Array.isArray(componentProps.handledProps)).toBe(true)
    })

    it('Component.handledProps includes all handled props', () => {
      const expected = _.uniq(
        _.union(componentProps.autoControlledProps, _.keys(componentProps.propTypes)),
      ).sort()

      expect(
        componentProps.handledProps,
        'handledProps must equal the union of Component.autoControlledProps and the keys of ' +
          'Component.propTypes. It is baked into source — see PLAN.md landmine 1.',
      ).toEqual(expected)
    })
  })

  // ----------------------------------------
  // Events
  // ----------------------------------------

  if (rendersChildren && !rendersPortal) {
    it('handles events transparently', () => {
      // Both handlers below should be called with the same event:
      //
      //   <Button onClick={handler} />
      //   <button onClick={handler} />
      //
      // This catches a component that handles an event internally and forgets
      // to call the prop, or drops the synthetic event on the way back out.
      for (const listenerName of dispatchableListeners) {
        if (!_.has(Component.propTypes, listenerName)) continue

        const handlerSpy = vi.fn()
        const props = {
          ...requiredProps,
          [listenerName]: handlerSpy,
          'data-simulate-event-here': true,
        }

        consoleUtil.disableOnce()
        const { container, unmount } = render(<Component as={asProp} {...props} />)

        const target = eventTargets[listenerName]
          ? container.querySelector(eventTargets[listenerName])
          : container.querySelector('[data-simulate-event-here]')

        expect(target, `Could not find an element to fire "${listenerName}" on`).not.toBeNull()

        fireEvent[fireEventName(listenerName)](target)

        expect(
          handlerSpy,
          `<${constructorName} ${listenerName}={handler} /> was not called once. ` +
            'You may need to hoist the handler up to the root element.',
        ).toHaveBeenCalledTimes(1)

        // Components return the event first, then their own data.
        const [event, data] = handlerSpy.mock.calls[0]
        expect(event, `${listenerName} was not called with the event`).toBeDefined()
        expect(data, `${listenerName} was not called with (event, data)`).toMatchObject({
          [listenerName]: handlerSpy,
        })

        unmount()
      }
    })
  }

  // ----------------------------------------
  // Deprecated statics
  // ----------------------------------------

  it('does not define the deprecated _meta static', () => {
    expect(Component._meta).toBeUndefined()
  })

  it('does not define defaultProps', () => {
    expect(Component.defaultProps).toBeUndefined()
  })

  // ----------------------------------------
  // className
  // ----------------------------------------

  // Heads up! The old harness also asserted the component's Semantic UI class
  // name, read from `componentInfoContext.componentClassName` — a value the
  // react-docgen pass produced and which cannot be derived from source without
  // guessing (ButtonGroup renders "buttons", not "button-group"). The two
  // assertions below carry the rest of that coverage; `hasUIClassName` and
  // `implementsClassNameProps` cover the specific class names per component.
  if (_.has(Component.propTypes, 'className') && rendersChildren && !rendersPortal) {
    describe('className (common)', () => {
      it("applies the user's className to the root element", () => {
        const className = 'is-conformant-class-string'
        const { container } = render(
          <Component as={asProp} {...requiredProps} className={className} />,
        )

        expect(rootOf(container)).toHaveClass(className)
      })

      it("user's className does not override the default classes", () => {
        const { container, unmount } = render(<Component as={asProp} {...requiredProps} />)
        const defaultClasses = rootOf(container)?.className

        unmount()
        if (!defaultClasses) return

        const { container: mixed } = render(
          <Component as={asProp} {...requiredProps} className='is-conformant-user-class' />,
        )
        const mixedClasses = rootOf(mixed).className

        for (const defaultClass of defaultClasses.split(' ').filter(Boolean)) {
          expect(
            mixedClasses.split(' '),
            'Make sure you are using the `getUnhandledProps` util to spread the rest props.',
          ).toContain(defaultClass)
        }
      })
    })
  }

  // ----------------------------------------
  // Typings
  // ----------------------------------------

  hasValidTypings(Component, options)
}
