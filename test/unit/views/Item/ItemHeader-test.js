import ItemHeader from 'src/views/Item/ItemHeader'
import * as common from 'test/support/commonTests'

describe('ItemHeader', () => {
  common.isConformant(ItemHeader)
  common.forwardsRef(ItemHeader)
  common.rendersChildren(ItemHeader)

  common.implementsCreateMethod(ItemHeader)
})
