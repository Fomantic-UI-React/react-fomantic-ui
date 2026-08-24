import React from 'react'
import { Button, Popup } from 'react-fomantic-ui'

const PopupExample = () => (
  <Popup content='Add users to your feed' trigger={<Button icon='add' />} />
)

export default PopupExample
