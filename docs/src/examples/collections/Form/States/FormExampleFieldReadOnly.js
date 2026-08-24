import React from 'react'
import { FormInput, FormGroup, Form } from 'react-fomantic-ui'

const FormExampleFieldReadOnly = () => (
  <Form>
    <FormGroup widths='equal'>
      <FormInput fluid label='First name' placeholder='Read only' readOnly />
      <FormInput fluid label='Last name' placeholder='Read only' readOnly />
    </FormGroup>
  </Form>
)

export default FormExampleFieldReadOnly
