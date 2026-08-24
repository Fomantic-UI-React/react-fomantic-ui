import React from 'react'
import { Button, Popup } from 'react-fomantic-ui'

const PopupExamplePositionFixed = () => (
  <Popup
    content={
      <>
        This Popup is positioned with <code>position: fixed</code>
      </>
    }
    on='click'
    positionFixed
    trigger={<Button>Open a popup</Button>}
  />
)

export default PopupExamplePositionFixed
