import React from 'react'
import { ButtonGroup, Button } from 'react-fomantic-ui'

const ButtonExampleGroupMixed = () => (
  <ButtonGroup>
    <Button labelPosition='left' icon='left chevron' content='Back' />
    <Button icon='stop' content='Stop' />
    <Button labelPosition='right' icon='right chevron' content='Forward' />
  </ButtonGroup>
)

export default ButtonExampleGroupMixed
