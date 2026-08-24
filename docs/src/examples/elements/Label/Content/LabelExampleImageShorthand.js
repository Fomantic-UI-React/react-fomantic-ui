import React from 'react'
import { Label } from 'react-fomantic-ui'

const LabelExampleImageShorthand = () => {
  const imageProps = {
    avatar: true,
    spaced: 'right',
    src: '/images/avatar/small/elliot.jpg',
  }

  return <Label as='a' content='Elliot' image={imageProps} />
}

export default LabelExampleImageShorthand
