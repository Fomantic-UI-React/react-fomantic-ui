import FeedUser from 'src/views/Feed/FeedUser'
import * as common from 'test/support/commonTests'

describe('FeedUser', () => {
  common.isConformant(FeedUser)
  common.forwardsRef(FeedUser, { tagName: 'a' })
  common.rendersChildren(FeedUser)
})
