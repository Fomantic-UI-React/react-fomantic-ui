import { dom, root } from 'test/support/rtl'
import _ from 'lodash'
import { render } from '@testing-library/react'
import React from 'react'

import { SUI } from 'src/lib'
import Progress from 'src/modules/Progress/Progress'
import * as common from 'test/support/commonTests'

describe('Progress', () => {
  common.isConformant(Progress)
  common.forwardsRef(Progress)
  common.hasUIClassName(Progress)
  common.rendersChildren(Progress)

  common.propKeyAndValueToClassName(Progress, 'attached', ['top', 'bottom'])

  common.propKeyOnlyToClassName(Progress, 'active')
  common.propKeyOnlyToClassName(Progress, 'disabled')
  common.propKeyOnlyToClassName(Progress, 'error')
  common.propKeyOnlyToClassName(Progress, 'indicating')
  common.propKeyOnlyToClassName(Progress, 'inverted')
  common.propKeyOnlyToClassName(Progress, 'success')
  common.propKeyOnlyToClassName(Progress, 'warning')

  common.propValueOnlyToClassName(Progress, 'color', SUI.COLORS)
  common.propValueOnlyToClassName(Progress, 'size', _.without(SUI.SIZES, 'mini', 'huge', 'massive'))

  it('contains div with className bar', () => {
    const bar = dom(<Progress />).querySelector('.bar')

    expect(bar).not.toBeNull()
    expect(bar).toHaveTagName('div')
  })

  describe('attached', () => {
    it('removes the progress label from the bar', () => {
      expect(
        dom(<Progress attached='top' />)
          .querySelector('.bar')
          .querySelector('.progress'),
      ).toBeNull()
    })
  })

  describe('autoSuccess', () => {
    it('applies the success class when percent >= 100%', () => {
      const { container, rerender } = render(<Progress autoSuccess />)
      const progress = () => container.firstElementChild

      rerender(<Progress autoSuccess percent={100} />)
      expect(progress()).toHaveClass('success')

      rerender(<Progress autoSuccess percent={99} />)
      expect(progress()).not.toHaveClass('success')

      rerender(<Progress autoSuccess percent={101} />)
      expect(progress()).toHaveClass('success')
    })
    it('applies the success class when value >= total', () => {
      const { container, rerender } = render(<Progress autoSuccess />)
      const progress = () => container.firstElementChild

      rerender(<Progress autoSuccess total={1} value={1} />)
      expect(progress()).toHaveClass('success')

      rerender(<Progress autoSuccess total={1} value={0} />)
      expect(progress()).not.toHaveClass('success')

      rerender(<Progress autoSuccess total={1} value={2} />)
      expect(progress()).toHaveClass('success')
    })
  })

  describe('bar', () => {
    it('has a width equal to the percent complete', () => {
      expect(dom(<Progress percent={33.333} />).querySelector('.bar')).toHaveStyle({
        width: '33.333%',
      })
    })
    it('cannot have its width set >100%', () => {
      expect(dom(<Progress percent={101} />).querySelector('.bar')).toHaveStyle({ width: '100%' })
    })
    it('cannot have its width set <0%', () => {
      expect(dom(<Progress percent={-1} />).querySelector('.bar')).toHaveStyle({ width: '0%' })
    })
    it('has a width equal to the percentage of the value of the total, when progress="value"', () => {
      expect(
        dom(<Progress progress='value' value={5} total={10} />).querySelector('.bar'),
      ).toHaveStyle({ width: '50%' })
    })
  })

  describe('data-percent', () => {
    it('adds prop by default', () => {
      expect(root(<Progress />)).toHaveAttribute('data-percent')
    })

    it('passes value of percent prop', () => {
      expect(root(<Progress percent={10} />)).toHaveAttribute('data-percent', String(10))
    })

    it('floors the value of percent prop', () => {
      expect(root(<Progress percent={8.28} />)).toHaveAttribute('data-percent', String(8))
    })

    it('floors the results value and total props', () => {
      expect(root(<Progress value={828} total={10000} />)).toHaveAttribute(
        'data-percent',
        String(8),
      )
    })
  })

  describe('indicating', () => {
    it('adds the "active" class', () => {
      expect(root(<Progress indicating />)).toHaveClass('active')
    })
  })

  describe('label', () => {
    it('shows the label text when provided', () => {
      expect(dom(<Progress label='some-label' />).querySelector('.label')).toHaveTextContent(
        'some-label',
      )
    })
  })

  describe('progress', () => {
    it('hides the progress text by default', () => {
      expect(
        dom(<Progress />)
          .querySelector('.bar')
          .querySelector('.progress'),
      ).toBeNull()
    })
    it('shows the progress text when true', () => {
      expect(
        dom(<Progress progress />)
          .querySelector('.bar')
          .querySelector('.progress'),
      ).not.toBeNull()
    })
    it('hides the progress text when false', () => {
      expect(
        dom(<Progress progress={false} />)
          .querySelector('.bar')
          .querySelector('.progress'),
      ).toBeNull()
    })
    it('displays the progress as a percentage by default', () => {
      const progress = dom(<Progress percent={20} progress />).querySelector('.progress')

      expect(progress).not.toBeNull()
      expect(progress).toHaveTextContent('20%')
    })
    it('displays the progress as a ratio when set to "ratio"', () => {
      expect(
        dom(<Progress progress='ratio' value={1} total={2} />).querySelector('.progress'),
      ).toHaveTextContent('1/2')
    })
    it('displays the progress as a percentage when set to "percent"', () => {
      expect(
        dom(<Progress progress='percent' value={1} total={2} />).querySelector('.progress'),
      ).toHaveTextContent('50%')
    })
    it('displays the progress as text when set to "value"', () => {
      expect(
        dom(<Progress progress='value' value={1} total={2} />).querySelector('.progress'),
      ).toHaveTextContent('1')
    })
    it('shows the percent complete', () => {
      expect(dom(<Progress percent={72} progress />).querySelector('.progress')).toHaveTextContent(
        '72%',
      )
    })
    it('cannot be set >100%', () => {
      expect(dom(<Progress percent={101} progress />).querySelector('.progress')).toHaveTextContent(
        '100%',
      )
    })
    it('cannot be set <0%', () => {
      expect(dom(<Progress percent={-1} progress />).querySelector('.progress')).toHaveTextContent(
        '0%',
      )
    })
    it('displays values with a decimal', () => {
      expect(
        dom(<Progress percent={10.12345} progress />).querySelector('.progress'),
      ).toHaveTextContent('10.12345%')
    })
    it('displays values without a decimal', () => {
      expect(dom(<Progress percent={35} progress />).querySelector('.progress')).toHaveTextContent(
        '35%',
      )
    })
  })

  describe('precision', () => {
    it('rounds the progress label to 0 decimal places by default', () => {
      expect(
        dom(<Progress percent={10.12345} precision={0} />).querySelector('.progress'),
      ).toHaveTextContent('10%')
    })
    it('removes the decimal from progress label when set to 0', () => {
      expect(
        dom(<Progress percent={10.12345} precision={0} />).querySelector('.progress'),
      ).toHaveTextContent('10%')
    })
    it('rounds the decimal in the progress label to the number of digits', () => {
      expect(
        dom(<Progress percent={10.12345} precision={1} />).querySelector('.progress'),
      ).toHaveTextContent('10.1%')

      expect(
        dom(<Progress percent={10.12345} precision={4} />).querySelector('.progress'),
      ).toHaveTextContent('10.1235%')
    })
  })

  describe('total/value', () => {
    it('calculates the percent complete', () => {
      expect(
        dom(<Progress value={1} total={2} progress />).querySelector('.progress'),
      ).toHaveTextContent('50%')
    })
  })
})
