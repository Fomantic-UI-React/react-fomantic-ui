import { render } from '@testing-library/react'
import React from 'react'

import CommentAction from 'src/views/Comment/CommentAction'
import * as common from 'test/support/commonTests'

describe('CommentAction', () => {
  common.isConformant(CommentAction)
  common.forwardsRef(CommentAction, { tagName: 'a' })
  common.rendersChildren(CommentAction)

  it('renders an a element by default', () => {
    const { container } = render(<CommentAction />)

    expect(container.firstElementChild.tagName).toBe('A')
  })
})
