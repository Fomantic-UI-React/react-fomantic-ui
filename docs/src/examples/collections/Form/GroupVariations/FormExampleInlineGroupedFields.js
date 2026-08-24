import React from 'react'
import { FormGroup, FormField, Form, Input } from 'react-fomantic-ui'

const FormExampleInlineGroupedFields = () => (
  <Form>
    <FormGroup inline>
      <FormField>
        <label>Phone Number</label>
        <Input placeholder='(xxx)' />
      </FormField>
      <FormField>
        <Input placeholder='xxx' />
      </FormField>
      <FormField>
        <Input placeholder='xxxx' />
      </FormField>
    </FormGroup>
  </Form>
)

export default FormExampleInlineGroupedFields
