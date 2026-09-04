import HeaderContent from 'src/elements/Header/HeaderContent'
import * as common from 'test/support/commonTests'

describe('HeaderContent', () => {
  common.isConformant(HeaderContent)
  common.forwardsRef(HeaderContent)
  common.rendersChildren(HeaderContent)
})
