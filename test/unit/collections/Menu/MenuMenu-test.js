import MenuMenu from 'src/collections/Menu/MenuMenu'
import * as common from 'test/support/commonTests'

describe('MenuMenu', () => {
  common.isConformant(MenuMenu)
  common.forwardsRef(MenuMenu)
  common.rendersChildren(MenuMenu)

  common.propValueOnlyToClassName(MenuMenu, 'position', ['left', 'right'])
})
