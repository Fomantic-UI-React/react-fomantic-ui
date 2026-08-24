import React from 'react'
import { FormField, Form, Radio } from 'react-fomantic-ui'

const RadioExampleDisabled = () => (
  <Form>
    <FormField>
      <Radio label='Disabled' disabled />
    </FormField>
    <FormField>
      <Radio toggle label='Disabled' disabled />
    </FormField>
  </Form>
)

export default RadioExampleDisabled
