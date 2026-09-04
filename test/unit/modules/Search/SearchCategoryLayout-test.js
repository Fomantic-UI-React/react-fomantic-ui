import * as React from 'react'

import SearchCategoryLayout from 'src/modules/Search/SearchCategoryLayout'
import * as common from 'test/support/commonTests'

const requiredProps = {
  categoryContent: <div />,
  resultsContent: <div />,
}

describe('SearchCategoryLayout', () => {
  common.isConformant(SearchCategoryLayout, {
    requiredProps,
    forwardsRef: false,
    rendersChildren: false,
  })
})
