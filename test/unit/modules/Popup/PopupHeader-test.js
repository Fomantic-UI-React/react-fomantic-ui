import PopupHeader from 'src/modules/Popup/PopupHeader'
import * as common from 'test/support/commonTests'

describe('PopupHeader', () => {
  common.isConformant(PopupHeader)
  common.forwardsRef(PopupHeader)
  common.rendersChildren(PopupHeader)

  common.implementsCreateMethod(PopupHeader)
})
