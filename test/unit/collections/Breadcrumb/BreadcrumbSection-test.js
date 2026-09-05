import { root } from 'test/support/rtl'

import userEvent from '@testing-library/user-event'
import React from 'react'

import BreadcrumbSection from 'src/collections/Breadcrumb/BreadcrumbSection'
import * as common from 'test/support/commonTests'

describe('BreadcrumbSection', () => {
  // Interactions go through user-event, which sends the pointer, focus and
  // keyboard sequence a browser does rather than the single event `fireEvent`
  // dispatches.
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  common.isConformant(BreadcrumbSection)
  common.forwardsRef(BreadcrumbSection)
  common.rendersChildren(BreadcrumbSection)

  common.propKeyOnlyToClassName(BreadcrumbSection, 'active')

  it('renders as a div by default', async () => {
    expect(root(<BreadcrumbSection />)).toHaveTagName('div')
  })

  describe('link', () => {
    it('is should be `a` when has prop link', async () => {
      expect(root(<BreadcrumbSection link />)).toHaveTagName('a')
    })
  })

  describe('href', () => {
    it('is not present by default', async () => {
      expect(root(<BreadcrumbSection />)).not.toHaveAttribute('href')
    })

    it('should have attr `href` when has prop', async () => {
      const section = root(<BreadcrumbSection href='http://example.com' />)

      expect(section).toHaveTagName('a')
      expect(section).toHaveAttribute('href', 'http://example.com')
    })
  })

  describe('onClick', () => {
    it('is called with (e, props) when clicked', async () => {
      const onClick = vi.fn()
      const props = { active: true, content: 'home' }

      await user.click(root(<BreadcrumbSection onClick={onClick} {...props} />))

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls[0][0]).toMatchObject({ type: 'click' })
      expect(onClick.mock.calls[0][1]).toMatchObject(props)
    })
  })
})
