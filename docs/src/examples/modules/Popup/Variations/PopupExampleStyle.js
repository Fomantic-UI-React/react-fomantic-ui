import React from 'react'
import { Button, Popup } from 'react-fomantic-ui'

const style = {
  borderRadius: 0,
  opacity: 0.7,
  padding: '2em',
}

const PopupExampleStyle = () => (
  <Popup
    trigger={<Button icon='eye' />}
    content='Popup with a custom style prop'
    style={style}
    inverted
  />
)

export default PopupExampleStyle
