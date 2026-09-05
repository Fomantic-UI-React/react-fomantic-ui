import { dom, root } from 'test/support/rtl'

import userEvent from '@testing-library/user-event'
import React from 'react'

import Step from 'src/elements/Step/Step'
import StepContent from 'src/elements/Step/StepContent'
import StepDescription from 'src/elements/Step/StepDescription'
import StepTitle from 'src/elements/Step/StepTitle'
import * as common from 'test/support/commonTests'

describe('Step', () => {
  // Interactions go through user-event, which sends the pointer, focus and
  // keyboard sequence a browser does rather than the single event `fireEvent`
  // dispatches.
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  common.isConformant(Step)
  common.forwardsRef(Step)
  common.forwardsRef(Step, { requiredProps: { content: 'word' } })
  common.forwardsRef(Step, { requiredProps: { content: <span /> } })
  common.hasSubcomponents(Step, [StepContent, StepDescription, StepTitle])
  common.rendersChildren(Step)

  common.implementsIconProp(Step, { autoGenerateKey: false })

  common.propKeyOnlyToClassName(Step, 'active')
  common.propKeyOnlyToClassName(Step, 'completed')
  common.propKeyOnlyToClassName(Step, 'disabled')
  common.propKeyOnlyToClassName(Step, 'link')

  it('renders as a div by default', async () => {
    expect(root(<Step />)).toHaveTagName('div')
  })

  describe('children', () => {
    it('are rendered without a StepContent wrapper', async () => {
      const container = dom(<Step>the children</Step>)

      expect(container).toHaveTextContent('the children')
      expect(container.querySelector('.content')).toBeNull()
    })
  })

  describe('description', () => {
    it('passes prop to StepContent', async () => {
      const description = 'the description'

      expect(
        dom(<Step description={description} />).querySelector('.description'),
      ).toHaveTextContent(description)
    })
  })

  describe('href', () => {
    it('renders as `a` when defined', async () => {
      const url = 'https://example.com'
      const step = root(<Step href={url} />)

      expect(step).toHaveTagName('a')
      expect(step).toHaveAttribute('href', url)
    })
  })

  describe('onClick', () => {
    it('is called with (e, data) when clicked', async () => {
      const onClick = vi.fn()

      await user.click(root(<Step onClick={onClick} />))

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls[0][0]).toMatchObject({ type: 'click' })
      expect(onClick.mock.calls[0][1]).toMatchObject({ onClick })
    })

    it('is not called when is disabled', async () => {
      const onClick = vi.fn()

      await user.click(root(<Step disabled onClick={onClick} />))

      expect(onClick).not.toHaveBeenCalled()
    })

    it('renders as `a` when defined', async () => {
      expect(root(<Step onClick={() => null} />)).toHaveTagName('a')
    })
  })

  describe('title', () => {
    it('passes prop to StepContent', async () => {
      const title = 'the title'

      expect(dom(<Step title={title} />).querySelector('.title')).toHaveTextContent(title)
    })
  })
})
