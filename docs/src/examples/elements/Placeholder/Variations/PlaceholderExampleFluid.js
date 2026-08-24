import React from 'react'
import {
  PlaceholderParagraph,
  PlaceholderLine,
  PlaceholderHeader,
  Placeholder,
} from 'react-fomantic-ui'

const PlaceholderExampleFluid = () => (
  <Placeholder fluid>
    <PlaceholderHeader image>
      <PlaceholderLine />
      <PlaceholderLine />
    </PlaceholderHeader>
    <PlaceholderParagraph>
      <PlaceholderLine />
      <PlaceholderLine />
      <PlaceholderLine />
    </PlaceholderParagraph>
  </Placeholder>
)

export default PlaceholderExampleFluid
