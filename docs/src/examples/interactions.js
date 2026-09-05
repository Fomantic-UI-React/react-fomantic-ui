/**
 * Play functions shared by the generated stories.
 *
 * Overlay components — Modal, Popup, Dimmer, Sidebar and friends — render a
 * trigger and nothing else until something happens to them, so a snapshot of
 * the default state says nothing about the component. Chromatic waits for a
 * story's play function to finish before capturing, so these open the thing
 * first.
 *
 * They are deliberately **best-effort and non-asserting**. Roughly a third of
 * the examples in these sections open by some route these three do not cover —
 * a checkbox, a nested control, a context menu — and a play function that threw
 * would mark those stories broken rather than leaving them as they are today.
 * A story that fails to open still snapshots its closed state, which is exactly
 * what it did before, and if a component *stops* opening that shows up as a
 * diff rather than as silence.
 *
 * Measured when written: `openOverlay` reaches 22 of 24 Modal/Confirm/Portal
 * examples, `activate` 9 of 19 Dimmer/Sidebar, `revealOnHover` 17 of 28 Popup.
 */
import { userEvent, waitFor } from 'storybook/test'

const CONTROL = 'button, input, .ui.button, [role=button], a'
const nodeCount = () => document.body.querySelectorAll('*').length

/** Clicks the first control and waits for content to appear anywhere. */
export const openOverlay = async ({ canvasElement }) => {
  const control = canvasElement.querySelector(CONTROL)
  if (!control) return

  const before = nodeCount()
  await userEvent.click(control)

  try {
    await waitFor(() => {
      if (nodeCount() <= before) throw new Error('nothing opened yet')
    })
  } catch (error) {
    // Some examples open by a route this does not cover. See the note above.
  }
}

/** Clicks the first control and waits for something to become active. */
export const activate = async ({ canvasElement }) => {
  const control = canvasElement.querySelector(CONTROL)
  if (!control) return

  await userEvent.click(control)

  try {
    await waitFor(() => {
      const active = canvasElement.querySelector(
        '.dimmer.active, .sidebar.visible, .visible.sidebar',
      )
      if (!active) throw new Error('nothing became active yet')
    })
  } catch (error) {
    // As above.
  }
}

/**
 * Hovers each of the first few elements until a popup appears. Popup triggers
 * are rarely buttons — an icon, a header, a word in a sentence — so there is no
 * selector that finds them, and walking the DOM in order is deterministic.
 */
export const revealOnHover = async ({ canvasElement }) => {
  const candidates = [...canvasElement.querySelectorAll('*')].slice(0, 12)

  for (let i = 0; i < candidates.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop -- hovering one at a time is the point
    await userEvent.hover(candidates[i])

    try {
      // eslint-disable-next-line no-await-in-loop -- as above
      await waitFor(
        () => {
          if (!document.body.querySelector('.ui.popup'))
            throw new Error('no popup yet')
        },
        { timeout: 250 },
      )

      return
    } catch (error) {
      // Not this one; try the next.
    }
  }
}
