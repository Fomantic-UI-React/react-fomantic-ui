import { dom, root } from 'test/support/rtl'
import _ from 'lodash'
import React from 'react'

import Image from 'src/elements/Image/Image'
import ImageGroup from 'src/elements/Image/ImageGroup'
import { htmlImageProps, SUI } from 'src/lib'
import Dimmer from 'src/modules/Dimmer/Dimmer'
import * as common from 'test/support/commonTests'

describe('Image', () => {
  common.isConformant(Image)

  common.forwardsRef(Image, { tagName: 'img' })
  common.forwardsRef(Image, {
    requiredProps: { as: 'div', children: <span /> },
    tagName: 'div',
  })
  common.forwardsRef(Image, {
    requiredProps: { as: 'div', content: <span /> },
    tagName: 'div',
  })
  common.forwardsRef(Image, {
    requiredProps: { label: 'word' },
    tagName: 'img',
  })

  common.hasSubcomponents(Image, [ImageGroup])
  common.hasUIClassName(Image)
  // rendersContent is off because `<Image content='...' />` throws: content is
  // rendered into a void <img>. See issue #11 — remove this option with the fix,
  // it is the regression test. The Enzyme suite passed it only because
  // shallow() never rendered to a DOM.
  common.rendersChildren(Image, { rendersContent: false })

  common.implementsCreateMethod(Image)
  common.implementsLabelProp(Image, { autoGenerateKey: false })
  common.implementsShorthandProp(Image, {
    autoGenerateKey: false,
    propKey: 'dimmer',
    ShorthandComponent: Dimmer,
    mapValueToProps: (val) => ({ content: val }),
  })
  common.implementsVerticalAlignProp(Image)

  common.propKeyAndValueToClassName(Image, 'floated', SUI.FLOATS)

  common.propKeyOnlyToClassName(Image, 'avatar')
  common.propKeyOnlyToClassName(Image, 'bordered')
  common.propKeyOnlyToClassName(Image, 'centered')
  common.propKeyOnlyToClassName(Image, 'circular')
  common.propKeyOnlyToClassName(Image, 'disabled')
  common.propKeyOnlyToClassName(Image, 'fluid')
  common.propKeyOnlyToClassName(Image, 'hidden')
  common.propKeyOnlyToClassName(Image, 'inline')
  common.propKeyOnlyToClassName(Image, 'rounded')

  common.propKeyOrValueAndKeyToClassName(Image, 'spaced', ['left', 'right'])

  common.propValueOnlyToClassName(Image, 'size', SUI.SIZES)

  describe('as', () => {
    it('renders "i" by default', () => {
      expect(root(<Image />)).toHaveTagName('img')
    })
  })

  describe('href', () => {
    it('renders an a tag', () => {
      expect(root(<Image href='http://example.com' />)).toHaveTagName('a')
    })
  })

  describe('image props', () => {
    _.forEach(htmlImageProps, (propName) => {
      it(`keeps "${propName}" on root element by default`, () => {
        const image = root(<Image {...{ [propName]: 'foo' }} />)

        expect(image).toHaveTagName('img')
        expect(image).toHaveAttribute(propName.toLowerCase(), 'foo')
      })

      it(`passes "${propName}" to the img tag when wrapped`, () => {
        expect(
          dom(<Image wrapped {...{ [propName]: 'foo' }} />).querySelector('img'),
        ).toHaveAttribute(propName.toLowerCase(), 'foo')
      })
    })
  })

  describe('ui', () => {
    it('is true by default', () => {
      expect(root(<Image />)).toHaveClass('ui')
    })
    it('adds the "ui" className when true', () => {
      expect(root(<Image ui />)).toHaveClass('ui')
    })
    it('removes the "ui" className when false', () => {
      expect(root(<Image ui={false} />)).not.toHaveClass('ui')
    })
  })

  describe('wrapped', () => {
    it('renders an div tag when true', () => {
      expect(root(<Image wrapped />)).toHaveTagName('div')
    })
  })
})
