import { render } from '@testing-library/react'
import React from 'react'

/**
 * A smoke test over every documentation example: it renders, and it does so
 * without React or the library complaining.
 *
 * The frozen `test/specs/docs/examples-test.js` did this through webpack's
 * `require.context`, which is why it could not run once the docs app went. Vite
 * has `import.meta.glob`, which does the same job, so the coverage comes back
 * rather than being deleted with the rest of the frozen suite.
 *
 * These 909 files are the whole public API exercised the way a consumer writes
 * it, and they are what Phase 4 turns into Storybook stories.
 */
const modules = import.meta.glob('/docs/src/examples/**/*Example*.js')
const sources = import.meta.glob('/docs/src/examples/**/*Example*.js', {
  query: '?raw',
  import: 'default',
  eager: true,
})

// Sixteen examples still import `faker`, which Phase 0 removed from
// devDependencies. They are skipped by reading the source rather than by a
// hard-coded list, so this disappears by itself when the examples are rewritten
// — Phase 4 wants them free of random data anyway.
const usesFaker = (path) => /from 'faker'/.test(sources[path])

// `@fluentui/react-component-event-listener` sets `defaultProps` on a function
// component. React 18 warns; React 19 removes the feature outright, so this is
// a Phase 3 blocker in a dependency rather than anything an example does wrong.
// See issue #35.
const KNOWN_WARNINGS = [/Support for defaultProps will be removed from function components/]
const isKnown = (call) => KNOWN_WARNINGS.some((pattern) => pattern.test(String(call[0])))

describe('examples', () => {
  const paths = Object.keys(modules)

  it('finds the examples', () => {
    expect(paths.length).toBeGreaterThan(800)
  })

  for (const path of paths) {
    const filename = path.split('/').pop()
    const test = usesFaker(path) ? it.skip : it

    test(`${filename} renders without console activity`, async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {})
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      try {
        const { default: Component } = await modules[path]()
        const { container, unmount } = render(React.createElement(Component))

        expect(container).not.toBeEmptyDOMElement()
        unmount()

        const complaints = [...error.mock.calls, ...warn.mock.calls].filter(
          (call) => !isKnown(call),
        )

        expect(complaints, `console output:\n${complaints.join('\n')}`).toHaveLength(0)
      } finally {
        error.mockRestore()
        warn.mockRestore()
      }
    })
  }
})
