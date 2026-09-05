import { root } from 'test/support/rtl'

import userEvent from '@testing-library/user-event'
import React from 'react'

import AccordionTitle from 'src/modules/Accordion/AccordionTitle'
import * as common from 'test/support/commonTests'

describe('AccordionTitle', () => {
  // Interactions go through user-event, which sends the pointer, focus and
  // keyboard sequence a browser does rather than the single event `fireEvent`
  // dispatches.
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

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
    it('is called with (e, { name, index }) when clicked', async () => {
      const onClick = vi.fn()
      const props = { content: 'title', index: 0 }

      await user.click(root(<AccordionTitle onClick={onClick} {...props} />))

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls[0][0]).toMatchObject({ type: 'click' })
      expect(onClick.mock.calls[0][1]).toMatchObject(props)
    })
  })
})
