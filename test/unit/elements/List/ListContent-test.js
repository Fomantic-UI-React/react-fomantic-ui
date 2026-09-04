import React from 'react'

import ListContent from 'src/elements/List/ListContent'
import { SUI } from 'src/lib'
import * as common from 'test/support/commonTests'
import { dom } from 'test/support/rtl'

describe('ListContent', () => {
  common.isConformant(ListContent)
  common.forwardsRef(ListContent)
  common.forwardsRef(ListContent, { requiredProps: { children: <span /> } })
  common.rendersChildren(ListContent)

  common.implementsCreateMethod(ListContent)

  common.implementsVerticalAlignProp(ListContent)
  common.propKeyAndValueToClassName(ListContent, 'floated', SUI.FLOATS)

  describe('shorthand', () => {
    const baseProps = {
      content: 'faker phrase text',
      description: 'faker phrase text',
      header: 'faker phrase text',
    }

    it('renders content without wrapping ListContent', () => {
      const container = dom(<ListContent {...baseProps} />)

      expect(container.querySelector('.header')).toHaveTextContent(baseProps.header)
      expect(container.querySelector('.description')).toHaveTextContent(baseProps.description)
      expect(container).toHaveTextContent(baseProps.content)
    })
  })
})
