import React from 'react'
import { Button, Popup } from 'react-fomantic-ui'

const PopupExampleMultiple = () => (
  <Popup
    trigger={<Button icon>Click me or Hover me</Button>}
    header='Movie Search'
    content='Multiple events can trigger a popup'
    on={['hover', 'click']}
  />
)

export default PopupExampleMultiple
