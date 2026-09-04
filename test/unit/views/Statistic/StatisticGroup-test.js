import { render } from '@testing-library/react'
import _ from 'lodash'
import React from 'react'

import { SUI } from 'src/lib'
import StatisticGroup from 'src/views/Statistic/StatisticGroup'
import * as common from 'test/support/commonTests'

describe('StatisticGroup', () => {
  common.isConformant(StatisticGroup)
  common.forwardsRef(StatisticGroup)
  common.forwardsRef(StatisticGroup, { requiredProps: { children: <span /> } })
  common.forwardsRef(StatisticGroup, { requiredProps: { content: 'word' } })
  common.hasUIClassName(StatisticGroup)
  common.rendersChildren(StatisticGroup)

  common.implementsWidthProp(StatisticGroup, SUI.WIDTHS, {
    canEqual: false,
    propKey: 'widths',
  })

  common.propKeyOnlyToClassName(StatisticGroup, 'horizontal')
  common.propKeyOnlyToClassName(StatisticGroup, 'inverted')

  common.propValueOnlyToClassName(StatisticGroup, 'color', SUI.COLORS)
  common.propValueOnlyToClassName(
    StatisticGroup,
    'size',
    _.without(SUI.SIZES, 'big', 'massive', 'medium'),
  )

  describe('items', () => {
    it('renders children', () => {
      const { container } = render(<StatisticGroup items={['foo', 'bar']} />)
      const items = container.querySelectorAll('.statistic')

      expect(items).toHaveLength(2)
      expect(items[0]).toHaveTextContent('foo')
      expect(items[1]).toHaveTextContent('bar')
    })
  })
})
