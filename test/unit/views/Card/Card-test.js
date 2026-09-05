import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { SUI } from 'src/lib'
import Card from 'src/views/Card/Card'
import CardContent from 'src/views/Card/CardContent'
import CardDescription from 'src/views/Card/CardDescription'
import CardGroup from 'src/views/Card/CardGroup'
import CardHeader from 'src/views/Card/CardHeader'
import CardMeta from 'src/views/Card/CardMeta'
import * as common from 'test/support/commonTests'

describe('Card', () => {
  // Interactions go through user-event, which sends the pointer, focus and
  // keyboard sequence a browser does rather than the single event `fireEvent`
  // dispatches.
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  common.isConformant(Card)

  common.forwardsRef(Card)
  common.forwardsRef(Card, { requiredProps: { children: <span /> } })
  common.forwardsRef(Card, { requiredProps: { content: 'word' } })

  common.hasSubcomponents(Card, [CardContent, CardDescription, CardGroup, CardHeader, CardMeta])
  common.hasUIClassName(Card)
  common.rendersChildren(Card)

  common.propKeyOnlyToClassName(Card, 'centered')
  common.propKeyOnlyToClassName(Card, 'fluid')
  common.propKeyOnlyToClassName(Card, 'link')
  common.propKeyOnlyToClassName(Card, 'raised')

  common.propValueOnlyToClassName(Card, 'color', SUI.COLORS)

  it('renders a <div> by default', async () => {
    const { container } = render(<Card />)

    expect(container.firstElementChild.tagName).toBe('DIV')
  })

  describe('href', () => {
    it('renders an <a> with an href attr', async () => {
      const url = 'https://example.com'
      const { container } = render(<Card href={url} />)

      expect(container.firstElementChild.tagName).toBe('A')
      expect(container.firstElementChild).toHaveAttribute('href', url)
    })
  })

  describe('onClick', () => {
    it('renders <a> instead of <div>', async () => {
      const { container } = render(<Card onClick={vi.fn()} />)

      expect(container.firstElementChild.tagName).toBe('A')
    })

    it('is called with (e, data) when clicked', async () => {
      const onClick = vi.fn()
      const { container } = render(<Card onClick={onClick} />)

      await user.click(container.firstElementChild)

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls[0][0]).toMatchObject({ type: 'click' })
      expect(onClick.mock.calls[0][1]).toMatchObject({ onClick })
    })
  })

  describe('extra', () => {
    it('renders a CardContent', async () => {
      const { container } = render(<Card extra='faker phrase text' />)

      expect(container.querySelector('.extra.content')).not.toBeNull()
    })
  })
})
