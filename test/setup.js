import '@testing-library/jest-dom/vitest'

import { configure } from '@testing-library/react'

// Heads up! This import is load-bearing, not decoration.
//
// Several component folders are circular — Button.js imports ButtonGroup.js and
// back again — so `Button.Group = ButtonGroup` only resolves when the parent
// module initialises first. A spec that deep-imports the child (as
// ButtonGroup-test.js does) would otherwise see `Button.Group === undefined`.
//
// Importing the package entry here loads the graph in the same order a consumer
// does, which is the order isConformant's subcomponent assertion is about.
// The underlying circularity is a real bug in the library — see PLAN.md.
import 'src/index'

// Failures should point at the assertion, not dump the whole document.
configure({ getElementError: (message) => new Error(message) })
