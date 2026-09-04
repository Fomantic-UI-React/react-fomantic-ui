import DimmerDimmable from 'src/modules/Dimmer/DimmerDimmable'
import * as common from 'test/support/commonTests'

describe('DimmerDimmable', () => {
  common.isConformant(DimmerDimmable)
  common.forwardsRef(DimmerDimmable)
  common.rendersChildren(DimmerDimmable)

  common.propKeyOnlyToClassName(DimmerDimmable, 'blurring')
  common.propKeyOnlyToClassName(DimmerDimmable, 'dimmed')
})
