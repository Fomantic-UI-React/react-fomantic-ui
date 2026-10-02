import { render } from '@testing-library/react'
import React from 'react'

import useEventPool from 'src/lib/hooks/useEventPool'

// Renders one pool member per name, in order, and exposes each one's check.
function Members({ checks, enabled = {}, names, pool }) {
  return names.map((name) => (
    <Member
      enabled={enabled[name] !== false}
      key={name}
      onCheck={(check) => checks.set(name, check)}
      pool={pool}
    />
  ))
}

function Member({ enabled, onCheck, pool }) {
  onCheck(useEventPool(pool, enabled))
  return null
}

describe('useEventPool', () => {
  it('makes the newest member of a named pool the only one to react', () => {
    const checks = new Map()
    const view = render(<Members checks={checks} names={['a']} pool='test' />)
    expect(checks.get('a')()).toBe(true)

    view.rerender(<Members checks={checks} names={['a', 'b']} pool='test' />)
    expect(checks.get('a')()).toBe(false)
    expect(checks.get('b')()).toBe(true)
  })

  it('hands back to the previous member when the newest leaves', () => {
    const checks = new Map()
    const view = render(<Members checks={checks} names={['a']} pool='test' />)
    view.rerender(<Members checks={checks} names={['a', 'b']} pool='test' />)

    view.rerender(<Members checks={checks} enabled={{ b: false }} names={['a', 'b']} pool='test' />)
    expect(checks.get('a')()).toBe(true)
    expect(checks.get('b')()).toBe(false)

    view.unmount()
  })

  it('keeps its place when it re-renders', () => {
    const checks = new Map()
    const view = render(<Members checks={checks} names={['a']} pool='test' />)
    view.rerender(<Members checks={checks} names={['a', 'b']} pool='test' />)

    // A re-render of the older member must not put it back on top.
    view.rerender(<Members checks={checks} names={['a', 'b']} pool='test' />)
    expect(checks.get('a')()).toBe(false)
    expect(checks.get('b')()).toBe(true)

    view.unmount()
  })

  it('keeps separate pools separate', () => {
    const checks = new Map()
    render(
      <>
        <Members checks={checks} names={['a']} pool='one' />
        <Members checks={checks} names={['b']} pool='two' />
      </>,
    )

    expect(checks.get('a')()).toBe(true)
    expect(checks.get('b')()).toBe(true)
  })

  it('lets every member of the default pool react', () => {
    const checks = new Map()
    render(<Members checks={checks} names={['a', 'b']} pool='default' />)

    expect(checks.get('a')()).toBe(true)
    expect(checks.get('b')()).toBe(true)
  })
})
