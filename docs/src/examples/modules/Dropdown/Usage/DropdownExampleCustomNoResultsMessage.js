import React from 'react'
import { Dropdown } from 'react-fomantic-ui'

const DropdownExampleCustomNoResultsMessage = () => (
  <Dropdown
    options={[]}
    search
    selection
    placeholder='A custom message...'
    noResultsMessage='Try another search.'
  />
)

export default DropdownExampleCustomNoResultsMessage
