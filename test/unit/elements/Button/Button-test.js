import { dom, root } from 'test/support/rtl'

import userEvent from '@testing-library/user-event'
import React from 'react'

import Button from 'src/elements/Button/Button'
import ButtonContent from 'src/elements/Button/ButtonContent'
import ButtonGroup from 'src/elements/Button/ButtonGroup'
import ButtonOr from 'src/elements/Button/ButtonOr'
import { SUI } from 'src/lib'
import * as common from 'test/support/commonTests'

describe('Button', () => {
  // Interactions go through user-event, which sends the pointer, focus and
  // keyboard sequence a browser does rather than the single event `fireEvent`
  // dispatches.
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  common.isConformant(Button)
  common.forwardsRef(Button, { tagName: 'button' })
  common.forwardsRef(Button, { requiredProps: { label: 'word' }, tagName: 'button' })
  common.hasSubcomponents(Button, [ButtonContent, ButtonGroup, ButtonOr])
  common.hasUIClassName(Button)
  common.rendersChildren(Button)

  common.implementsCreateMethod(Button)
  common.implementsIconProp(Button, { autoGenerateKey: false })
  common.implementsLabelProp(Button, {
    autoGenerateKey: false,
    shorthandDefaultProps: {
      basic: true,
      pointing: 'left',
    },
  })

  common.propKeyAndValueToClassName(Button, 'floated', SUI.FLOATS)

  common.propKeyOnlyToClassName(Button, 'active')
  common.propKeyOnlyToClassName(Button, 'basic')
  common.propKeyOnlyToClassName(Button, 'circular')
  common.propKeyOnlyToClassName(Button, 'compact')
  common.propKeyOnlyToClassName(Button, 'disabled')
  common.propKeyOnlyToClassName(Button, 'fluid')
  common.propKeyOnlyToClassName(Button, 'inverted')
  common.propKeyOnlyToClassName(Button, 'loading')
  common.propKeyOnlyToClassName(Button, 'primary')
  common.propKeyOnlyToClassName(Button, 'negative')
  common.propKeyOnlyToClassName(Button, 'positive')
  common.propKeyOnlyToClassName(Button, 'secondary')

  common.propKeyOrValueAndKeyToClassName(Button, 'animated', ['fade', 'vertical'])
  common.propKeyOrValueAndKeyToClassName(Button, 'attached', ['left', 'right', 'top', 'bottom'])
  common.propKeyOrValueAndKeyToClassName(Button, 'labelPosition', ['right', 'left'], {
    className: 'labeled',
  })

  common.propValueOnlyToClassName(Button, 'color', [
    ...SUI.COLORS,
    'facebook',
    'twitter',
    'google plus',
    'vk',
    'linkedin',
    'instagram',
    'youtube',
  ])
  common.propValueOnlyToClassName(Button, 'size', SUI.SIZES)

  it('renders a button by default', async () => {
    expect(root(<Button />)).toHaveTagName('button')
  })

  describe('attached', () => {
    it('renders a div', async () => {
      expect(root(<Button attached />)).toHaveTagName('div')
    })
  })

  describe('disabled', () => {
    it('is not set by default', async () => {
      expect(root(<Button />)).not.toBeDisabled()
    })

    it('applied when defined', async () => {
      expect(root(<Button disabled />)).toBeDisabled()
    })

    it("don't apply when the element's type isn't button", async () => {
      expect(root(<Button as='div' disabled />)).not.toHaveAttribute('disabled')
    })

    it('is not set by default when has a label', async () => {
      expect(dom(<Button label='foo' />).querySelector('button')).not.toBeDisabled()
    })

    it('applied when defined and has a label', async () => {
      expect(dom(<Button disabled label='foo' />).querySelector('button')).toBeDisabled()
    })
  })

  describe('toggle', () => {
    it('is not set by default', async () => {
      expect(root(<Button />)).not.toHaveAttribute('aria-pressed')
    })

    it('should have aria-pressed', async () => {
      expect(root(<Button toggle />)).toHaveAttribute('aria-pressed')
    })

    it('aria-pressed should be true when active', async () => {
      expect(root(<Button toggle active />)).toHaveAttribute('aria-pressed', 'true')
    })

    it('aria-pressed should be false when inactive', async () => {
      expect(root(<Button toggle />)).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('icon', () => {
    it('adds className icon', async () => {
      expect(root(<Button icon='user' />)).toHaveClass('icon')
    })

    it('adds className icon when true', async () => {
      expect(root(<Button icon />)).toHaveClass('icon')
    })

    it('does not add className icon when there is content', async () => {
      expect(root(<Button icon='user' content={0} />)).not.toHaveClass('icon')
      expect(root(<Button icon='user' content='Yo' />)).not.toHaveClass('icon')
    })

    it('adds className icon given labelPosition and content', async () => {
      expect(root(<Button labelPosition='left' icon='user' content='My Account' />)).toHaveClass(
        'icon',
      )
      expect(root(<Button labelPosition='right' icon='user' content='My Account' />)).toHaveClass(
        'icon',
      )
    })
  })

  describe('label', () => {
    it('renders as a div', async () => {
      expect(root(<Button label='http' />)).toHaveTagName('div')
    })

    it('renders a div with a button and Label child', async () => {
      const container = dom(<Button label='hi' />)

      expect(container.firstElementChild).toHaveTagName('div')
      expect(container.querySelectorAll('button')).toHaveLength(1)
      expect(container.querySelectorAll('.label')).toHaveLength(1)
    })

    it('adds the labeled className to the root element', async () => {
      expect(root(<Button label='hi' />)).toHaveClass('labeled')
    })

    it('contains children without disabled class when disabled attribute is set', async () => {
      const container = dom(<Button label='hi' disabled />)

      expect(container.firstElementChild).toHaveClass('disabled')
      expect(container.querySelector('.label')).not.toHaveClass('disabled')
      expect(container.querySelector('button')).not.toHaveClass('disabled')
    })

    it('contains children without floated class when floated attribute is set', async () => {
      const container = dom(<Button label='hi' floated='left' />)

      expect(container.firstElementChild).toHaveClass('floated')
      expect(container.querySelector('.label')).not.toHaveClass('floated')
      expect(container.querySelector('button')).not.toHaveClass('floated')
    })

    it('creates a basic pointing label', async () => {
      const label = dom(<Button label='foo' />).querySelector('.label')

      expect(label).toHaveClass('basic')
      expect(label).toHaveClass('pointing')
    })

    // Ordering is the assertion here: Enzyme walked childAt(0)/childAt(1), the
    // DOM equivalent is the root's element children in document order.
    it('is before the button and pointing="right" when labelPosition="left"', async () => {
      const children = dom(<Button labelPosition='left' label='foo' />).firstElementChild.children

      expect(children[0]).toHaveClass('label')
      expect(children[0]).toHaveClass('right')
      expect(children[1]).toHaveTagName('button')
    })

    it('is after the button and pointing="left" when labelPosition="right"', async () => {
      const children = dom(<Button labelPosition='right' label='foo' />).firstElementChild.children

      expect(children[0]).toHaveTagName('button')
      expect(children[1]).toHaveClass('label')
      expect(children[1]).toHaveClass('left')
    })

    it('is after the button and pointing="left" by default', async () => {
      const children = dom(<Button label='foo' />).firstElementChild.children

      expect(children[0]).toHaveTagName('button')
      expect(children[1]).toHaveClass('label')
      expect(children[1]).toHaveClass('left')
    })
  })

  describe('labelPosition', () => {
    it('renders as a button when given an icon', async () => {
      expect(root(<Button labelPosition='left' icon='user' />)).toHaveTagName('button')
      expect(root(<Button labelPosition='right' icon='user' />)).toHaveTagName('button')
    })
  })

  describe('onClick', () => {
    it('is called with (e, data) when clicked', async () => {
      const onClick = vi.fn()

      await user.click(root(<Button onClick={onClick} />))

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls[0][0]).toMatchObject({ type: 'click' })
      expect(onClick.mock.calls[0][1]).toMatchObject({ onClick })
    })

    it('is not called when is disabled', async () => {
      const onClick = vi.fn()

      await user.click(root(<Button disabled onClick={onClick} />))

      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('role', () => {
    it('is not set by default', async () => {
      expect(root(<Button />)).not.toHaveAttribute('role')
    })

    it('defaults to "button" when rendered as not "button" element', async () => {
      expect(root(<Button as='label' />)).toHaveAttribute('role', 'button')
    })

    it('is configurable', async () => {
      expect(root(<Button role='link' />)).toHaveAttribute('role', 'link')
      expect(root(<Button role='button' />)).toHaveAttribute('role', 'button')
    })
  })

  describe('type', () => {
    it('is not set by default', async () => {
      expect(dom(<Button />).querySelector('button')).not.toHaveAttribute('type')
    })

    it('is passed to <button />', async () => {
      expect(dom(<Button type='submit' />).querySelector('button')).toHaveAttribute(
        'type',
        'submit',
      )
    })

    it('is passed to <button /> when "label" is defined', async () => {
      expect(dom(<Button label='Foo' type='submit' />).querySelector('button')).toHaveAttribute(
        'type',
        'submit',
      )
    })
  })

  describe('tabIndex', () => {
    it('is not set by default', async () => {
      expect(root(<Button />)).not.toHaveAttribute('tabindex')
    })

    it('defaults to 0 as div', async () => {
      expect(root(<Button as='div' />)).toHaveAttribute('tabindex', '0')
    })

    it('defaults to -1 when disabled', async () => {
      expect(root(<Button disabled />)).toHaveAttribute('tabindex', '-1')
    })

    it('can be set explicitly', async () => {
      expect(root(<Button tabIndex={123} />)).toHaveAttribute('tabindex', '123')
    })

    it('can be set explicitly when disabled', async () => {
      expect(root(<Button tabIndex={123} disabled />)).toHaveAttribute('tabindex', '123')
    })
  })
})
