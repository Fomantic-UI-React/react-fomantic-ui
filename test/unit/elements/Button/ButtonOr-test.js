import { root } from 'test/support/rtl'
import React from 'react'

import ButtonOr from 'src/elements/Button/ButtonOr'
import * as common from 'test/support/commonTests'

describe('ButtonOr', () => {
  common.isConformant(ButtonOr)
  common.forwardsRef(ButtonOr)

  describe('text', () => {
    it('should not define attr when not defined', () => {
      expect(root(<ButtonOr />)).not.toHaveAttribute('data-text')
    })

    it('should pass value to attr', () => {
      const word = 'word'

      expect(root(<ButtonOr text={word} />)).toHaveAttribute('data-text', word)
    })
  })
})
