import React from 'react'
import {
  CommentGroup,
  CommentContent,
  CommentAvatar,
  CommentAuthor,
  Comment,
} from 'react-fomantic-ui'

const CommentExampleAvatar = () => (
  <CommentGroup>
    <Comment>
      <CommentAvatar src='/images/avatar/small/elliot.jpg' />
      <CommentContent>
        <CommentAuthor as='a'>Elliot Fu</CommentAuthor>
      </CommentContent>
    </Comment>
  </CommentGroup>
)

export default CommentExampleAvatar
