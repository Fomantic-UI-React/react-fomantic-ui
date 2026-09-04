import { dom, root } from 'test/support/rtl'
import { fireEvent } from '@testing-library/react'
import React from 'react'

import Embed from 'src/modules/Embed/Embed'
import * as common from 'test/support/commonTests'

const assertIframeSrc = (props, srcPart) => {
  const { id = 'default-test-id', source = 'youtube', ...rest } = props

  const iframe = dom(<Embed active id={id} source={source} {...rest} />).querySelector('iframe')

  // Heads up! These expectations contain `&amp;` because Embed really does
  // build its URL that way, which means every parameter after the first is
  // named "amp;autoplay" and is ignored by the provider. See issue #19 —
  // change these to `&` as part of the fix, they are the regression test.
  expect(iframe.getAttribute('src')).toContain(srcPart)
}

describe('Embed', () => {
  common.isConformant(Embed)
  common.forwardsRef(Embed)
  common.hasUIClassName(Embed)
  common.rendersChildren(Embed, { requiredProps: { active: true } })

  common.implementsHTMLIFrameProp(Embed, {
    alwaysPresent: true,
    assertExactMatch: false,
    autoGenerateKey: false,
    requiredProps: {
      active: true,
      id: 'default-test-id',
      source: 'youtube',
    },
    shorthandDefaultProps: {
      allowFullScreen: false,
      frameBorder: 0,
      height: '100%',
      scrolling: 'no',
      title: 'Embedded content from youtube.',
      width: '100%',
    },
  })
  common.implementsIconProp(Embed, {
    alwaysPresent: true,
    autoGenerateKey: false,
  })

  common.propKeyOnlyToClassName(Embed, 'active')

  common.propValueOnlyToClassName(Embed, 'aspectRatio', ['4:3', '16:9', '21:9'])

  describe('active', () => {
    it('defaults to false', () => {
      expect(root(<Embed />)).not.toHaveClass('active')
    })

    it('applies className', () => {
      expect(root(<Embed active />)).toHaveClass('active')
    })

    it('renders nothing when false', () => {
      const container = dom(
        <Embed>
          <p id='foo' />
        </Embed>,
      )

      expect(container.querySelector('#foo')).toBeNull()
    })
  })

  describe('autoplay', () => {
    it('generates url part for source', () => {
      assertIframeSrc({ autoplay: true }, '&amp;autoplay=true')
      assertIframeSrc({ autoplay: false }, '&amp;autoplay=false')
    })
  })

  describe('brandedUI', () => {
    it('generates "modestbranding" url parameter', () => {
      assertIframeSrc({ brandedUI: true }, '&amp;modestbranding=true')
      assertIframeSrc({ brandedUI: false }, '&amp;modestbranding=false')
    })

    it('generates "rel" url parameter', () => {
      assertIframeSrc({ brandedUI: true }, '&amp;rel=0')
      assertIframeSrc({ brandedUI: false }, '&amp;rel=1')
    })
  })

  describe('color', () => {
    it('generates url part for source', () => {
      const color = 'red'
      assertIframeSrc({ color }, `&amp;color=${encodeURIComponent(color)}`)
    })
  })

  describe('defaultActive', () => {
    it('sets the initial active state', () => {
      expect(root(<Embed defaultActive />)).toHaveClass('active')
      expect(root(<Embed defaultActive={false} />)).not.toHaveClass('active')
    })
  })

  describe('hd', () => {
    it('generates url part for source', () => {
      assertIframeSrc({ hd: true }, '&amp;hq=true')
      assertIframeSrc({ hd: false }, '&amp;hq=false')
    })
  })

  describe('placeholder', () => {
    it('omitted by default', () => {
      expect(dom(<Embed />).querySelectorAll('img.placeholder')).toHaveLength(0)
    })

    it('renders img when defined', () => {
      const url = '/images/wireframe/image.png'

      expect(dom(<Embed placeholder={url} />).querySelector('img.placeholder')).toHaveAttribute(
        'src',
        url,
      )
    })
  })

  describe('onClick', () => {
    it('sets to active state', () => {
      const embed = root(<Embed />)

      fireEvent.click(embed)

      expect(embed).toHaveClass('active')
    })

    it('skips state update if active', () => {
      const embed = root(<Embed active />)

      fireEvent.click(embed)

      expect(embed).toHaveClass('active')
    })
  })

  describe('source', () => {
    it('generates url for YouTube', () => {
      const id = 'foo'

      assertIframeSrc({ id }, `//www.youtube.com/embed/${id}`)
    })

    it('generates url for Vimeo', () => {
      const id = 'foo'

      assertIframeSrc({ source: 'vimeo', id }, `//player.vimeo.com/video/${id}`)
    })

    it('sets the iframe title', () => {
      const sources = ['youtube', 'vimeo']

      sources.forEach((source) => {
        expect(
          dom(<Embed active id='foo' source={source} />).querySelector('iframe'),
        ).toHaveAttribute('title', `Embedded content from ${source}.`)
      })
    })
  })

  describe('url', () => {
    it('passes url to iframe', () => {
      const url = 'https://example.com'

      expect(dom(<Embed active url={url} />).querySelector('iframe')).toHaveAttribute('src', url)
    })
  })
})
