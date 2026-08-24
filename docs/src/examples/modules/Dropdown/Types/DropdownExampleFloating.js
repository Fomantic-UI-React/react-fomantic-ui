import React from 'react'
import { ButtonGroup, Button, Dropdown } from 'react-fomantic-ui'

const options = [
  { key: 'edit', icon: 'edit', text: 'Edit Post', value: 'edit' },
  { key: 'delete', icon: 'delete', text: 'Remove Post', value: 'delete' },
  { key: 'hide', icon: 'hide', text: 'Hide Post', value: 'hide' },
]

const DropdownExampleFloating = () => (
  <ButtonGroup color='teal'>
    <Button>Save</Button>
    <Dropdown
      className='button icon'
      floating
      options={options}
      trigger={<></>}
    />
  </ButtonGroup>
)

export default DropdownExampleFloating
