import React from 'react'
import { Radio, Segment } from 'react-fomantic-ui'

const RadioExampleFitted = () => (
  <div>
    <Segment compact>
      <Radio />
    </Segment>
    <Segment compact>
      <Radio slider />
    </Segment>
    <Segment compact>
      <Radio toggle />
    </Segment>
  </div>
)

export default RadioExampleFitted
