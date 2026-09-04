import { root } from 'test/support/rtl'
import { fireEvent } from '@testing-library/react'
import React from 'react'

import SearchResult from 'src/modules/Search/SearchResult'
import * as common from 'test/support/commonTests'

const requiredProps = { title: '' }

describe('SearchResult', () => {
  common.isConformant(SearchResult, { requiredProps })
  common.forwardsRef(SearchResult, { requiredProps })
  common.propKeyOnlyToClassName(SearchResult, 'active', { requiredProps })

  describe('onClick', () => {
    it('is called with (e, data) when clicked', () => {
      const onClick = vi.fn()
      fireEvent.click(root(<SearchResult onClick={onClick} {...requiredProps} />))

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls[0][0]).toMatchObject({ type: 'click' })
      expect(onClick.mock.calls[0][1]).toMatchObject(requiredProps)
    })
  })
})
