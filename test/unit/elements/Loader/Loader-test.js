import { root } from 'test/support/rtl'
import React from 'react'

import Loader from 'src/elements/Loader/Loader'
import { SUI } from 'src/lib'
import * as common from 'test/support/commonTests'

describe('Loader', () => {
  common.isConformant(Loader)
  common.forwardsRef(Loader)
  common.hasUIClassName(Loader)
  common.rendersChildren(Loader)

  common.propKeyOnlyToClassName(Loader, 'active')
  common.propKeyOnlyToClassName(Loader, 'disabled')
  common.propKeyOnlyToClassName(Loader, 'indeterminate')
  common.propKeyOnlyToClassName(Loader, 'inverted')

  common.propKeyOrValueAndKeyToClassName(Loader, 'inline', ['centered'])

  common.propValueOnlyToClassName(Loader, 'size', SUI.SIZES)

  describe('text (class)', () => {
    it('omitted by default', () => {
      expect(root(<Loader />)).not.toHaveClass('text')
    })

    it('add class when has children', () => {
      const text = 'faker phrase text'

      expect(root(<Loader>{text}</Loader>)).toHaveClass('text')
    })

    it('add class when has content prop', () => {
      const text = 'faker phrase text'

      expect(root(<Loader content={text} />)).toHaveClass('text')
    })
  })
})
