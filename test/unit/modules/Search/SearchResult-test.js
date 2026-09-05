import { root } from 'test/support/rtl'

import userEvent from '@testing-library/user-event'
import React from 'react'

import SearchResult from 'src/modules/Search/SearchResult'
import * as common from 'test/support/commonTests'

const requiredProps = { title: '' }

describe('SearchResult', () => {
  // Interactions go through user-event, which sends the pointer, focus and
  // keyboard sequence a browser does rather than the single event `fireEvent`
  // dispatches.
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  common.isConformant(SearchResult, { requiredProps })
  common.forwardsRef(SearchResult, { requiredProps })
  common.propKeyOnlyToClassName(SearchResult, 'active', { requiredProps })

  describe('onClick', () => {
    it('is called with (e, data) when clicked', async () => {
      const onClick = vi.fn()
      await user.click(root(<SearchResult onClick={onClick} {...requiredProps} />))

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls[0][0]).toMatchObject({ type: 'click' })
      expect(onClick.mock.calls[0][1]).toMatchObject(requiredProps)
    })
  })
})
