import React from 'react'
import { Dropdown } from 'react-fomantic-ui'

const DropdownExampleRemoveNoResultsMessage = () => (
  <Dropdown
    options={[]}
    search
    selection
    placeholder='No message...'
    noResultsMessage={null}
  />
)

export default DropdownExampleRemoveNoResultsMessage
