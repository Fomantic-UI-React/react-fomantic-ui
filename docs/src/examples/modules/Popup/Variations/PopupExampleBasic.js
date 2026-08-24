import React from 'react'
import { Button, Popup } from 'react-fomantic-ui'

const PopupExampleBasic = () => (
  <Popup
    trigger={<Button icon='add' />}
    content="The default theme's basic popup removes the pointing arrow."
    basic
  />
)

export default PopupExampleBasic
