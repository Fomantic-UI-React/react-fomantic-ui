import '@testing-library/jest-dom/vitest'

import { configure } from '@testing-library/react'

// Failures should point at the assertion, not dump the whole document.
configure({ getElementError: (message) => new Error(message) })
