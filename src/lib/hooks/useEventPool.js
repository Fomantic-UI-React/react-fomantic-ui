import * as React from 'react'

/**
 * Members of each named pool, oldest first. Module-level because the point is
 * to order components that know nothing about each other.
 */
const pools = new Map()

/**
 * Joins a named event pool for as long as `enabled` is true, and returns a
 * function that says whether this component joined most recently. Components
 * sharing a pool check it before handling a document event, so that only the
 * newest reacts: one Escape closes the top Modal of a stack, not all of them.
 *
 * The `default` pool has no order, and everyone in it reacts.
 *
 * Replaces the pools of `@semantic-ui-react/event-stack`, which ordered members
 * by when they last re-subscribed. `<EventStack>` re-subscribes whenever its
 * handler changes, which for an inline handler is every render, so a parent
 * Modal re-rendering after its child opened put itself back on top.
 *
 * @param {String} pool A pool name.
 * @param {Boolean} enabled Whether to be a member of the pool.
 * @returns {Function} Returns true when this component is the newest member.
 */
export default function useEventPool(pool, enabled) {
  const member = React.useRef(null)

  if (member.current === null) {
    member.current = {}
  }

  React.useEffect(() => {
    if (!enabled || pool === 'default') {
      return undefined
    }

    const self = member.current
    pools.set(pool, [...(pools.get(pool) || []), self])

    return () => {
      const remaining = pools.get(pool).filter((other) => other !== self)

      if (remaining.length > 0) {
        pools.set(pool, remaining)
      } else {
        pools.delete(pool)
      }
    }
  }, [enabled, pool])

  return React.useCallback(() => {
    if (pool === 'default') {
      return true
    }

    const members = pools.get(pool)
    return !!members && members[members.length - 1] === member.current
  }, [pool])
}
