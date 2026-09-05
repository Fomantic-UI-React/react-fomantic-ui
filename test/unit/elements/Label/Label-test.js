import { dom, root } from 'test/support/rtl'
import _ from 'lodash'

import userEvent from '@testing-library/user-event'
import React from 'react'

import Label from 'src/elements/Label/Label'
import LabelDetail from 'src/elements/Label/LabelDetail'
import LabelGroup from 'src/elements/Label/LabelGroup'
import * as common from 'test/support/commonTests'
import { SUI } from 'src/lib'

describe('Label', () => {
  // Interactions go through user-event, which sends the pointer, focus and
  // keyboard sequence a browser does rather than the single event `fireEvent`
  // dispatches.
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  common.isConformant(Label)
  common.forwardsRef(Label)
  common.forwardsRef(Label, { requiredProps: { children: <span /> } })
  common.hasSubcomponents(Label, [LabelDetail, LabelGroup])
  common.hasUIClassName(Label)
  common.rendersChildren(Label)

  common.implementsCreateMethod(Label)
  common.implementsIconProp(Label, { autoGenerateKey: false })
  common.implementsImageProp(Label, { autoGenerateKey: false })
  common.implementsShorthandProp(Label, {
    autoGenerateKey: false,
    propKey: 'detail',
    ShorthandComponent: LabelDetail,
    mapValueToProps: (val) => ({ content: val }),
  })

  common.propKeyAndValueToClassName(Label, 'attached', [
    'top',
    'bottom',
    'top right',
    'top left',
    'bottom left',
    'bottom right',
  ])

  common.propKeyOnlyToClassName(Label, 'active')
  common.propKeyOnlyToClassName(Label, 'basic')
  common.propKeyOnlyToClassName(Label, 'circular')
  common.propKeyOnlyToClassName(Label, 'empty')
  common.propKeyOnlyToClassName(Label, 'floating')
  common.propKeyOnlyToClassName(Label, 'horizontal')
  common.propKeyOnlyToClassName(Label, 'prompt')
  common.propKeyOnlyToClassName(Label, 'tag')

  common.propKeyOrValueAndKeyToClassName(Label, 'corner', ['left', 'right'])
  common.propKeyOrValueAndKeyToClassName(Label, 'ribbon', ['right'])

  common.propValueOnlyToClassName(Label, 'color', SUI.COLORS)
  common.propValueOnlyToClassName(Label, 'size', SUI.SIZES)

  it('is a div by default', async () => {
    expect(root(<Label />)).toHaveTagName('div')
  })

  describe('removeIcon', () => {
    it('has no icon without onRemove', async () => {
      expect(dom(<Label />).querySelector('i.icon')).toBeNull()
    })

    it('has delete icon by default', async () => {
      expect(dom(<Label onRemove={_.noop} />).querySelector('i.icon')).toHaveClass('delete')
    })

    it('uses passed removeIcon string', async () => {
      expect(dom(<Label onRemove={_.noop} removeIcon='foo' />).querySelector('i.icon')).toHaveClass(
        'foo',
      )
    })

    it('uses passed removeIcon props', async () => {
      const icon = dom(<Label onRemove={_.noop} removeIcon={{ 'data-foo': true }} />).querySelector(
        'i.icon',
      )

      expect(icon).toHaveAttribute('data-foo')
    })

    it('handles events on Label and Icon', async () => {
      const iconSpy = vi.fn()
      const labelSpy = vi.fn()
      const iconProps = { 'data-foo': true, onClick: iconSpy }
      const labelProps = { onRemove: labelSpy, removeIcon: iconProps }

      await user.click(dom(<Label {...labelProps} />).querySelector('i.icon'))

      expect(iconSpy).toHaveBeenCalledTimes(1)
      expect(labelSpy).toHaveBeenCalledTimes(1)
      expect(labelSpy.mock.calls[0][0]).toMatchObject({ type: 'click' })
      expect(labelSpy.mock.calls[0][1]).toMatchObject(labelProps)
    })
  })

  describe('image', () => {
    it('adds an image class when true', async () => {
      expect(root(<Label image />)).toHaveClass('image')
    })

    it('does not add an Image when true', async () => {
      expect(dom(<Label image />).querySelector('img')).toBeNull()
    })
  })

  describe('onClick', () => {
    it('is called with (e) when clicked', async () => {
      const onClick = vi.fn()

      await user.click(root(<Label onClick={onClick} />))

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls[0][0]).toMatchObject({ type: 'click' })
    })
  })

  describe('pointing', () => {
    it('adds a pointing class when true', async () => {
      expect(root(<Label pointing />)).toHaveClass('pointing')
    })

    it('does not add any pointing option class when true', async () => {
      const label = root(<Label pointing />)

      for (const className of ['above', 'below', 'left', 'right']) {
        expect(label).not.toHaveClass(className)
      }
    })
  })
})
