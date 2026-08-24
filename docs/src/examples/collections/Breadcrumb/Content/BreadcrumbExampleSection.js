import React from 'react'
import {
  BreadcrumbSection,
  BreadcrumbDivider,
  Breadcrumb,
} from 'react-fomantic-ui'

const BreadcrumbExampleSection = () => (
  <Breadcrumb>
    <BreadcrumbSection link>Home</BreadcrumbSection>
    <BreadcrumbDivider />
    <BreadcrumbSection active>Search</BreadcrumbSection>
  </Breadcrumb>
)

export default BreadcrumbExampleSection
