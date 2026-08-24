import React from 'react'
import { MessageHeader, Message } from 'react-fomantic-ui'

const MessageExampleWarning = () => (
  <Message warning>
    <MessageHeader>You must register before you can do that!</MessageHeader>
    <p>Visit our registration page, then try again.</p>
  </Message>
)

export default MessageExampleWarning
