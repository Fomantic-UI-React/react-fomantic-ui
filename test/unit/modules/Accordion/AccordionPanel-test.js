import { dom } from 'test/support/rtl'
import { fireEvent } from '@testing-library/react'
import React from 'react'

import AccordionContent from 'src/modules/Accordion/AccordionContent'
import AccordionPanel from 'src/modules/Accordion/AccordionPanel'
import AccordionTitle from 'src/modules/Accordion/AccordionTitle'
import * as common from 'test/support/commonTests'

describe('AccordionPanel', () => {
  common.isConformant(AccordionPanel, { rendersChildren: false, forwardsRef: false })

  common.implementsShorthandProp(AccordionPanel, {
    assertExactMatch: false,
    autoGenerateKey: false,
    parentIsFragment: true,
    propKey: 'content',
    ShorthandComponent: AccordionContent,
    mapValueToProps: (content) => ({ content }),
  })
  common.implementsShorthandProp(AccordionPanel, {
    assertExactMatch: false,
    autoGenerateKey: false,
    parentIsFragment: true,
    propKey: 'title',
    ShorthandComponent: AccordionTitle,
    mapValueToProps: (content) => ({ content }),
  })

  describe('active', () => {
    it('should passed to children', () => {
      const container = dom(<AccordionPanel active content='Content' title='Title' />)

      expect(container.querySelector('.title')).toHaveClass('active')
      expect(container.querySelector('.content')).toHaveClass('active')
    })
  })

  describe('index', () => {
    // AccordionPanel renders a fragment: the title and content are siblings in
    // the container, not children of a wrapper.
    it('should passed to title', () => {
      const onTitleClick = vi.fn()
      const container = dom(
        <AccordionPanel content='Content' index={5} onTitleClick={onTitleClick} title='Title' />,
      )

      fireEvent.click(container.querySelector('.title'))

      expect(onTitleClick.mock.calls[0][1]).toMatchObject({ index: 5 })
    })
  })

  describe('onTitleClick', () => {
    it('is called with (e, titleProps) when clicked', () => {
      const onClick = vi.fn()
      const onTitleClick = vi.fn()

      const container = dom(
        <AccordionPanel
          content='Content'
          onTitleClick={onTitleClick}
          title={{ content: 'Title', onClick }}
        />,
      )
      fireEvent.click(container.querySelector('.title'))

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls[0][1]).toMatchObject({ content: 'Title' })

      expect(onTitleClick).toHaveBeenCalledTimes(1)
      expect(onTitleClick.mock.calls[0][1]).toMatchObject({ content: 'Title' })
    })
  })
})
