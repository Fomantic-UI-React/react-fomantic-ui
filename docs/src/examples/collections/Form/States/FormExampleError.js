import React from 'react'
import { FormInput, Button, Form, Message } from 'react-fomantic-ui'

const FormExampleError = () => (
  <Form error>
    <FormInput label='Email' placeholder='joe@schmoe.com' />
    <Message
      error
      header='Action Forbidden'
      content='You can only sign up for an account once with a given e-mail address.'
    />
    <Button>Submit</Button>
  </Form>
)

export default FormExampleError
