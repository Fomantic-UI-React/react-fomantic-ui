import React from 'react'
import { FormInput, Button, Form } from 'react-fomantic-ui'

const FormExampleLoading = () => (
  <Form loading>
    <FormInput label='Email' placeholder='joe@schmoe.com' />
    <Button>Submit</Button>
  </Form>
)

export default FormExampleLoading
