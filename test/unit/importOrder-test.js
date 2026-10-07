import _ from 'lodash'

import { componentInfoContext } from 'test/support/componentInfo'

// Every component module has to work as the first one a consumer loads.
//
// A parent that imports its own subcomponent, while the subcomponent imports the
// parent back, attaches `Parent.Sub` before `Sub` exists whenever the
// subcomponent is loaded first: `undefined` in CommonJS, a ReferenceError in
// native ESM. 3.0.0 shipped five of those (issue #8) and took down a Next.js app
// whose bundler happened to reach `StepGroup` before `Step`.
//
// test/setup.js loads src/index for every spec, so each case resets the module
// registry to start from a graph that contains only the module under test.
const components = _.sortBy(Object.values(componentInfoContext.byDisplayName), 'repoPath')

describe('import order', () => {
  it.each(components.map((info) => [info.repoPath, info]))(
    '%s works when loaded first',
    async (repoPath, info) => {
      vi.resetModules()

      const { default: Component } = await import(`../../${repoPath}`)
      expect(Component, `${repoPath} has no default export`).toBeDefined()

      if (!info.isChild) return

      const parentPath = repoPath.replace(/\/\w+\.js$/, `/${info.parentDisplayName}.js`)
      const { default: Parent } = await import(`../../${parentPath}`)

      const missing = Object.keys(Parent).filter((key) => /^[A-Z]/.test(key) && !Parent[key])
      expect(missing, `${parentPath} lost statics when ${repoPath} loaded first`).toEqual([])
    },
  )
})
