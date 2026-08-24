import React from 'react'
import { Loader, Image, Segment } from 'react-fomantic-ui'

const LoaderExampleDisabled = () => (
  <Segment>
    <Loader disabled />

    <Image src='/images/wireframe/short-paragraph.png' />
  </Segment>
)

export default LoaderExampleDisabled
