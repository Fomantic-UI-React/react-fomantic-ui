import SidebarPushable from 'src/modules/Sidebar/SidebarPushable'
import * as common from 'test/support/commonTests'

describe('SidebarPushable', () => {
  common.isConformant(SidebarPushable)
  common.forwardsRef(SidebarPushable)
  common.rendersChildren(SidebarPushable)
})
