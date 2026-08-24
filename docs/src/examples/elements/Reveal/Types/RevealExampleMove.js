import React from 'react'
import { RevealContent, Image, Reveal } from 'react-fomantic-ui'

const RevealExampleMove = () => (
  <Reveal animated='move'>
    <RevealContent visible>
      <Image src='/images/wireframe/square-image.png' size='small' />
    </RevealContent>
    <RevealContent hidden>
      <Image src='/images/avatar/large/chris.jpg' size='small' />
    </RevealContent>
  </Reveal>
)

export default RevealExampleMove
