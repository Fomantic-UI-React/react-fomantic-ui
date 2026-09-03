import ButtonGroup from 'src/elements/Button/ButtonGroup'
import { SUI } from 'src/lib'
import * as common from 'test/support/commonTests'

describe('ButtonGroup', () => {
  common.isConformant(ButtonGroup)
  common.forwardsRef(ButtonGroup)
  common.hasUIClassName(ButtonGroup)
  common.rendersChildren(ButtonGroup)

  common.implementsWidthProp(ButtonGroup, SUI.WIDTHS, {
    canEqual: false,
    propKey: 'widths',
    widthClass: 'buttons',
  })

  common.propKeyAndValueToClassName(ButtonGroup, 'floated', SUI.FLOATS)

  common.propKeyOnlyToClassName(ButtonGroup, 'basic')
  common.propKeyOnlyToClassName(ButtonGroup, 'vertical')

  common.propValueOnlyToClassName(ButtonGroup, 'color', SUI.COLORS)
  common.propValueOnlyToClassName(ButtonGroup, 'size', SUI.SIZES)
})
