import { render } from '@testing-library/react'
import React from 'react'

import ItemImage from 'src/views/Item/ItemImage'
import * as common from 'test/support/commonTests'

describe('ItemImage', () => {
  common.isConformant(ItemImage, { rendersChildren: false })
  common.forwardsRef(ItemImage, { tagName: 'img' })
  common.implementsCreateMethod(ItemImage)

  it('renders an Image', () => {
    const { container } = render(<ItemImage />)

    expect(container.firstElementChild).toHaveClass('image')
    expect(container.querySelector('img')).not.toBeNull()
  })

  // The old spec asserted the `wrapped` and `ui` props Image received. Those are
  // internals; what they produce is a wrapper element that carries "ui" only
  // once a size is given.
  it('is wrapped without ui', () => {
    const { container } = render(<ItemImage />)

    expect(container.firstElementChild).not.toHaveClass('ui')
  })

  it('has ui with size prop', () => {
    const { container } = render(<ItemImage size='small' />)

    expect(container.firstElementChild).toHaveClass('ui')
  })
})
