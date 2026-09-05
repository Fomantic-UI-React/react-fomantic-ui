import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { dom, root } from 'test/support/rtl'
import React from 'react'

import DropdownItem from 'src/modules/Dropdown/DropdownItem'
import Flag from 'src/elements/Flag'
import * as common from 'test/support/commonTests'

describe('DropdownItem', () => {
  common.isConformant(DropdownItem)
  common.forwardsRef(DropdownItem)
  common.rendersChildren(DropdownItem, {
    rendersContent: false,
  })

  common.propKeyOnlyToClassName(DropdownItem, 'selected')
  common.propKeyOnlyToClassName(DropdownItem, 'active')

  common.implementsCreateMethod(DropdownItem)
  common.implementsIconProp(DropdownItem, { autoGenerateKey: false })
  common.implementsLabelProp(DropdownItem, { autoGenerateKey: false })
  common.implementsImageProp(DropdownItem, { autoGenerateKey: false })

  common.implementsShorthandProp(DropdownItem, {
    assertExactMatch: false,
    autoGenerateKey: false,
    propKey: 'flag',
    ShorthandComponent: Flag,
    mapValueToProps: (name) => ({ name }),
  })

  common.implementsShorthandProp(DropdownItem, {
    autoGenerateKey: false,
    propKey: 'description',
    ShorthandComponent: 'span',
    mapValueToProps: (children) => ({ children }),
    shorthandDefaultProps: { className: 'description' },
  })

  common.implementsShorthandProp(DropdownItem, {
    autoGenerateKey: false,
    propKey: 'text',
    ShorthandComponent: 'span',
    mapValueToProps: (children) => ({ children }),
    shorthandDefaultProps: { className: 'text' },
  })

  describe('aria', () => {
    it('should render DropdownItem as role=option', () => {
      expect(root(<DropdownItem />)).toHaveAttribute('role', 'option')
    })

    it('should render DropdownItem with children as role=option', () => {
      expect(root(<DropdownItem>Text</DropdownItem>)).toHaveAttribute('role', 'option')
    })

    it('should render DropdownItem with description as role=option', () => {
      expect(root(<DropdownItem description='Text' />)).toHaveAttribute('role', 'option')
    })

    it('should render disabled DropdownItem with aria-disabled', () => {
      expect(root(<DropdownItem disabled />)).toHaveAttribute('aria-disabled', 'true')
    })

    it('should render normal DropdownItem without aria-disabled', () => {
      expect(root(<DropdownItem />)).not.toHaveAttribute('aria-disabled')
    })

    it('should render active DropdownItem with aria-checked', () => {
      expect(root(<DropdownItem active />)).toHaveAttribute('aria-checked', 'true')
    })

    it('should render normal DropdownItem without aria-checked', () => {
      expect(root(<DropdownItem />)).not.toHaveAttribute('aria-checked')
    })

    it('should render selected DropdownItem with aria-selected', () => {
      expect(root(<DropdownItem selected />)).toHaveAttribute('aria-selected', 'true')
    })

    it('should render normal DropdownItem without aria-selected', () => {
      expect(root(<DropdownItem />)).not.toHaveAttribute('aria-selected')
    })
  })

  describe('description', () => {
    it('adds className="description" to element shorthand', () => {
      expect(
        dom(<DropdownItem description={<strong />} />).querySelector('strong.description'),
      ).not.toBeNull()
    })
  })

  describe('text', () => {
    it('adds className="text" to element shorthand', () => {
      expect(dom(<DropdownItem text={<strong />} />).querySelector('strong.text')).not.toBeNull()
    })
  })

  describe('content', () => {
    it('renders text if no content', () => {
      expect(root(<DropdownItem text='hey' />)).toHaveTextContent('hey')
    })

    it('renders content if present', () => {
      const element = root(<DropdownItem text='hey' content='you' />)

      expect(element).not.toHaveTextContent('hey')
      expect(element).toHaveTextContent('you')
    })
  })

  describe('onClick', () => {
    it('is called with (e, props) when clicked', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      const props = { value: 'a value', 'data-foo': 'bar' }
      const { container } = render(<DropdownItem onClick={onClick} {...props} />)

      await user.click(container.firstElementChild)

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'click' }),
        expect.objectContaining(props),
      )
    })
  })
})
