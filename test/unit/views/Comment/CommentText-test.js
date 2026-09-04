import CommentText from 'src/views/Comment/CommentText'
import * as common from 'test/support/commonTests'

describe('CommentText', () => {
  common.isConformant(CommentText)
  common.forwardsRef(CommentText)
  common.rendersChildren(CommentText)
})
