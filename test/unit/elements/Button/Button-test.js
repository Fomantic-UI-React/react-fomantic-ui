import Button from 'src/elements/Button/Button'
import ButtonContent from 'src/elements/Button/ButtonContent'
import ButtonGroup from 'src/elements/Button/ButtonGroup'
import ButtonOr from 'src/elements/Button/ButtonOr'
import * as common from 'test/support/commonTests'

describe('Button', () => {
  common.isConformant(Button)
  common.forwardsRef(Button, { tagName: 'button' })
  common.forwardsRef(Button, { requiredProps: { label: 'foo' }, tagName: 'button' })
  common.hasSubcomponents(Button, [ButtonContent, ButtonGroup, ButtonOr])
  common.hasUIClassName(Button)
  common.implementsCreateMethod(Button)
})
