import HeaderSubheader from 'src/elements/Header/HeaderSubheader'
import * as common from 'test/support/commonTests'

describe('HeaderSubheader', () => {
  common.isConformant(HeaderSubheader)
  common.forwardsRef(HeaderSubheader)
  common.rendersChildren(HeaderSubheader)
})
