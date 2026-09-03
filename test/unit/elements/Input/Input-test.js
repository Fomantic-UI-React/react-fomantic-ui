import Input from 'src/elements/Input/Input'
import * as common from 'test/support/commonTests'

describe('Input', () => {
  common.forwardsRef(Input, { tagName: 'input' })
  common.hasUIClassName(Input)

  common.implementsButtonProp(Input, {
    autoGenerateKey: false,
    propKey: 'action',
  })
  common.implementsCreateMethod(Input)
  common.implementsHTMLInputProp(Input, {
    alwaysPresent: true,
    autoGenerateKey: false,
    shorthandDefaultProps: { type: 'text' },
  })
})
