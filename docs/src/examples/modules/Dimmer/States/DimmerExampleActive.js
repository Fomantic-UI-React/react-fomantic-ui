import React from 'react'
import { Dimmer, Image, Segment } from 'react-fomantic-ui'

const DimmerExampleActive = () => (
  <Segment>
    <Dimmer active />

    <p>
      <Image src='/images/wireframe/short-paragraph.png' />
    </p>
    <p>
      <Image src='/images/wireframe/short-paragraph.png' />
    </p>
  </Segment>
)

export default DimmerExampleActive
