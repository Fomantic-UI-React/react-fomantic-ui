import React from 'react'
import { IconGroup, Icon } from 'react-fomantic-ui'

const IconExampleCornerGroupPositions = () => (
  <>
    <IconGroup size='huge'>
      <Icon name='puzzle' />
      <Icon corner='top left' name='add' />
    </IconGroup>

    <IconGroup size='huge'>
      <Icon name='puzzle' />
      <Icon corner='top right' name='add' />
    </IconGroup>

    <IconGroup size='huge'>
      <Icon name='puzzle' />
      <Icon corner='bottom left' name='add' />
    </IconGroup>

    <IconGroup size='huge'>
      <Icon name='puzzle' />
      <Icon corner='bottom right' name='add' />
    </IconGroup>
  </>
)

export default IconExampleCornerGroupPositions
