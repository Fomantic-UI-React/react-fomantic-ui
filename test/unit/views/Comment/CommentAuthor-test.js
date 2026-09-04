import CommentAuthor from 'src/views/Comment/CommentAuthor'
import * as common from 'test/support/commonTests'

describe('CommentAuthor', () => {
  common.isConformant(CommentAuthor)
  common.forwardsRef(CommentAuthor)
  common.rendersChildren(CommentAuthor)
})
