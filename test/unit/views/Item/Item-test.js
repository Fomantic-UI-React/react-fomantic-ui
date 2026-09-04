import { render } from '@testing-library/react'
import React from 'react'

import Item from 'src/views/Item/Item'
import ItemContent from 'src/views/Item/ItemContent'
import ItemDescription from 'src/views/Item/ItemDescription'
import ItemExtra from 'src/views/Item/ItemExtra'
import ItemGroup from 'src/views/Item/ItemGroup'
import ItemHeader from 'src/views/Item/ItemHeader'
import ItemImage from 'src/views/Item/ItemImage'
import ItemMeta from 'src/views/Item/ItemMeta'
import * as common from 'test/support/commonTests'

describe('Item', () => {
  common.isConformant(Item)
  common.forwardsRef(Item)
  common.forwardsRef(Item, { requiredProps: { children: <span /> } })
  common.forwardsRef(Item, { requiredProps: { content: 'word' } })
  common.hasSubcomponents(Item, [
    ItemContent,
    ItemDescription,
    ItemExtra,
    ItemGroup,
    ItemHeader,
    ItemImage,
    ItemMeta,
  ])
  common.rendersChildren(Item, { rendersContent: false })

  common.implementsShorthandProp(Item, {
    autoGenerateKey: false,
    propKey: 'image',
    ShorthandComponent: ItemImage,
    mapValueToProps: (val) => ({ src: val }),
  })

  // Each of these props routes through ItemContent, which renders `.content`.
  for (const propKey of ['content', 'description', 'extra', 'header', 'meta']) {
    describe(`${propKey} prop`, () => {
      it('renders ItemContent', () => {
        const { container } = render(<Item {...{ [propKey]: 'faker phrase text' }} />)

        expect(container.querySelector('.content')).not.toBeNull()
      })
    })
  }

  describe('image prop', () => {
    it('renders ItemImage', () => {
      const { container } = render(<Item image='/images/example.png' />)

      expect(container.querySelector('.image img')).toHaveAttribute('src', '/images/example.png')
    })
  })
})
