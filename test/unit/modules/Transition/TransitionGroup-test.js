import { dom } from 'test/support/rtl'
import { render, waitFor } from '@testing-library/react'
import React from 'react'

import TransitionGroup from 'src/modules/Transition/TransitionGroup'
import * as common from 'test/support/commonTests'

describe('TransitionGroup', () => {
  common.isConformant(TransitionGroup, {
    rendersFragmentByDefault: true,
    rendersChildren: false,
  })
  common.forwardsRef(TransitionGroup, { requiredProps: { as: 'div' } })

  describe('children', () => {
    // Each child is wrapped in a Transition, which is observable as the
    // `transition` class and the animation name it applies.
    const childrenOf = (element) => [...dom(element).children]

    it('wraps all children to Transition', () => {
      const children = childrenOf(
        <TransitionGroup>
          <div />
          <div />
          <div />
        </TransitionGroup>,
      )

      expect(children).toHaveLength(3)
      for (const child of children) {
        expect(child).toHaveClass('transition')
      }
    })

    it('passes props to children', () => {
      const children = childrenOf(
        <TransitionGroup animation='scale' directional duration={1500}>
          <div />
          <div />
          <div />
        </TransitionGroup>,
      )

      for (const child of children) {
        expect(child).toHaveClass('scale')
        expect(child).toHaveClass('transition')
      }
    })

    it('wraps new child to Transition and sets transitionOnMount to true', () => {
      const { container, rerender } = render(
        <TransitionGroup>
          <div key='first' id='first' />
        </TransitionGroup>,
      )

      rerender(
        <TransitionGroup>
          <div key='first' id='first' />
          <div key='second' id='second' />
        </TransitionGroup>,
      )

      // transitionOnMount is observable as the new child entering rather than
      // appearing already entered.
      expect(container.querySelector('#second')).toHaveAttribute('data-test-status', 'ENTERING')
    })

    it('skips invalid children', () => {
      // An empty string, not null: React drops null itself, so only a string
      // child actually exercises TransitionGroup's own filtering.
      const invalidChild = ''

      const { container, rerender } = render(
        <TransitionGroup>
          <div key='first' id='first' />
        </TransitionGroup>,
      )

      rerender(
        <TransitionGroup>
          <div key='first' id='first' />
          {invalidChild}
          <div key='second' id='second' />
        </TransitionGroup>,
      )

      expect(container.children).toHaveLength(2)
      expect(container.querySelector('#first')).not.toBeNull()
      expect(container.querySelector('#second')).not.toBeNull()
    })

    it('sets visible to false when child was removed', () => {
      const { container, rerender } = render(
        <TransitionGroup>
          <div key='first' id='first' />
          <div key='second' id='second' />
        </TransitionGroup>,
      )

      rerender(
        <TransitionGroup>
          <div key='first' id='first' />
        </TransitionGroup>,
      )

      // The removed child stays mounted while it exits.
      expect(container.children).toHaveLength(2)
      expect(container.querySelector('#first')).toHaveAttribute('data-test-status', 'ENTERED')
      expect(container.querySelector('#second')).toHaveAttribute('data-test-status', 'EXITING')
    })

    it('removes child after transition', async () => {
      const { container, rerender } = render(
        <TransitionGroup duration={0}>
          <div key='first' id='first' />
          <div key='second' id='second' />
        </TransitionGroup>,
      )

      rerender(
        <TransitionGroup duration={0}>
          <div key='first' id='first' />
        </TransitionGroup>,
      )

      await waitFor(() => {
        expect(container.children).toHaveLength(1)
      })
      expect(container.querySelector('#first')).not.toBeNull()
    })
  })
})
