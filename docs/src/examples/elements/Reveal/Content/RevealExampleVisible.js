import React from 'react'
import { RevealContent, Image, Reveal } from 'react-fomantic-ui'

const RevealExampleVisible = () => (
  <Reveal animated='small fade'>
    <RevealContent visible>
      <Image src='/images/avatar/large/ade.jpg' size='small' />
    </RevealContent>
    <RevealContent hidden>
      <Image src='/images/wireframe/square-image.png' size='small' />
    </RevealContent>
  </Reveal>
)

export default RevealExampleVisible
