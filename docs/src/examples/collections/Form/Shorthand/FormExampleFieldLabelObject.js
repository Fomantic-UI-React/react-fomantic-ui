import React from 'react'
import { FormField, Checkbox, Form } from 'react-fomantic-ui'

const FormExampleFieldLabelObject = () => (
  <Form>
    <FormField
      control={Checkbox}
      label={{ children: 'I agree to the Terms and Conditions' }}
    />
  </Form>
)

export default FormExampleFieldLabelObject
