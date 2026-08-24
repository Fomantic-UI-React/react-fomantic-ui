import React from 'react'
import { Button, Popup } from 'react-fomantic-ui'

const PopupExamplePinned = () => (
  <Popup
    content='I will not flip!'
    on='click'
    pinned
    trigger={<Button content='Button' />}
  />
)

export default PopupExamplePinned
