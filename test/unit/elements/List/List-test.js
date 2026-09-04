import { dom, root } from 'test/support/rtl'
import { fireEvent } from '@testing-library/react'
import React from 'react'

import List from 'src/elements/List/List'
import ListContent from 'src/elements/List/ListContent'
import ListDescription from 'src/elements/List/ListDescription'
import ListHeader from 'src/elements/List/ListHeader'
import ListIcon from 'src/elements/List/ListIcon'
import ListItem from 'src/elements/List/ListItem'
import ListList from 'src/elements/List/ListList'
import { SUI } from 'src/lib'
import * as common from 'test/support/commonTests'

describe('List', () => {
  common.isConformant(List)
  common.forwardsRef(List)
  common.forwardsRef(List, { requiredProps: { children: <span /> } })
  common.forwardsRef(List, { requiredProps: { content: 'word' } })
  common.hasSubcomponents(List, [
    ListContent,
    ListDescription,
    ListHeader,
    ListIcon,
    ListItem,
    ListList,
  ])
  common.hasUIClassName(List)
  common.rendersChildren(List)

  common.implementsVerticalAlignProp(List)

  common.propKeyAndValueToClassName(List, 'floated', SUI.FLOATS)

  common.propKeyOnlyToClassName(List, 'animated')
  common.propKeyOnlyToClassName(List, 'bulleted')
  common.propKeyOnlyToClassName(List, 'celled')
  common.propKeyOnlyToClassName(List, 'divided')
  common.propKeyOnlyToClassName(List, 'horizontal')
  common.propKeyOnlyToClassName(List, 'inverted')
  common.propKeyOnlyToClassName(List, 'link')
  common.propKeyOnlyToClassName(List, 'ordered')
  common.propKeyOnlyToClassName(List, 'selection')

  common.propKeyOrValueAndKeyToClassName(List, 'relaxed', ['very'])

  common.propValueOnlyToClassName(List, 'size', SUI.SIZES)

  const items = ['Name', 'Status', 'Notes']

  describe('onItemClick', () => {
    it('is called with (e, itemProps) when clicked', () => {
      const onClick = vi.fn()
      const onItemClick = vi.fn()

      const callbackData = { content: 'Notes', 'data-foo': 'bar' }
      const itemProps = { key: 'notes', content: 'Notes', 'data-foo': 'bar', onClick }

      const container = dom(<List items={[itemProps]} onItemClick={onItemClick} />)
      fireEvent.click(container.querySelector('.item'))

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls[0][0]).toMatchObject({ type: 'click' })
      expect(onClick.mock.calls[0][1]).toMatchObject(callbackData)

      expect(onItemClick).toHaveBeenCalledTimes(1)
      expect(onItemClick.mock.calls[0][0]).toMatchObject({ type: 'click' })
      expect(onItemClick.mock.calls[0][1]).toMatchObject(callbackData)
    })
  })

  describe('role', () => {
    it('is accessible with no items', () => {
      expect(root(<List />)).toHaveAttribute('role', 'list')
    })

    it('is accessible with items', () => {
      expect(root(<List items={items} />)).toHaveAttribute('role', 'list')
    })

    it('allows overriding with no items', () => {
      expect(root(<List role='listbox' />)).toHaveAttribute('role', 'listbox')
    })

    it('allows overriding with items', () => {
      expect(root(<List role='listbox' items={items} />)).toHaveAttribute('role', 'listbox')
    })

    it('allows overriding with children', () => {
      const list = root(
        <List role='listbox'>
          <ListItem />
        </List>,
      )

      expect(list).toHaveAttribute('role', 'listbox')
    })
  })

  describe('shorthand', () => {
    it('renders no items with no shorthand', () => {
      expect(dom(<List />).querySelectorAll('.item')).toHaveLength(0)
    })

    it('renders the items', () => {
      expect(dom(<List items={items} />).querySelectorAll('.item')).toHaveLength(items.length)
    })
  })
})
