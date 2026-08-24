import React from 'react'
import { MessageHeader, Message } from 'react-fomantic-ui'

const MessageExampleNegative = () => (
  <Message negative>
    <MessageHeader>We're sorry we can't apply that discount</MessageHeader>
    <p>That offer has expired</p>
  </Message>
)

export default MessageExampleNegative
