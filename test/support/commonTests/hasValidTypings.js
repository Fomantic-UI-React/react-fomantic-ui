import _ from 'lodash'

import { customPropTypes } from 'src/lib'
import { componentInfoContext } from '../componentInfo'
import getComponentName from '../getComponentName'
import getComponentProps from '../getComponentProps'
import {
  getComponentType,
  getInterfaces,
  getNodes,
  hasAnySignature,
  isForwardRefComponent,
  requireTs,
} from './tsHelpers'

const isShorthand = (propType) =>
  _.includes(
    [
      customPropTypes.collectionShorthand,
      customPropTypes.contentShorthand,
      customPropTypes.itemShorthand,
    ],
    propType,
  )

const shorthandMap = {
  SemanticShorthandContent: customPropTypes.contentShorthand,
  SemanticShorthandItem: customPropTypes.itemShorthand,
  SemanticShorthandCollection: customPropTypes.collectionShorthand,
}

/** Assert a component's hand-written `.d.ts` matches its propTypes. */
export default function hasValidTypings(Component, options = {}) {
  const { displayName, repoPath } = componentInfoContext.byDisplayName[getComponentName(Component)]
  const { ignoredTypingsProps = [], forwardsRef = true, requiredProps } = options

  const tsFile = repoPath.replace('src/', '').replace('.js', '.d.ts')
  const tsContent = requireTs(tsFile)

  describe('typings', () => {
    it(`${tsFile} exists`, () => {
      expect(tsContent).not.toBe(false)
    })

    const tsNodes = getNodes(tsFile, tsContent)
    const componentType = getComponentType(tsNodes, displayName)

    const propsInterfaceName = `${displayName}Props`
    const strictInterfaceName = `Strict${displayName}Props`

    const interfaces = getInterfaces(tsNodes)
    const propsInterfaceObject = _.find(interfaces, { name: propsInterfaceName })
    const strictInterfaceObject = _.find(interfaces, { name: strictInterfaceName })

    describe(`component ${displayName}`, () => {
      it('has a component type', () => {
        expect(componentType).toBeTypeOf('object')
      })

      if (forwardsRef) {
        it('is a ForwardRefComponent', () => {
          expect(isForwardRefComponent(componentType)).toBe(true)
        })
      }
    })

    for (const [name, object] of [
      [propsInterfaceName, () => propsInterfaceObject],
      [strictInterfaceName, () => strictInterfaceObject],
    ]) {
      describe(`interface ${name}`, () => {
        it('exists', () => {
          expect(object()).toBeTypeOf('object')
        })

        it('is exported', () => {
          expect(object().exported).toBe(true)
        })
      })
    }

    describe('props', () => {
      it('has an index signature', () => {
        expect(hasAnySignature(tsNodes)).toBe(true)
      })

      it('matches the typings interface', () => {
        const componentProps = _.keys(getComponentProps(Component).propTypes)
        const interfaceProps = _.without(
          _.map(strictInterfaceObject.props, 'name'),
          ...ignoredTypingsProps,
        )

        componentProps.forEach((propName, index) => {
          expect(
            interfaceProps,
            `propTypes define "${propName}" but it is missing in typings`,
          ).toContain(propName)
          expect(
            interfaceProps[index],
            `propTypes define "${propName}" but its order does not match typings`,
          ).toBe(propName)
        })

        for (const propName of interfaceProps) {
          expect(
            componentProps,
            `Typings define prop "${propName}" but it is missing in propTypes`,
          ).toContain(propName)
        }
      })

      it('isRequired props match required typings', () => {
        const componentRequired = _.keys(requiredProps)
        const interfaceRequired = _.map(
          _.filter(strictInterfaceObject.props, ['required', true]),
          'name',
        )

        for (const propName of componentRequired) {
          expect(
            interfaceRequired,
            `Tests require prop "${propName}" but it is optional in typings`,
          ).toContain(propName)
        }

        for (const propName of interfaceRequired) {
          expect(
            componentRequired,
            `Typings require "${propName}" but it is optional in tests`,
          ).toContain(propName)
        }
      })
    })

    const componentShorthands = _.pickBy(_.get(Component, 'propTypes'), isShorthand)

    // Only declare the suite when there is something in it: vitest fails an
    // empty describe, where mocha quietly allowed one.
    if (!_.isEmpty(componentShorthands)) {
      describe('shorthands', () => {
        _.forEach(componentShorthands, (propType, propName) => {
          it(`"${propName}" has the correct shorthand type`, () => {
            const { type } = _.find(strictInterfaceObject.shorthands, ['name', propName])

            expect(shorthandMap[type]).toBe(propType)
          })
        })
      })
    }
  })
}
