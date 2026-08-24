import React from 'react'
import { Image } from 'react-fomantic-ui'

const ImageExampleWrappedImageProps = () => (
  <Image
    as='div'
    alt='An example alt'
    size='small'
    src='/images/wireframe/image-text.png'
    srcSet='/images/wireframe/image.png 2x'
  />
)

export default ImageExampleWrappedImageProps
