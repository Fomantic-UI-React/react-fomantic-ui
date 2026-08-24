import React from 'react'
import { Loader, Image, Segment } from 'react-fomantic-ui'

const LoaderExampleActive = () => (
  <Segment>
    <Loader active />

    <Image src='/images/wireframe/short-paragraph.png' />
  </Segment>
)

export default LoaderExampleActive
