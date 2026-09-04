import { render } from '@testing-library/react'
import _ from 'lodash'
import React from 'react'

import { SUI } from 'src/lib'
import Feed from 'src/views/Feed/Feed'
import * as common from 'test/support/commonTests'

describe('Feed', () => {
  common.isConformant(Feed)
  common.forwardsRef(Feed)
  common.forwardsRef(Feed, { requiredProps: { children: <span /> } })
  common.hasUIClassName(Feed)
  common.rendersChildren(Feed, { rendersContent: false })

  common.propValueOnlyToClassName(
    Feed,
    'size',
    _.without(SUI.SIZES, 'mini', 'tiny', 'medium', 'big', 'huge', 'massive'),
  )

  describe('events prop', () => {
    it('renders a FeedEvent for each event', () => {
      const events = _.times(3, (i) => ({ summary: `summary ${i}` }))
      const { container } = render(<Feed events={events} />)

      expect(container.querySelectorAll('.event')).toHaveLength(3)
    })
  })
})
