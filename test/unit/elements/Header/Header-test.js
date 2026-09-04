import { dom, root } from 'test/support/rtl'
import _ from 'lodash'
import React from 'react'

import Header from 'src/elements/Header/Header'
import HeaderContent from 'src/elements/Header/HeaderContent'
import HeaderSubheader from 'src/elements/Header/HeaderSubheader'
import { SUI } from 'src/lib'
import * as common from 'test/support/commonTests'

describe('Header', () => {
  common.hasUIClassName(Header)
  common.forwardsRef(Header, { requiredProps: { children: <span /> } })
  common.forwardsRef(Header, { requiredProps: { icon: 'book' } })
  common.hasSubcomponents(Header, [HeaderContent, HeaderSubheader])
  common.rendersChildren(Header)

  common.implementsIconProp(Header, { autoGenerateKey: false })
  common.implementsImageProp(Header, { autoGenerateKey: false })
  common.implementsShorthandProp(Header, {
    autoGenerateKey: false,
    propKey: 'subheader',
    ShorthandComponent: HeaderSubheader,
    mapValueToProps: (val) => ({ content: val }),
  })
  common.implementsTextAlignProp(Header)

  common.propKeyAndValueToClassName(Header, 'floated', SUI.FLOATS)

  common.propKeyOnlyToClassName(Header, 'block')
  common.propKeyOnlyToClassName(Header, 'disabled')
  common.propKeyOnlyToClassName(Header, 'dividing')
  common.propKeyOnlyToClassName(Header, 'inverted')
  common.propKeyOnlyToClassName(Header, 'sub')

  common.propKeyOrValueAndKeyToClassName(Header, 'attached', ['top', 'bottom'])

  common.propValueOnlyToClassName(Header, 'color', SUI.COLORS)
  common.propValueOnlyToClassName(Header, 'size', _.without(SUI.SIZES, 'big', 'massive', 'mini'))

  describe('icon', () => {
    it('adds an icon class when true', () => {
      expect(root(<Header icon />)).toHaveClass('icon')
    })
    it('does not add an icon class given a name', () => {
      expect(root(<Header icon='user' />)).not.toHaveClass('icon')
    })
  })

  describe('image', () => {
    it('adds an image class when true', () => {
      expect(root(<Header image />)).toHaveClass('image')
    })

    it('does not add an Image when true', () => {
      expect(dom(<Header image />).querySelector('img')).toBeNull()
    })
  })

  describe('content', () => {
    // HeaderContent renders `.content`; the assertion is that the text lands
    // inside that wrapper rather than as a bare child of the header.
    it('is wrapped in HeaderContent when there is an image src', () => {
      const container = dom(<Header image='/images/wireframe/image.png' content='Bar' />)

      expect(container.querySelector('.content')).toHaveTextContent('Bar')
    })

    it('is wrapped in HeaderContent when there is an icon name', () => {
      const container = dom(<Header icon='users' content='Friends' />)

      expect(container.querySelector('.content')).toHaveTextContent('Friends')
    })

    it('is not wrapped in HeaderContent when icon is true', () => {
      const container = dom(<Header icon content='Friends' />)

      expect(container).toHaveTextContent('Friends')
      expect(container.querySelector('.content')).toBeNull()
    })
  })

  describe('subheader', () => {
    const text = 'the subheader'

    it('adds HeaderSubheader as child when there is an icon', () => {
      const container = dom(<Header icon='user' subheader={text} />)

      expect(container.querySelector('.sub.header')).toHaveTextContent(text)
    })

    it('adds HeaderSubheader as child when there is an image', () => {
      const container = dom(<Header image='/images/wireframe/image.png' subheader={text} />)

      expect(container.querySelector('.sub.header')).toHaveTextContent(text)
    })
  })
})
