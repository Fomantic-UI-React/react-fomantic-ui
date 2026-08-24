import React from 'react'
import {
  FormInput,
  FormGroup,
  FormCheckbox,
  Button,
  Form,
} from 'react-fomantic-ui'

const FormExampleUnstackable = () => (
  <Form unstackable>
    <FormGroup widths={2}>
      <FormInput label='First name' placeholder='First name' />
      <FormInput label='Last name' placeholder='Last name' />
    </FormGroup>
    <FormCheckbox label='I agree to the Terms and Conditions' />
    <Button type='submit'>Submit</Button>
  </Form>
)
export default FormExampleUnstackable
