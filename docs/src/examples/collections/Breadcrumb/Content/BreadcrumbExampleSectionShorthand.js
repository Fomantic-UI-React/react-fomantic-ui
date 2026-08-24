import React from 'react'
import { Breadcrumb } from 'react-fomantic-ui'

const sections = [
  { key: 'home', content: 'Home', link: true },
  { key: 'search', content: 'Search', active: true },
]

const BreadcrumbExampleSectionShorthand = () => (
  <Breadcrumb sections={sections} />
)

export default BreadcrumbExampleSectionShorthand
