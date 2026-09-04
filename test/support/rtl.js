/**
 * Small helpers standing in for the Enzyme wrapper reads the frozen specs use.
 *
 * These are deliberately thin: they render for real and hand back DOM. They are
 * not an Enzyme shim — anything that needs the React element tree (finding a
 * component by name, reading its props) has no equivalent here and must be
 * rewritten as a behavioural assertion instead.
 */
import { render } from '@testing-library/react'

/** The element the component rendered — Enzyme's wrapper root. */
export const root = (element) => render(element).container.firstElementChild

/** The full rendered tree, for descendant queries. */
export const dom = (element) => render(element).container
