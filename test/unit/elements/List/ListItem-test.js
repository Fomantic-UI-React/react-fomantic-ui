import { dom, root } from 'test/support/rtl'
import { fireEvent } from '@testing-library/react'
import React from 'react'

import ListItem from 'src/elements/List/ListItem'
import ListContent from 'src/elements/List/ListContent'
import * as common from 'test/support/commonTests'

describe('ListItem', () => {
  common.isConformant(ListItem)
  common.forwardsRef(ListItem)
  common.forwardsRef(ListItem, { requiredProps: { children: <span /> } })
  common.forwardsRef(ListItem, { requiredProps: { image: '/images/wireframe/image.png' } })
  common.rendersChildren(ListItem)

  common.propKeyOnlyToClassName(ListItem, 'active')
  common.propKeyOnlyToClassName(ListItem, 'disabled')

  describe('as', () => {
    it('omits className `list` when rendered as `li`', () => {
      expect(root(<ListItem as='li' />)).not.toHaveClass('item')
    })
  })

  describe('onClick', () => {
    it('is called with (e, data) when clicked', () => {
      const onClick = vi.fn()
      const props = { onClick, 'data-foo': 'bar' }

      fireEvent.click(root(<ListItem {...props} />))

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls[0][0]).toMatchObject({ type: 'click' })
      expect(onClick.mock.calls[0][1]).toMatchObject(props)
    })

    it('is not called when is disabled', () => {
      const onClick = vi.fn()

      fireEvent.click(root(<ListItem disabled onClick={onClick} />))

      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('value', () => {
    const value = 'the value'

    it('adds data attribute by default', () => {
      expect(root(<ListItem value={value} />)).toHaveAttribute('data-value', value)
    })

    it('adds attribute when rendered as `li`', () => {
      expect(root(<ListItem as='li' value={value} />)).toHaveAttribute('value', value)
    })
  })

  describe('shorthand', () => {
    const baseProps = {
      content: 'the content',
      description: 'the description',
      header: 'the header',
    }

    // ListContent renders `.content`; a flat ListItem puts header, description
    // and content directly in the item instead of wrapping them.
    it('renders without wrapping ListContent', () => {
      expect(dom(<ListItem {...baseProps} />).querySelectorAll('.content')).toHaveLength(0)
    })

    it('renders without wrapping ListContent when content passed as element', () => {
      const create = vi.spyOn(ListContent, 'create')

      dom(<ListItem {...baseProps} content={<div />} />)

      expect(create).not.toHaveBeenCalled()
    })

    it('renders wrapping ListContent when content passed as props', () => {
      expect(dom(<ListItem content={baseProps} />).querySelectorAll('.content')).toHaveLength(1)
    })

    for (const key of Object.keys(baseProps)) {
      it(`renders wrapping ListContent when icon and ${key} present`, () => {
        const container = dom(<ListItem {...{ [key]: baseProps[key] }} icon='user' />)

        expect(container.querySelectorAll('i.icon')).toHaveLength(1)
        expect(container.querySelectorAll('.content')).toHaveLength(1)
      })

      it(`renders wrapping ListContent when image and ${key} present`, () => {
        const container = dom(
          <ListItem {...{ [key]: baseProps[key] }} image='/images/wireframe/image.png' />,
        )

        expect(container.querySelectorAll('img')).toHaveLength(1)
        expect(container.querySelectorAll('.content')).toHaveLength(1)
      })
    }
  })

  describe('role', () => {
    it('adds role=listitem', () => {
      expect(root(<ListItem />)).toHaveAttribute('role', 'listitem')
    })

    it('adds role=listitem with children', () => {
      expect(
        root(
          <ListItem>
            <div>Test</div>
          </ListItem>,
        ),
      ).toHaveAttribute('role', 'listitem')
    })

    it('adds role=listitem with content', () => {
      expect(root(<ListItem content={<div />} />)).toHaveAttribute('role', 'listitem')
    })

    it('adds role=listitem with icon', () => {
      expect(root(<ListItem icon='user' />)).toHaveAttribute('role', 'listitem')
    })

    it('allows role override without children', () => {
      expect(root(<ListItem role='option' />)).toHaveAttribute('role', 'option')
    })

    it('allows role override with children', () => {
      expect(
        root(
          <ListItem role='option'>
            <div>Test</div>
          </ListItem>,
        ),
      ).toHaveAttribute('role', 'option')
    })

    it('allows role override with content', () => {
      expect(root(<ListItem role='option' content={<div />} />)).toHaveAttribute('role', 'option')
    })

    it('allows role override with icon', () => {
      expect(root(<ListItem role='option' icon='user' />)).toHaveAttribute('role', 'option')
    })
  })
})
