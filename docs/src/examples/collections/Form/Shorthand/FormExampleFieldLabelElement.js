import React from 'react'
import { FormField, Checkbox, Form } from 'react-fomantic-ui'

const FormExampleFieldLabelElement = () => (
  <Form>
    <FormField
      control={Checkbox}
      label={<label>I agree to the Terms and Conditions</label>}
    />
  </Form>
)

export default FormExampleFieldLabelElement
