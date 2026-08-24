import React from 'react'
import { Icon } from 'react-fomantic-ui'

const IconExampleFitted = () => (
  <div>
    This icon
    <Icon fitted name='help' />
    is fitted.
    <br />
    This icon
    <Icon name='help' />
    is not.
  </div>
)

export default IconExampleFitted
