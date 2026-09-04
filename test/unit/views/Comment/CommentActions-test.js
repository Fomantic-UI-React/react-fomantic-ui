import CommentActions from 'src/views/Comment/CommentActions'
import * as common from 'test/support/commonTests'

describe('CommentActions', () => {
  common.isConformant(CommentActions)
  common.forwardsRef(CommentActions)
  common.rendersChildren(CommentActions)
})
