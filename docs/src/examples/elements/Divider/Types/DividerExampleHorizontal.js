import React from 'react'
import { Button, Divider, Input, Segment } from 'react-fomantic-ui'

const DividerExampleHorizontal = () => (
  <Segment basic textAlign='center'>
    <Input
      action={{ color: 'blue', content: 'Search' }}
      icon='search'
      iconPosition='left'
      placeholder='Order #'
    />

    <Divider horizontal>Or</Divider>

    <Button
      color='teal'
      content='Create New Order'
      icon='add'
      labelPosition='left'
    />
  </Segment>
)

export default DividerExampleHorizontal
