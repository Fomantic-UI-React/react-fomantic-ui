import * as ReactIs from 'react-is'

/** Gets a proper `displayName` for a component. */
export default function getComponentName(Component) {
  if (Component.$$typeof === ReactIs.Memo) {
    return getComponentName(Component.type)
  }

  if (Component.$$typeof === ReactIs.ForwardRef) {
    return Component.displayName
  }

  return Component.prototype?.constructor?.name
}
