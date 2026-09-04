import { dom } from 'test/support/rtl'
import React from 'react'

import Radio from 'src/addons/Radio/Radio'
import * as common from 'test/support/commonTests'

describe('Radio', () => {
  common.isConformant(Radio)
  common.forwardsRef(Radio, { tagName: 'input' })

  it('renders a radio Checkbox', () => {
    const container = dom(<Radio />)

    expect(container.firstElementChild).toHaveClass('radio')
    expect(container.firstElementChild).toHaveClass('checkbox')
    expect(container.querySelector('input')).toHaveAttribute('type', 'radio')
  })

  it('is not a radio when slider', () => {
    expect(dom(<Radio slider />).firstElementChild).not.toHaveClass('radio')
  })

  it('is not a radio when toggle', () => {
    expect(dom(<Radio toggle />).firstElementChild).not.toHaveClass('radio')
  })
})
