/**
 * The React synthetic events that `isConformant` checks pass through
 * transparently.
 *
 * Enzyme's `simulate()` invoked React's handler directly, so it could exercise
 * every listener regardless of whether the event was dispatchable in jsdom.
 * RTL's `fireEvent` dispatches a real DOM event, so this list is filtered at
 * run time to the events testing-library can actually raise — see
 * `dispatchableListeners` below.
 */
import { fireEvent } from '@testing-library/react'
import _ from 'lodash'

export const types = {
  clipboard: { listeners: ['onCopy', 'onCut', 'onPaste'] },
  composition: {
    listeners: ['onCompositionEnd', 'onCompositionStart', 'onCompositionUpdate'],
  },
  keyboard: { listeners: ['onKeyDown', 'onKeyUp'] },
  focus: { listeners: ['onFocus', 'onBlur'] },
  form: { listeners: ['onChange', 'onInput', 'onSubmit'] },
  mouse: {
    listeners: [
      'onClick',
      'onContextMenu',
      'onDoubleClick',
      'onDrag',
      'onDragEnd',
      'onDragEnter',
      'onDragLeave',
      'onDragOver',
      'onDragStart',
      'onDrop',
      'onMouseDown',
      'onMouseEnter',
      'onMouseLeave',
      'onMouseMove',
      'onMouseOut',
      'onMouseOver',
      'onMouseUp',
    ],
  },
  selection: { listeners: ['onSelect'] },
  touch: { listeners: ['onTouchCancel', 'onTouchEnd', 'onTouchMove', 'onTouchStart'] },
  ui: { listeners: ['onScroll'] },
  wheel: { listeners: ['onWheel'] },
}

/** `onKeyDown` -> `keyDown`, which is both the fireEvent method and the event name. */
export const toEventName = (listenerName) => _.camelCase(listenerName.replace('on', ''))

/**
 * React 17+ delegates focus through `focusin`/`focusout`, which `fireEvent.focus`
 * does not raise, so those two are exercised via `focusIn`/`focusOut` instead.
 */
const FIRE_EVENT_ALIASES = { focus: 'focusIn', blur: 'focusOut' }

export const fireEventName = (listenerName) => {
  const name = toEventName(listenerName)
  return FIRE_EVENT_ALIASES[name] || name
}

/**
 * React only calls `onChange`/`onInput` when the value actually changes, so a
 * bare `fireEvent.change(el)` looks to the conformance test like the handler
 * was never called. These listeners need an init that moves the value.
 */
const VALUE_DRIVEN = new Set(['onChange', 'onInput'])

export const fireEventInit = (listenerName) =>
  VALUE_DRIVEN.has(listenerName) ? { target: { value: 'conformance' } } : undefined

/** Every listener whose event testing-library can actually dispatch. */
export const dispatchableListeners = _.flatMap(types, ({ listeners }) => listeners).filter(
  (listenerName) => typeof fireEvent[fireEventName(listenerName)] === 'function',
)
