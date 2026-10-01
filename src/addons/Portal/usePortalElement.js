import * as React from 'react'
import * as ReactIs from 'react-is'

import { getElementRef, useMergedRefs } from '../../lib'

/**
 * Assigns merged ref to an existing element is possible or wraps it with an additional "div".
 *
 * @param {React.ReactNode} node
 * @param {React.Ref} userRef
 */
export default function usePortalElement(node, userRef) {
  const ref = useMergedRefs(getElementRef(node), userRef)

  if (React.isValidElement(node)) {
    // Compares the type rather than calling `ReactIs.isForwardRef(node)`, which
    // only recognises elements created by the same major version of React.
    if (node.type?.$$typeof === ReactIs.ForwardRef) {
      return React.cloneElement(node, { ref })
    }

    if (typeof node.type === 'string') {
      return React.cloneElement(node, { ref })
    }
  }

  return (
    <div data-suir-portal='true' ref={ref}>
      {node}
    </div>
  )
}
