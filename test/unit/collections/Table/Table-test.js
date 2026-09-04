import { dom, root } from 'test/support/rtl'
import React from 'react'

import Table from 'src/collections/Table/Table'
import TableBody from 'src/collections/Table/TableBody'
import TableCell from 'src/collections/Table/TableCell'
import TableFooter from 'src/collections/Table/TableFooter'
import TableHeader from 'src/collections/Table/TableHeader'
import TableHeaderCell from 'src/collections/Table/TableHeaderCell'
import TableRow from 'src/collections/Table/TableRow'
import { SUI } from 'src/lib'
import * as common from 'test/support/commonTests'
import * as _ from 'lodash'

describe('Table', () => {
  common.isConformant(Table)
  common.forwardsRef(Table, { tagName: 'table' })
  common.forwardsRef(Table, { requiredProps: { children: <tbody /> }, tagName: 'table' })
  common.hasSubcomponents(Table, [
    TableBody,
    TableCell,
    TableFooter,
    TableHeader,
    TableHeaderCell,
    TableRow,
  ])
  common.hasUIClassName(Table)
  common.rendersChildren(Table, {
    rendersContent: false,
  })

  common.implementsWidthProp(Table, SUI.WIDTHS, {
    canEqual: false,
    propKey: 'columns',
    widthClass: 'column',
  })

  common.implementsTextAlignProp(Table, ['left', 'center', 'right'])
  common.implementsVerticalAlignProp(Table)

  common.propKeyOnlyToClassName(Table, 'celled')
  common.propKeyOnlyToClassName(Table, 'collapsing')
  common.propKeyOnlyToClassName(Table, 'definition')
  common.propKeyOnlyToClassName(Table, 'fixed')
  common.propKeyOnlyToClassName(Table, 'inverted')
  common.propKeyOnlyToClassName(Table, 'selectable')
  common.propKeyOnlyToClassName(Table, 'singleLine', {
    className: 'single line',
  })
  common.propKeyOnlyToClassName(Table, 'stackable')
  common.propKeyOnlyToClassName(Table, 'sortable')
  common.propKeyOnlyToClassName(Table, 'striped')
  common.propKeyOnlyToClassName(Table, 'structured')
  common.propKeyOnlyToClassName(Table, 'unstackable')

  common.propKeyOrValueAndKeyToClassName(Table, 'attached', ['top', 'bottom'])
  common.propKeyOrValueAndKeyToClassName(Table, 'basic', ['very'])
  common.propKeyOrValueAndKeyToClassName(Table, 'compact', ['very'])
  common.propKeyOrValueAndKeyToClassName(Table, 'padded', ['very'])

  common.propValueOnlyToClassName(Table, 'color', SUI.COLORS)
  common.propValueOnlyToClassName(
    Table,
    'size',
    _.without(SUI.SIZES, 'mini', 'tiny', 'medium', 'big', 'huge', 'massive'),
  )

  describe('as', () => {
    it('renders as a table by default', () => {
      expect(root(<Table />)).toHaveTagName('table')
    })
  })

  describe('shorthand', () => {
    let thead
    let tbody
    let tfoot

    beforeEach(() => {
      thead = undefined
      tbody = undefined
      tfoot = undefined
    })

    const headerRow = ['Name', 'Status', 'Notes']

    const renderBodyRow = ({ name, status, notes }, index) => ({
      key: index,
      cells: [name || { key: 0 }, status || { key: 1 }, notes || { key: 2 }],
    })

    const footerRow = [{ colSpan: 3, content: 'Total', key: 'total' }]

    const tableData = [
      { name: undefined, status: undefined, notes: undefined },
      { name: 'Jimmy', lastName: 'Hendrix', status: 'Requires Action', notes: undefined },
      { name: 'Jamie', lastName: 'Lannister', status: undefined, notes: 'Hostile' },
      { name: 'Jill', lastName: undefined, status: undefined, notes: undefined },
    ]

    const renderBodyRowWithSpan = ({ name, lastName, status, notes }, index) => ({
      key: index,
      cells: [
        name || { key: 0 },
        lastName || { key: 1 },
        status || { key: 2 },
        notes || { key: 3 },
      ],
    })

    const headerRows = [
      {
        key: 0,
        cells: [
          { key: 'fullname', colSpan: 2, content: 'Full Name' },
          { key: 'status', rowSpan: 2, content: 'Status' },
          { key: 'notes', rowSpan: 2, content: 'Notes' },
        ],
      },
      { key: 1, cells: ['First Name', 'Last Name'] },
    ]

    const wrapperMount = (props) => {
      const container = dom(<Table {...props} />)

      thead = container.querySelectorAll('thead')
      tbody = container.querySelectorAll('tbody')
      tfoot = container.querySelectorAll('tfoot')
    }

    it('renders empty tbody with no shorthand', () => {
      wrapperMount()

      expect(thead).toHaveLength(0)

      expect(tbody).toHaveLength(1)
      expect(tbody[0].querySelectorAll('tr')).toHaveLength(0)

      expect(tfoot).toHaveLength(0)
    })

    it('renders the table', () => {
      wrapperMount({ headerRow, renderBodyRow, footerRow, tableData })

      expect(thead).toHaveLength(1)
      expect(thead[0].querySelectorAll('tr')).toHaveLength(1)
      expect(thead[0].querySelectorAll('tr th')).toHaveLength(headerRow.length)

      expect(tbody).toHaveLength(1)
      expect(tbody[0].querySelectorAll('tr')).toHaveLength(tableData.length)
      expect(tbody[0].querySelectorAll('tr')[0].querySelectorAll('td')).toHaveLength(3)

      expect(tfoot).toHaveLength(1)
      expect(tfoot[0].querySelectorAll('tr')).toHaveLength(1)
      expect(tfoot[0].querySelectorAll('tr td')).toHaveLength(footerRow.length)
    })

    it('renders the table with 2 lines header', () => {
      wrapperMount({ renderBodyRow: renderBodyRowWithSpan, footerRow, tableData, headerRows })

      expect(thead).toHaveLength(1)
      expect(thead[0].querySelectorAll('tr')).toHaveLength(2)
      expect(thead[0].querySelectorAll('tr')[0].querySelectorAll('th')).toHaveLength(3)
      expect(thead[0].querySelectorAll('tr')[1].querySelectorAll('th')).toHaveLength(2)

      expect(tbody).toHaveLength(1)
      expect(tbody[0].querySelectorAll('tr')).toHaveLength(tableData.length)
      expect(tbody[0].querySelectorAll('tr')[0].querySelectorAll('td')).toHaveLength(4)

      expect(tfoot).toHaveLength(1)
      expect(tfoot[0].querySelectorAll('tr')).toHaveLength(1)
      expect(tfoot[0].querySelectorAll('tr td')).toHaveLength(footerRow.length)
    })
  })
})
