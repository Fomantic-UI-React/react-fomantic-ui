import React from 'react'
import { ButtonOr, ButtonGroup, Button } from 'react-fomantic-ui'

const ButtonExampleConditionalsCustom = () => (
  <ButtonGroup>
    <Button>un</Button>
    <ButtonOr text='ou' />
    <Button positive>deux</Button>
  </ButtonGroup>
)

export default ButtonExampleConditionalsCustom
