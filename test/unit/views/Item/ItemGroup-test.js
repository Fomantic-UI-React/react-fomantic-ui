import { render } from '@testing-library/react'
import React from 'react'

import ItemGroup from 'src/views/Item/ItemGroup'
import * as common from 'test/support/commonTests'

describe('ItemGroup', () => {
  common.isConformant(ItemGroup)
  common.forwardsRef(ItemGroup)
  common.forwardsRef(ItemGroup, { requiredProps: { children: <span /> } })
  common.forwardsRef(ItemGroup, { requiredProps: { content: 'word' } })
  common.hasUIClassName(ItemGroup)
  common.rendersChildren(ItemGroup)

  common.propKeyOnlyToClassName(ItemGroup, 'divided')
  common.propKeyOnlyToClassName(ItemGroup, 'link')
  common.propKeyOnlyToClassName(ItemGroup, 'unstackable')

  common.propKeyOrValueAndKeyToClassName(ItemGroup, 'relaxed', ['very'])

  describe('items prop', () => {
    it('renders children', () => {
      const items = [{ content: 'first content' }, { content: 'second content' }]
      const { container } = render(<ItemGroup items={items} />)
      const rendered = container.querySelectorAll('.item')

      expect(rendered).toHaveLength(2)
      expect(rendered[0].querySelector('.content')).toHaveTextContent('first content')
      expect(rendered[1].querySelector('.content')).toHaveTextContent('second content')
    })
  })
})
