import React from 'react'
import { Icon, Label } from 'react-fomantic-ui'

const LabelExampleIcon = () => (
  <div>
    <Label as='a'>
      <Icon name='mail' />
      Mail
    </Label>
    <Label as='a'>
      Tag
      <Icon name='delete' />
    </Label>
  </div>
)

export default LabelExampleIcon
