import DropdownHeader from 'src/modules/Dropdown/DropdownHeader'
import * as common from 'test/support/commonTests'

describe('DropdownHeader', () => {
  common.isConformant(DropdownHeader)
  common.forwardsRef(DropdownHeader)
  common.rendersChildren(DropdownHeader)

  common.implementsIconProp(DropdownHeader, { autoGenerateKey: false })
})
