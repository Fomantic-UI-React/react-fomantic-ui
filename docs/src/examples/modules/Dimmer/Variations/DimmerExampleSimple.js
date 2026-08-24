import React from 'react'
import { DimmerDimmable, Dimmer, Image, Segment } from 'react-fomantic-ui'

const DimmerExampleSimple = () => (
  <DimmerDimmable as={Segment} dimmed>
    <Dimmer simple />

    <p>
      <Image src='/images/wireframe/short-paragraph.png' />
    </p>
    <p>
      <Image src='/images/wireframe/short-paragraph.png' />
    </p>
  </DimmerDimmable>
)

export default DimmerExampleSimple
