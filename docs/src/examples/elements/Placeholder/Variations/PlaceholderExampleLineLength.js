import React from 'react'
import { PlaceholderLine, Placeholder } from 'react-fomantic-ui'

const PlaceholderExampleLineLength = () => (
  <Placeholder>
    <PlaceholderLine length='full' />
    <PlaceholderLine length='very long' />
    <PlaceholderLine length='long' />
    <PlaceholderLine length='medium' />
    <PlaceholderLine length='short' />
    <PlaceholderLine length='very short' />
  </Placeholder>
)

export default PlaceholderExampleLineLength
