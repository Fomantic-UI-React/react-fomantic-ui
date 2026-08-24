import React from 'react'
import {
  FeedSummary,
  FeedLabel,
  FeedEvent,
  FeedDate,
  FeedContent,
  Feed,
  Icon,
} from 'react-fomantic-ui'

const FeedExampleIconLabel = () => (
  <Feed>
    <FeedEvent>
      <FeedLabel>
        <Icon name='pencil' />
      </FeedLabel>
      <FeedContent>
        <FeedDate>Today</FeedDate>
        <FeedSummary>
          You posted on your friend <a>Stevie Feliciano's</a> wall.
        </FeedSummary>
      </FeedContent>
    </FeedEvent>
  </Feed>
)

export default FeedExampleIconLabel
