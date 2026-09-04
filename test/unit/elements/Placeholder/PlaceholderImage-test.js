import PlaceholderImage from 'src/elements/Placeholder/PlaceholderImage'
import * as common from 'test/support/commonTests'

describe('PlaceholderImage', () => {
  common.isConformant(PlaceholderImage)
  common.forwardsRef(PlaceholderImage)

  common.propKeyOnlyToClassName(PlaceholderImage, 'square')
  common.propKeyOnlyToClassName(PlaceholderImage, 'rectangular')
})
