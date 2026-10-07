import '@testing-library/jest-dom/vitest'

import { configure } from '@testing-library/react'

// jest-dom covers class, attribute and text assertions; tag name is the one
// Enzyme read that has no equivalent.
expect.extend({
  toHaveTagName(received, expected) {
    const actual = received?.tagName
    const pass = actual === String(expected).toUpperCase()

    return {
      pass,
      message: () =>
        `expected element to ${pass ? 'not ' : ''}have tag name "${expected}", got "${actual}"`,
    }
  },
})

// Failures should point at the assertion, not dump the whole document.
configure({ getElementError: (message) => new Error(message) })
