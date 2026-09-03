import Image from 'src/elements/Image/Image'
import * as common from 'test/support/commonTests'

describe('Image', () => {
  common.isConformant(Image)
  common.forwardsRef(Image, { tagName: 'img' })
  common.hasUIClassName(Image)

  common.implementsVerticalAlignProp(Image)

  common.propKeyOnlyToClassName(Image, 'avatar')
  common.propKeyOnlyToClassName(Image, 'rounded')
})
