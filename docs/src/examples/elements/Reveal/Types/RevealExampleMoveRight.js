import React from 'react'
import { RevealContent, Image, Reveal } from 'react-fomantic-ui'

const RevealExampleMoveRight = () => (
  <Reveal animated='move right'>
    <RevealContent visible>
      <Image src='/images/wireframe/square-image.png' size='small' />
    </RevealContent>
    <RevealContent hidden>
      <Image src='/images/avatar/large/jenny.jpg' size='small' />
    </RevealContent>
  </Reveal>
)

export default RevealExampleMoveRight
