import React from 'react'
import { Checkbox, Segment } from 'react-fomantic-ui'

const CheckboxExampleFitted = () => (
  <div>
    <Segment compact>
      <Checkbox />
    </Segment>
    <Segment compact>
      <Checkbox slider />
    </Segment>
    <Segment compact>
      <Checkbox toggle />
    </Segment>
  </div>
)

export default CheckboxExampleFitted
