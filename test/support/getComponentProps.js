import * as ReactIs from 'react-is'

/** Gets the static prop metadata a component carries. */
export default function getComponentProps(Component) {
  if (Component.$$typeof === ReactIs.Memo) {
    return getComponentProps(Component.type)
  }

  return {
    autoControlledProps: Component.autoControlledProps,
    handledProps: Component.handledProps,
    propTypes: Component.propTypes,
  }
}
