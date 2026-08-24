import React from 'react'
import {
  FeedSummary,
  FeedLabel,
  FeedExtra,
  FeedEvent,
  FeedDate,
  FeedContent,
  Feed,
} from 'react-fomantic-ui'

const FeedExampleAdditionalInformation = () => (
  <Feed>
    <FeedEvent>
      <FeedLabel image='/images/avatar/small/helen.jpg' />
      <FeedContent>
        <FeedDate>3 days ago</FeedDate>
        <FeedSummary>
          <a>Helen Troy</a> added 2 photos
        </FeedSummary>
        <FeedExtra images>
          <a>
            <img src='/images/wireframe/image.png' />
          </a>
          <a>
            <img src='/images/wireframe/image.png' />
          </a>
        </FeedExtra>
      </FeedContent>
    </FeedEvent>
  </Feed>
)

export default FeedExampleAdditionalInformation
