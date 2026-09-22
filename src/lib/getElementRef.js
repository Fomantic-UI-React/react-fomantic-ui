/**
 * Returns the ref passed to a React element, on React 18 and 19.
 *
 * React 19 moved the ref into `props` and warns when `element.ref` is read, but
 * only when a ref was passed — so `props.ref` is read first, and `element.ref`
 * is only reached on React 18 or when there is no ref to warn about.
 */
export default function getElementRef(element) {
  return element?.props?.ref ?? element?.ref
}
