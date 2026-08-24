import React from 'react'
import { FormInput, FormGroup, Form } from 'react-fomantic-ui'

const FormExampleSubcomponentId = () => (
  <Form>
    <FormGroup widths='equal'>
      <FormInput
        fluid
        id='form-subcomponent-shorthand-input-first-name'
        label='First name'
        placeholder='First name'
      />
      <FormInput
        fluid
        id='form-subcomponent-shorthand-input-last-name'
        label='Last name'
        placeholder='Last name'
      />
    </FormGroup>
  </Form>
)

export default FormExampleSubcomponentId
