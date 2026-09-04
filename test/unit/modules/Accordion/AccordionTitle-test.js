import { root } from 'test/support/rtl'
import { fireEvent } from '@testing-library/react'
import React from 'react'

import AccordionTitle from 'src/modules/Accordion/AccordionTitle'
import * as common from 'test/support/commonTests'

describe('AccordionTitle', () => {
  common.isConformant(AccordionTitle)
  common.forwardsRef(AccordionTitle)
  common.rendersChildren(AccordionTitle)

  common.implementsCreateMethod(AccordionTitle)
  common.implementsIconProp(AccordionTitle, {
    alwaysPresent: true,
    autoGenerateKey: false,
  })

  common.propKeyOnlyToClassName(AccordionTitle, 'active')

  describe('onClick', () => {
    it('is called with (e, { name, index }) when clicked', () => {
      const onClick = vi.fn()
      const props = { content: 'title', index: 0 }

      fireEvent.click(root(<AccordionTitle onClick={onClick} {...props} />))

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls[0][0]).toMatchObject({ type: 'click' })
      expect(onClick.mock.calls[0][1]).toMatchObject(props)
    })
  })
})
