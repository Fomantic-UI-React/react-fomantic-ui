import { dom, root } from 'test/support/rtl'
import _ from 'lodash'
import { fireEvent } from '@testing-library/react'
import React from 'react'

import Menu from 'src/collections/Menu/Menu'
import MenuItem from 'src/collections/Menu/MenuItem'
import MenuHeader from 'src/collections/Menu/MenuHeader'
import MenuMenu from 'src/collections/Menu/MenuMenu'
import { SUI } from 'src/lib'
import * as common from 'test/support/commonTests'

describe('Menu', () => {
  common.isConformant(Menu)
  common.hasSubcomponents(Menu, [MenuHeader, MenuItem, MenuMenu])
  common.hasUIClassName(Menu)
  common.rendersChildren(Menu, {
    rendersContent: false,
  })

  common.implementsWidthProp(Menu, SUI.WIDTHS, {
    canEqual: false,
    propKey: 'widths',
  })

  common.propKeyAndValueToClassName(Menu, 'fixed', ['left', 'right', 'bottom', 'top'])

  common.propKeyOnlyToClassName(Menu, 'borderless')
  common.propKeyOnlyToClassName(Menu, 'compact')
  common.propKeyOnlyToClassName(Menu, 'fluid')
  common.propKeyOnlyToClassName(Menu, 'inverted')
  common.propKeyOnlyToClassName(Menu, 'pagination')
  common.propKeyOnlyToClassName(Menu, 'pointing')
  common.propKeyOnlyToClassName(Menu, 'secondary')
  common.propKeyOnlyToClassName(Menu, 'stackable')
  common.propKeyOnlyToClassName(Menu, 'text')
  common.propKeyOnlyToClassName(Menu, 'vertical')

  common.propKeyOrValueAndKeyToClassName(Menu, 'attached', ['top', 'bottom'])
  common.propKeyOrValueAndKeyToClassName(Menu, 'floated', ['right'])
  common.propKeyOrValueAndKeyToClassName(Menu, 'icon', ['labeled'])
  common.propKeyOrValueAndKeyToClassName(Menu, 'tabular', ['right'])

  common.propValueOnlyToClassName(Menu, 'color', SUI.COLORS)
  common.propValueOnlyToClassName(Menu, 'size', _.without(SUI.SIZES, 'medium', 'big'))

  it('renders a `div` by default', () => {
    expect(root(<Menu />)).toHaveTagName('div')
  })

  describe('activeIndex', () => {
    const items = [
      { key: 'home', name: 'home' },
      { key: 'users', name: 'users' },
    ]

    it('is null by default', () => {
      expect(dom(<Menu items={items} />).querySelector('.active')).toBeNull()
    })

    it('is set when clicking an item', () => {
      const container = dom(<Menu items={items} />)

      fireEvent.click(container.querySelectorAll('.item')[1])

      expect(container.querySelectorAll('.item')[1]).toHaveClass('active')
    })

    it('works as a string', () => {
      const container = dom(<Menu items={items} activeIndex={1} />)

      expect(container.querySelectorAll('.item')[1]).toHaveClass('active')
    })
  })

  describe('items', () => {
    // Heads up! The frozen spec shared one mounted wrapper across every test in
    // this block, so the click assertions depended on execution order. Each
    // test renders its own now.
    const items = [
      { key: 'home', name: 'home', 'data-foo': 'something' },
      { key: 'users', name: 'users', active: true, 'data-foo': 'something' },
    ]

    it('renders children', () => {
      const rendered = dom(<Menu items={items} />).querySelectorAll('.item')

      expect(rendered).toHaveLength(2)
      expect(rendered[0]).toHaveTextContent('Home')
      expect(rendered[1]).toHaveTextContent('Users')
    })

    it('onClick can be omitted', () => {
      const rendered = dom(<Menu items={items} />).querySelectorAll('.item')

      expect(() => fireEvent.click(rendered[1])).not.toThrow()
    })

    it('passes onClick handler', () => {
      const onClick = vi.fn()
      const withHandler = [{ ...items[0], onClick }, items[1]]

      fireEvent.click(dom(<Menu items={withHandler} />).querySelectorAll('.item')[0])

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls[0][1]).toMatchObject({ name: 'home', index: 0 })
    })

    it('passes arbitrary props', () => {
      for (const item of dom(<Menu items={items} />).querySelectorAll('.item')) {
        expect(item).toHaveAttribute('data-foo', 'something')
      }
    })

    it('marks the active item', () => {
      const rendered = dom(<Menu items={items} />).querySelectorAll('.item')

      expect(rendered[1]).toHaveClass('active')
    })

    it('marks the item at activeIndex', () => {
      const plain = items.map(({ active, ...rest }) => rest)
      const rendered = dom(<Menu items={plain} activeIndex={1} />).querySelectorAll('.item')

      expect(rendered[1]).toHaveClass('active')
    })
  })

  describe('onItemClick', () => {
    it('is called with (e, { name, index }) when clicked', () => {
      const onClick = vi.fn()
      const onItemClick = vi.fn()

      const items = [
        { key: 'home', name: 'home' },
        { key: 'users', name: 'users', onClick },
      ]
      const matchProps = { index: 1, name: 'users' }

      const rendered = dom(<Menu items={items} onItemClick={onItemClick} />).querySelectorAll(
        '.item',
      )
      fireEvent.click(rendered[1])

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls[0][1]).toMatchObject(matchProps)
      expect(onItemClick).toHaveBeenCalledTimes(1)
      expect(onItemClick.mock.calls[0][1]).toMatchObject(matchProps)
    })
  })
})
