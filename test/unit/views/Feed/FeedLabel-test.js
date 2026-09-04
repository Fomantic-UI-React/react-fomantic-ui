import { render } from '@testing-library/react'
import React from 'react'

import FeedLabel from 'src/views/Feed/FeedLabel'
import * as common from 'test/support/commonTests'

describe('FeedLabel', () => {
  common.isConformant(FeedLabel)
  common.forwardsRef(FeedLabel)
  common.forwardsRef(FeedLabel, { requiredProps: { children: <span /> } })
  common.rendersChildren(FeedLabel)

  common.implementsIconProp(FeedLabel, { autoGenerateKey: false })

  describe('image prop', () => {
    const src = '/images/example.png'

    it('renders <img> with a string', () => {
      const { container } = render(<FeedLabel image={src} />)

      expect(container.querySelector('img')).toHaveAttribute('src', src)
    })

    it('renders <img> with a node', () => {
      const { container } = render(<FeedLabel image={<img src={src} alt='' />} />)

      expect(container.querySelector('img')).toHaveAttribute('src', src)
    })
  })
})
