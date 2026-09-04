import { dom, root } from 'test/support/rtl'
import React from 'react'

import * as common from 'test/support/commonTests'
import TableRow from 'src/collections/Table/TableRow'

describe('TableRow', () => {
  common.isConformant(TableRow)
  common.forwardsRef(TableRow, { tagName: 'tr' })
  common.forwardsRef(TableRow, { requiredProps: { children: <span /> }, tagName: 'tr' })
  common.rendersChildren(TableRow, {
    rendersContent: false,
  })

  common.implementsCreateMethod(TableRow)
  common.implementsTextAlignProp(TableRow, ['left', 'center', 'right'])
  common.implementsVerticalAlignProp(TableRow)

  common.propKeyOnlyToClassName(TableRow, 'active')
  common.propKeyOnlyToClassName(TableRow, 'disabled')
  common.propKeyOnlyToClassName(TableRow, 'error')
  common.propKeyOnlyToClassName(TableRow, 'negative')
  common.propKeyOnlyToClassName(TableRow, 'positive')
  common.propKeyOnlyToClassName(TableRow, 'warning')

  it('renders as a tr by default', () => {
    expect(root(<TableRow />)).toHaveTagName('tr')
  })

  describe('shorthand', () => {
    const cells = ['Name', 'Status', 'Notes']

    it('renders empty tr with no shorthand', () => {
      expect(dom(<TableRow />).querySelectorAll('td')).toHaveLength(0)
    })

    it('renders the cells', () => {
      expect(dom(<TableRow cells={cells} />).querySelectorAll('td')).toHaveLength(cells.length)
    })

    it('renders the cells using cellAs', () => {
      const rendered = dom(<TableRow cells={cells} cellAs='th' />).querySelectorAll('th')

      expect(rendered).toHaveLength(cells.length)
    })
  })
})
