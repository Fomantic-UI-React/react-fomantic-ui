import * as common from 'test/support/commonTests'
import RevealContent from 'src/elements/Reveal/RevealContent'

describe('RevealContent', () => {
  common.isConformant(RevealContent)
  common.forwardsRef(RevealContent)
  common.rendersChildren(RevealContent)

  common.propKeyOnlyToClassName(RevealContent, 'hidden')
  common.propKeyOnlyToClassName(RevealContent, 'visible')
})
