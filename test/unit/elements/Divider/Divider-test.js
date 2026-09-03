import Divider from 'src/elements/Divider/Divider'
import * as common from 'test/support/commonTests'

describe('Divider', () => {
  common.isConformant(Divider)
  common.forwardsRef(Divider)
  common.hasUIClassName(Divider)
})
