import { dom, root } from 'test/support/rtl'
import React from 'react'

import Breadcrumb from 'src/collections/Breadcrumb/Breadcrumb'
import BreadcrumbDivider from 'src/collections/Breadcrumb/BreadcrumbDivider'
import BreadcrumbSection from 'src/collections/Breadcrumb/BreadcrumbSection'
import * as common from 'test/support/commonTests'

describe('Breadcrumb', () => {
  common.isConformant(Breadcrumb)
  common.forwardsRef(Breadcrumb)
  common.forwardsRef(Breadcrumb, { requiredProps: { children: <span /> } })
  common.hasSubcomponents(Breadcrumb, [BreadcrumbDivider, BreadcrumbSection])
  common.hasUIClassName(Breadcrumb)
  common.rendersChildren(Breadcrumb, {
    rendersContent: false,
  })

  it('renders a <div /> element', () => {
    expect(root(<Breadcrumb />)).toHaveTagName('div')
  })

  const sections = [
    { key: 'home', content: 'Home', link: true },
    { key: 't-shirt', content: 'T-Shirt', href: 'example.com' },
  ]

  it('renders children with `sections` prop', () => {
    const container = dom(<Breadcrumb sections={sections} />)

    expect(container.querySelectorAll('.divider')).toHaveLength(1)
    expect(container.querySelectorAll('.section')).toHaveLength(2)
  })

  it('renders defined divider with `divider` prop', () => {
    const container = dom(<Breadcrumb sections={sections} divider='>' />)

    expect(container.querySelector('.divider')).toHaveTextContent('>')
  })
})
