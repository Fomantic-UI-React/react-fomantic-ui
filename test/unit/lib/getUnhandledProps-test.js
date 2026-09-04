import { render } from '@testing-library/react'
import React from 'react'

import { getUnhandledProps } from 'src/lib'

// The util's intended usage: spread the unhandled props onto the rendered
// result, then assert on the attributes that reach the DOM.
function TestComponent(props) {
  return <div {...getUnhandledProps(TestComponent, props)} />
}

const root = (el) => render(el).container.firstElementChild

describe('getUnhandledProps', () => {
  it('removes the proprietary childKey prop', () => {
    expect(root(<TestComponent childKey={1} />)).not.toHaveAttribute('childKey')
  })

  it('leaves props that are not defined in handledProps', () => {
    expect(root(<TestComponent data-leave-this='it is unhandled' />)).toHaveAttribute(
      'data-leave-this',
      'it is unhandled',
    )
  })

  it('removes props defined in handledProps', () => {
    TestComponent.handledProps = ['data-remove-me']

    expect(root(<TestComponent data-remove-me='it is handled' />)).not.toHaveAttribute(
      'data-remove-me',
    )
  })
})
