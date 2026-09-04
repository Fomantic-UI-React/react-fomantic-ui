import { render } from '@testing-library/react'
import _ from 'lodash'
import React from 'react'

import FeedEvent from 'src/views/Feed/FeedEvent'
import FeedLabel from 'src/views/Feed/FeedLabel'
import * as common from 'test/support/commonTests'

describe('FeedEvent', () => {
  common.isConformant(FeedEvent)
  common.forwardsRef(FeedEvent)
  common.rendersChildren(FeedEvent, { rendersContent: false })

  common.implementsShorthandProp(FeedEvent, {
    autoGenerateKey: false,
    propKey: 'icon',
    ShorthandComponent: FeedLabel,
    mapValueToProps: (val) => ({ icon: val }),
  })
  common.implementsShorthandProp(FeedEvent, {
    autoGenerateKey: false,
    propKey: 'image',
    ShorthandComponent: FeedLabel,
    mapValueToProps: (val) => ({ image: val }),
  })

  describe('content props', () => {
    it('renders FeedContent with extraImages prop', () => {
      const images = _.times(3, (i) => `/images/example-${i}.png`)
      const { container } = render(<FeedEvent extraImages={images} />)

      expect(container.querySelector('.content')).not.toBeNull()
    })

    for (const propKey of ['content', 'date', 'extraText', 'meta', 'summary']) {
      it(`renders FeedContent with the ${propKey} prop`, () => {
        const { container } = render(<FeedEvent {...{ [propKey]: 'faker phrase text' }} />)

        expect(container.querySelector('.content')).not.toBeNull()
      })
    }
  })
})
