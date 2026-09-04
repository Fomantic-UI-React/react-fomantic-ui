import ModalDescription from 'src/modules/Modal/ModalDescription'
import * as common from 'test/support/commonTests'

describe('ModalDescription', () => {
  common.isConformant(ModalDescription)
  common.forwardsRef(ModalDescription)
  common.rendersChildren(ModalDescription)
})
