import React from 'react'
import { Breadcrumb } from 'react-fomantic-ui'

const sections = [
  { key: 'home', content: 'Home', link: true },
  { key: 'registration', content: 'Registration', link: true },
  { key: 'info', content: 'Personal Information', active: true },
]

const BreadcrumbExampleDividerShorthand = () => (
  <Breadcrumb divider='/' sections={sections} />
)

export default BreadcrumbExampleDividerShorthand
