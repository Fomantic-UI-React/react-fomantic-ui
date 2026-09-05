import React from 'react'
import { Dropdown, Image } from 'react-fomantic-ui'

const trigger = (
  <span>
    <Image avatar src='/images/avatar/small/elliot.jpg' /> Elliot Fu
  </span>
)

const options = [
  { key: 'user', text: 'Account', icon: 'user' },
  { key: 'settings', text: 'Settings', icon: 'settings' },
  { key: 'sign-out', text: 'Sign Out', icon: 'sign out' },
]

const DropdownImageTriggerExample = () => (
  <Dropdown
    trigger={trigger}
    options={options}
    pointing='top left'
    icon={null}
  />
)

export default DropdownImageTriggerExample
