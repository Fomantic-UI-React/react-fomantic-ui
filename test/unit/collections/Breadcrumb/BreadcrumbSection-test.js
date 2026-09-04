import { root } from 'test/support/rtl'
import { fireEvent } from '@testing-library/react'
import React from 'react'

import BreadcrumbSection from 'src/collections/Breadcrumb/BreadcrumbSection'
import * as common from 'test/support/commonTests'

describe('BreadcrumbSection', () => {
  common.isConformant(BreadcrumbSection)
  common.forwardsRef(BreadcrumbSection)
  common.rendersChildren(BreadcrumbSection)

  common.propKeyOnlyToClassName(BreadcrumbSection, 'active')

  it('renders as a div by default', () => {
    expect(root(<BreadcrumbSection />)).toHaveTagName('div')
  })

  describe('link', () => {
    it('is should be `a` when has prop link', () => {
      expect(root(<BreadcrumbSection link />)).toHaveTagName('a')
    })
  })

  describe('href', () => {
    it('is not present by default', () => {
      expect(root(<BreadcrumbSection />)).not.toHaveAttribute('href')
    })

    it('should have attr `href` when has prop', () => {
      const section = root(<BreadcrumbSection href='http://example.com' />)

      expect(section).toHaveTagName('a')
      expect(section).toHaveAttribute('href', 'http://example.com')
    })
  })

  describe('onClick', () => {
    it('is called with (e, props) when clicked', () => {
      const onClick = vi.fn()
      const props = { active: true, content: 'home' }

      fireEvent.click(root(<BreadcrumbSection onClick={onClick} {...props} />))

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls[0][0]).toMatchObject({ type: 'click' })
      expect(onClick.mock.calls[0][1]).toMatchObject(props)
    })
  })
})
