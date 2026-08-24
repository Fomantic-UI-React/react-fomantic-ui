import React from 'react'
import { Divider, Header, Image, Segment } from 'react-fomantic-ui'

const DividerExampleClearing = () => (
  <Segment>
    <Header as='h2' floated='right'>
      Floated Content
    </Header>

    <Divider clearing />
    <Image src='/images/wireframe/short-paragraph.png' />
  </Segment>
)

export default DividerExampleClearing
