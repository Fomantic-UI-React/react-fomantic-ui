import { render } from '@testing-library/react'
import _ from 'lodash'
import React from 'react'

import { SUI } from 'src/lib'
import CardGroup from 'src/views/Card/CardGroup'
import * as common from 'test/support/commonTests'

describe('CardGroup', () => {
  common.isConformant(CardGroup)

  common.forwardsRef(CardGroup)
  common.forwardsRef(CardGroup, { requiredProps: { children: <span /> } })
  common.forwardsRef(CardGroup, { requiredProps: { content: 'word' } })

  common.hasUIClassName(CardGroup)
  common.rendersChildren(CardGroup)

  common.implementsTextAlignProp(CardGroup, _.without(SUI.TEXT_ALIGNMENTS, 'justified'))
  common.implementsWidthProp(CardGroup, SUI.WIDTHS, { propKey: 'itemsPerRow', canEqual: false })

  common.propKeyOnlyToClassName(CardGroup, 'centered')
  common.propKeyOnlyToClassName(CardGroup, 'doubling')
  common.propKeyOnlyToClassName(CardGroup, 'stackable')

  describe('renders children', () => {
    it('with `items` prop', () => {
      const items = [{ header: 'first header' }, { header: 'second header' }]
      const { container } = render(<CardGroup items={items} />)
      const headers = container.querySelectorAll('.card .header')

      expect(headers).toHaveLength(2)
      expect(headers[0]).toHaveTextContent('first header')
      expect(headers[1]).toHaveTextContent('second header')
    })
  })
})
