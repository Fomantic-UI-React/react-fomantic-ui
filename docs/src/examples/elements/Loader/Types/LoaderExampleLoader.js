import React from 'react'
import { Dimmer, Loader, Image, Segment } from 'react-fomantic-ui'

const LoaderExampleLoader = () => (
  <Segment>
    <Dimmer active>
      <Loader />
    </Dimmer>

    <Image src='/images/wireframe/short-paragraph.png' />
  </Segment>
)

export default LoaderExampleLoader
