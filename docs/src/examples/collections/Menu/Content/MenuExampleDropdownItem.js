import React from 'react'
import { DropdownMenu, DropdownItem, Dropdown, Menu } from 'react-fomantic-ui'

const MenuExampleDropdownItem = () => (
  <Menu vertical>
    <Dropdown item text='Categories'>
      <DropdownMenu>
        <DropdownItem>Electronics</DropdownItem>
        <DropdownItem>Automotive</DropdownItem>
        <DropdownItem>Home</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </Menu>
)

export default MenuExampleDropdownItem
