import { dom } from 'test/support/rtl'
import React from 'react'

import FormInput from 'src/collections/Form/FormInput'
import * as common from 'test/support/commonTests'

describe('FormInput', () => {
  common.isConformant(FormInput, {
    eventTargets: {
      // keyboard
      onKeyDown: 'input',
      onKeyPress: 'input',
      onKeyUp: 'input',

      // focus
      onFocus: 'input',
      onBlur: 'input',

      // form
      onChange: 'input',
      onInput: 'input',

      // mouse
      onClick: 'input',
      onContextMenu: 'input',
      onDrag: 'input',
      onDragEnd: 'input',
      onDragEnter: 'input',
      onDragExit: 'input',
      onDragLeave: 'input',
      onDragOver: 'input',
      onDragStart: 'input',
      onDrop: 'input',
      onMouseDown: 'input',
      onMouseEnter: 'input',
      onMouseLeave: 'input',
      onMouseMove: 'input',
      onMouseOut: 'input',
      onMouseOver: 'input',
      onMouseUp: 'input',

      // selection
      onSelect: 'input',

      // touch
      onTouchCancel: 'input',
      onTouchEnd: 'input',
      onTouchMove: 'input',
      onTouchStart: 'input',
    },
    ignoredTypingsProps: ['label', 'error'],
  })
  common.labelImplementsHtmlForProp(FormInput)
  common.forwardsRef(FormInput, { tagName: 'input' })

  it('renders a FormField with an Input control', () => {
    expect(dom(<FormInput />).querySelector('.field > .ui.input input')).not.toBeNull()
  })
})
