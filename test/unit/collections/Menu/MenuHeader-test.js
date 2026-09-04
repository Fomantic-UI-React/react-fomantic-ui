import MenuHeader from 'src/collections/Menu/MenuHeader'
import * as common from 'test/support/commonTests'

describe('MenuHeader', () => {
  common.isConformant(MenuHeader)
  common.forwardsRef(MenuHeader)
  common.rendersChildren(MenuHeader)
})
