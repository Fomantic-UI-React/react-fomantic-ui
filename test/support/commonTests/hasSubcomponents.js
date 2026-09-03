import _ from 'lodash'

/** Assert a component exposes other components as static properties. */
export default (Component, subcomponents) => {
  const staticValues = _.values(Component)

  for (const subcomponent of subcomponents) {
    it(`has sub component ${_.get(subcomponent, 'prototype.constructor.name')}`, () => {
      expect(staticValues).toContain(subcomponent)
    })
  }
}
