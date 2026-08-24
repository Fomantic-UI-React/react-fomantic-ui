import React from 'react'
import {
  StepTitle,
  StepGroup,
  StepDescription,
  StepContent,
  Icon,
  Step,
} from 'react-fomantic-ui'

const StepExampleIcon = () => (
  <StepGroup>
    <Step>
      <Icon name='truck' />
      <StepContent>
        <StepTitle>Shipping</StepTitle>
        <StepDescription>Choose your shipping options</StepDescription>
      </StepContent>
    </Step>
  </StepGroup>
)

export default StepExampleIcon
