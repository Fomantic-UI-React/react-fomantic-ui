import React from 'react'
import {
  BreadcrumbSection,
  BreadcrumbDivider,
  Breadcrumb,
} from 'react-fomantic-ui'

const BreadcrumbExample = () => (
  <Breadcrumb>
    <BreadcrumbSection link>Home</BreadcrumbSection>
    <BreadcrumbDivider />
    <BreadcrumbSection link>Store</BreadcrumbSection>
    <BreadcrumbDivider />
    <BreadcrumbSection active>T-Shirt</BreadcrumbSection>
  </Breadcrumb>
)

export default BreadcrumbExample
