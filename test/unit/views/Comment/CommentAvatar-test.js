import { render } from '@testing-library/react'
import React from 'react'

import { htmlImageProps } from 'src/lib'
import CommentAvatar from 'src/views/Comment/CommentAvatar'
import * as common from 'test/support/commonTests'

describe('CommentAvatar', () => {
  common.isConformant(CommentAvatar)
  common.forwardsRef(CommentAvatar)

  describe('src', () => {
    it('passes to the "img" element', () => {
      const { container } = render(<CommentAvatar src='/images/example.png' />)

      expect(container.querySelector('img')).toHaveAttribute('src', '/images/example.png')
    })
  })

  describe('image props', () => {
    for (const propName of htmlImageProps) {
      it(`passes "${propName}" to the "img" element`, () => {
        const { container } = render(<CommentAvatar src='foo.jpg' {...{ [propName]: 'word' }} />)

        // React lowercases DOM attribute names (srcSet -> srcset).
        expect(container.querySelector('img').getAttribute(propName.toLowerCase())).toBe('word')
      })
    }
  })
})
