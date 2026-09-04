import ListHeader from 'src/elements/List/ListHeader'
import * as common from 'test/support/commonTests'

describe('ListHeader', () => {
  common.isConformant(ListHeader)
  common.forwardsRef(ListHeader)
  common.rendersChildren(ListHeader)

  common.implementsCreateMethod(ListHeader)
})
