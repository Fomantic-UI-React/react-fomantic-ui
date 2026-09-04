import { dom } from 'test/support/rtl'
import React from 'react'

import Select from 'src/addons/Select/Select'
import Dropdown from 'src/modules/Dropdown/Dropdown'
import * as common from 'test/support/commonTests'

const requiredProps = {
  options: [],
}

describe('Select', () => {
  common.isConformant(Select, { requiredProps })
  common.hasSubcomponents(Select, [Dropdown.Divider, Dropdown.Header, Dropdown.Item, Dropdown.Menu])
  common.forwardsRef(Select, { requiredProps })

  it('renders a selection Dropdown', () => {
    const select = dom(<Select {...requiredProps} />).firstElementChild

    expect(select).toHaveClass('selection')
    expect(select).toHaveClass('dropdown')
  })
})
