import React from 'react'

// The library ships no CSS. Visual regression testing needs a pinned one, and
// this is the baseline the whole of phase 3 walks forward from:
// fomantic-ui-css 2.4.4 is Fomantic's first release, the closest point on the
// maintained lineage to where it split from Semantic-UI in 2018.
// See "Which Fomantic, and how we get to current" in PLAN.md.
import 'fomantic-ui-css/semantic.min.css'

/** @type {import('@storybook/react-vite').Preview} */
export default {
  // Snapshots are taken of the canvas, so a story rendered flush to the corner
  // has its shadows and focus rings clipped.
  decorators: [(Story) => <div style={{ padding: '1rem' }}>{Story()}</div>],

  parameters: {
    controls: { disable: true },

    // Every example is a fixed composition with no props of its own, so there
    // is nothing to control and nothing to auto-document from.
    actions: { disable: true },

    options: {
      storySort: {
        order: ['Elements', 'Collections', 'Views', 'Modules', 'Addons', 'Behaviors'],
      },
    },
  },
}
