import faker from 'faker'
import _ from 'lodash'
import React from 'react'
import { Dropdown } from 'react-fomantic-ui'

const addressDefinitions = faker.definitions.address
const stateOptions = _.map(addressDefinitions.state, (state, index) => ({
  key: addressDefinitions.state_abbr[index],
  text: state,
  value: addressDefinitions.state_abbr[index],
}))

const DropdownExampleMultipleSearchSelection = () => (
  <Dropdown
    placeholder='State'
    fluid
    multiple
    search
    selection
    options={stateOptions}
  />
)

export default DropdownExampleMultipleSearchSelection
