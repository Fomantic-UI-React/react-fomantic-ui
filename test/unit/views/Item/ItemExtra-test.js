import ItemExtra from 'src/views/Item/ItemExtra'
import * as common from 'test/support/commonTests'

describe('ItemExtra', () => {
  common.isConformant(ItemExtra)
  common.forwardsRef(ItemExtra)
  common.rendersChildren(ItemExtra)

  common.implementsCreateMethod(ItemExtra)
})
