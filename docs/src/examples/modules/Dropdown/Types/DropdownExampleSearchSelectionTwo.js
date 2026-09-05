import React from 'react'
import { Dropdown } from 'react-fomantic-ui'

const stateOptions = [
  { key: 'AL', text: 'Alabama', value: 'AL' },
  { key: 'AK', text: 'Alaska', value: 'AK' },
  { key: 'AZ', text: 'Arizona', value: 'AZ' },
  { key: 'AR', text: 'Arkansas', value: 'AR' },
  { key: 'CA', text: 'California', value: 'CA' },
  { key: 'CO', text: 'Colorado', value: 'CO' },
  { key: 'CT', text: 'Connecticut', value: 'CT' },
  { key: 'DE', text: 'Delaware', value: 'DE' },
  { key: 'FL', text: 'Florida', value: 'FL' },
  { key: 'GA', text: 'Georgia', value: 'GA' },
  { key: 'HI', text: 'Hawaii', value: 'HI' },
  { key: 'ID', text: 'Idaho', value: 'ID' },
  { key: 'IL', text: 'Illinois', value: 'IL' },
  { key: 'IN', text: 'Indiana', value: 'IN' },
  { key: 'IA', text: 'Iowa', value: 'IA' },
  { key: 'KS', text: 'Kansas', value: 'KS' },
]

const DropdownExampleSearchSelectionTwo = () => (
  <Dropdown placeholder='State' search selection options={stateOptions} />
)

export default DropdownExampleSearchSelectionTwo
