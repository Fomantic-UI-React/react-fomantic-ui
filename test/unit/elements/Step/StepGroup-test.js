import _ from 'lodash'
import React from 'react'

import StepGroup from 'src/elements/Step/StepGroup'
import { numberToWordMap } from 'src/lib'
import * as common from 'test/support/commonTests'
import { dom } from 'test/support/rtl'

const numberMap = _.pickBy(numberToWordMap, (val, key) => key <= 8)

describe('StepGroup', () => {
  common.isConformant(StepGroup)
  common.forwardsRef(StepGroup)
  common.forwardsRef(StepGroup, { requiredProps: { content: 'word' } })
  common.forwardsRef(StepGroup, { requiredProps: { children: <span /> } })
  common.hasUIClassName(StepGroup)
  common.rendersChildren(StepGroup)

  common.implementsWidthProp(
    StepGroup,
    [..._.keys(numberMap), ..._.keys(numberMap).map(Number), ..._.values(numberMap)],
    {
      canEqual: false,
      propKey: 'widths',
    },
  )

  common.propKeyAndValueToClassName(StepGroup, 'stackable', ['tablet'])

  common.propKeyOnlyToClassName(StepGroup, 'fluid')
  common.propKeyOnlyToClassName(StepGroup, 'ordered')
  common.propKeyOnlyToClassName(StepGroup, 'vertical')

  common.propKeyOrValueAndKeyToClassName(StepGroup, 'attached', ['top', 'bottom'])

  describe('items', () => {
    it('renders children', () => {
      const steps = dom(<StepGroup items={['foo', 'bar']} />).querySelectorAll('.step')

      expect(steps).toHaveLength(2)
      expect(steps[0]).toHaveTextContent('foo')
      expect(steps[1]).toHaveTextContent('bar')
    })
  })
})
