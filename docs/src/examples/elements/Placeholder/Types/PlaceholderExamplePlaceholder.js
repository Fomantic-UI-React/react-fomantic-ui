import React from 'react'
import {
  PlaceholderParagraph,
  PlaceholderLine,
  PlaceholderHeader,
  Placeholder,
} from 'react-fomantic-ui'

const PlaceholderExamplePlaceholder = () => (
  <Placeholder>
    <PlaceholderHeader image>
      <PlaceholderLine />
      <PlaceholderLine />
    </PlaceholderHeader>
    <PlaceholderParagraph>
      <PlaceholderLine />
      <PlaceholderLine />
      <PlaceholderLine />
      <PlaceholderLine />
    </PlaceholderParagraph>
  </Placeholder>
)

export default PlaceholderExamplePlaceholder
