import { render } from '@testing-library/react'
import React from 'react'

import useClassNamesOnNode from 'src/lib/hooks/useClassNamesOnNode'

function TestComponent(props) {
  useClassNamesOnNode(props.node, props.className)
  return null
}

describe('useClassNamesOnNode', () => {
  describe('node', () => {
    it('will add className to specified node', () => {
      const node = document.createElement('div')
      render(<TestComponent className='foo' node={node} />)

      expect(node.classList.contains('foo')).toBe(true)
    })

    it('will update className on specified node', () => {
      const node = document.createElement('div')
      const { rerender } = render(<TestComponent className='foo' node={node} />)

      rerender(<TestComponent className='bar' node={node} />)

      expect(node.classList.contains('foo')).toBe(false)
      expect(node.classList.contains('bar')).toBe(true)
    })

    it('will add multiple classNames', () => {
      const node = document.createElement('div')

      render(
        <>
          <TestComponent className='foo' node={node} />
          <TestComponent className='bar baz' node={node} />
        </>,
      )

      expect(node.classList.contains('foo')).toBe(true)
      expect(node.classList.contains('bar')).toBe(true)
      expect(node.classList.contains('baz')).toBe(true)
    })

    it('will remove className on specified node', () => {
      const node = document.createElement('div')
      const { unmount } = render(<TestComponent className='foo' node={node} />)

      expect(node.classList.contains('foo')).toBe(true)

      unmount()

      expect(node.classList.contains('foo')).toBe(false)
    })

    it('supports React ref objects', () => {
      const nodeRef = React.createRef()
      nodeRef.current = document.createElement('div')

      render(<TestComponent className='foo' node={nodeRef} />)

      expect(nodeRef.current.classList.contains('foo')).toBe(true)
    })
  })
})
