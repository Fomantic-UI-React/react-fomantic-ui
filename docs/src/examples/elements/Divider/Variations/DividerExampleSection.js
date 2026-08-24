import React from 'react'
import { Divider, Header, Image, Segment } from 'react-fomantic-ui'

const DividerExampleSection = () => (
  <Segment>
    <Header as='h3'>Section One</Header>
    <Image src='/images/wireframe/short-paragraph.png' />

    <Divider section />

    <Header as='h3'>Section Two</Header>
    <Image src='/images/wireframe/short-paragraph.png' />
  </Segment>
)

export default DividerExampleSection
