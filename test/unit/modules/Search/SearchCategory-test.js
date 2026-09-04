import { root } from 'test/support/rtl'
import React from 'react'

import SearchCategory from 'src/modules/Search/SearchCategory'
import * as common from 'test/support/commonTests'

describe('SearchCategory', () => {
  common.isConformant(SearchCategory)
  common.forwardsRef(SearchCategory)
  common.rendersChildren(SearchCategory)

  describe('children', () => {
    it('should be a child with a "name" className', () => {
      expect(root(<SearchCategory />).children[0]).toHaveClass('name')
    })

    it('should be wrapped with a "results" className', () => {
      expect(root(<SearchCategory />).children[1]).toHaveClass('results')
    })
  })
})
