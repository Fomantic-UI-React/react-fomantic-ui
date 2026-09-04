import { dom, root } from 'test/support/rtl'
import { fireEvent } from '@testing-library/react'
import React from 'react'

import Step from 'src/elements/Step/Step'
import StepContent from 'src/elements/Step/StepContent'
import StepDescription from 'src/elements/Step/StepDescription'
import StepTitle from 'src/elements/Step/StepTitle'
import * as common from 'test/support/commonTests'

describe('Step', () => {
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

  it('renders as a div by default', () => {
    expect(root(<Step />)).toHaveTagName('div')
  })

  describe('children', () => {
    it('are rendered without a StepContent wrapper', () => {
      const container = dom(<Step>the children</Step>)

      expect(container).toHaveTextContent('the children')
      expect(container.querySelector('.content')).toBeNull()
    })
  })

  describe('description', () => {
    it('passes prop to StepContent', () => {
      const description = 'the description'

      expect(
        dom(<Step description={description} />).querySelector('.description'),
      ).toHaveTextContent(description)
    })
  })

  describe('href', () => {
    it('renders as `a` when defined', () => {
      const url = 'https://example.com'
      const step = root(<Step href={url} />)

      expect(step).toHaveTagName('a')
      expect(step).toHaveAttribute('href', url)
    })
  })

  describe('onClick', () => {
    it('is called with (e, data) when clicked', () => {
      const onClick = vi.fn()

      fireEvent.click(root(<Step onClick={onClick} />))

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls[0][0]).toMatchObject({ type: 'click' })
      expect(onClick.mock.calls[0][1]).toMatchObject({ onClick })
    })

    it('is not called when is disabled', () => {
      const onClick = vi.fn()

      fireEvent.click(root(<Step disabled onClick={onClick} />))

      expect(onClick).not.toHaveBeenCalled()
    })

    it('renders as `a` when defined', () => {
      expect(root(<Step onClick={() => null} />)).toHaveTagName('a')
    })
  })

  describe('title', () => {
    it('passes prop to StepContent', () => {
      const title = 'the title'

      expect(dom(<Step title={title} />).querySelector('.title')).toHaveTextContent(title)
    })
  })
})
