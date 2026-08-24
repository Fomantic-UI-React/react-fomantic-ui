import React from 'react'
import {
  BreadcrumbSection,
  BreadcrumbDivider,
  Breadcrumb,
} from 'react-fomantic-ui'

const BreadcrumbExampleDivider = () => (
  <Breadcrumb>
    <BreadcrumbSection link>Home</BreadcrumbSection>
    <BreadcrumbDivider>/</BreadcrumbDivider>
    <BreadcrumbSection link>Registration</BreadcrumbSection>
    <BreadcrumbDivider>/</BreadcrumbDivider>
    <BreadcrumbSection active>Personal Information</BreadcrumbSection>
  </Breadcrumb>
)

export default BreadcrumbExampleDivider
