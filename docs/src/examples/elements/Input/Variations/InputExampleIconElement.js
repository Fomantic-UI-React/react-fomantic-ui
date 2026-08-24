import React from 'react'
import { Icon, Input } from 'react-fomantic-ui'

const InputExampleIconElement = () => (
  <Input
    icon={<Icon name='search' inverted circular link />}
    placeholder='Search...'
  />
)

export default InputExampleIconElement
