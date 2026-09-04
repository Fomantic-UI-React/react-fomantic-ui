import { render } from '@testing-library/react'
import React from 'react'

import FeedExtra from 'src/views/Feed/FeedExtra'
import * as common from 'test/support/commonTests'

describe('FeedExtra', () => {
  common.isConformant(FeedExtra)
  common.forwardsRef(FeedExtra)
  common.forwardsRef(FeedExtra, { requiredProps: { children: <span /> } })
  common.rendersChildren(FeedExtra)

  common.propKeyOnlyToClassName(FeedExtra, 'images')
  common.propKeyOnlyToClassName(FeedExtra, 'text')

  describe('images', () => {
    it('renders an <img> for each image', () => {
      const { container } = render(<FeedExtra images={['a', 'b', 'c']} />)

      expect(container.querySelectorAll('img')).toHaveLength(3)
    })
  })
})
