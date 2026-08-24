import React from 'react'
import { ButtonOr, ButtonGroup, Button } from 'react-fomantic-ui'

const ButtonExampleMultipleConditionals = () => (
  <ButtonGroup>
    <Button>One</Button>
    <ButtonOr />
    <Button>Two</Button>
    <ButtonOr />
    <Button>Three</Button>
  </ButtonGroup>
)

export default ButtonExampleMultipleConditionals
