import React from 'react'
import { Input } from 'react-fomantic-ui'

const InputExampleRightLabeledBasic = () => (
  <Input
    label={{ basic: true, content: 'kg' }}
    labelPosition='right'
    placeholder='Enter weight...'
  />
)

export default InputExampleRightLabeledBasic
