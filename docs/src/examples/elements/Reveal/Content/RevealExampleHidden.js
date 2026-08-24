import React from 'react'
import { RevealContent, Image, Reveal } from 'react-fomantic-ui'

const RevealExampleHidden = () => (
  <Reveal animated='small fade'>
    <RevealContent visible>
      <Image src='/images/wireframe/square-image.png' size='small' />
    </RevealContent>
    <RevealContent hidden>
      <Image src='/images/avatar/large/ade.jpg' size='small' />
    </RevealContent>
  </Reveal>
)

export default RevealExampleHidden
