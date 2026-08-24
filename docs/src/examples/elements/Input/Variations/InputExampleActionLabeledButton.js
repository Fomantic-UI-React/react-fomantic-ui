import React from 'react'
import { Input } from 'react-fomantic-ui'

const InputExampleActionLabeledButton = () => (
  <Input
    action={{
      color: 'teal',
      labelPosition: 'right',
      icon: 'copy',
      content: 'Copy',
    }}
    defaultValue='http://ww.short.url/c0opq'
  />
)

export default InputExampleActionLabeledButton
