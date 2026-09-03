import React, { isValidElement } from 'react'

import consoleUtil from '../consoleUtil'
import getComponentName from '../getComponentName'

/** Assert a component correctly implements a shorthand create method. */
export default function implementsCreateMethod(Component) {
  describe('create shorthand method (common)', () => {
    const name = getComponentName(Component)

    beforeEach(() => {
      // Generated prop values may warn; that is not what these assert.
      consoleUtil.disableOnce()
    })

    it('is a static method', () => {
      expect(typeof Component.create).toBe('function')
    })

    it.each([
      ['a string', 'foo'],
      ['a number', 123],
      ['the number 0', 0],
      ['a props object', { 'data-foo': 'bar' }],
      ['an array', ['foo', 123, { 'data-foo': 'bar' }]],
    ])(`creates a ${name} from %s`, (_label, value) => {
      consoleUtil.disableOnce()
      expect(isValidElement(Component.create(value))).toBe(true)
    })

    it(`creates a ${name} from an element`, () => {
      expect(isValidElement(Component.create(<div />))).toBe(true)
    })

    it.each([[null], [undefined], [true], [false]])('returns null when passed %s', (value) => {
      expect(Component.create(value)).toBe(null)
    })
  })
}
