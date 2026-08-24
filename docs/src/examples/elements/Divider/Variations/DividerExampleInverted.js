import React from 'react'
import { Divider, Image, Segment } from 'react-fomantic-ui'

const DividerExampleInverted = () => (
  <Segment inverted>
    <Image src='/images/wireframe/short-paragraph.png' />
    <Divider inverted />

    <Image src='/images/wireframe/short-paragraph.png' />
    <Divider horizontal inverted>
      Horizontal
    </Divider>
  </Segment>
)

export default DividerExampleInverted
