import { dom } from 'test/support/rtl'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import AccordionAccordion from 'src/modules/Accordion/AccordionAccordion'
import * as common from 'test/support/commonTests'
import { consoleUtil } from 'test/support'

describe('AccordionAccordion', () => {
  // Interactions go through user-event, which sends the pointer, focus and
  // keyboard sequence a browser does rather than the single event `fireEvent`
  // dispatches.
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  common.isConformant(AccordionAccordion)
  common.forwardsRef(AccordionAccordion)
  common.rendersChildren(AccordionAccordion, {
    rendersContent: false,
  })

  common.implementsCreateMethod(AccordionAccordion)

  describe('activeIndex', () => {
    const panels = [
      { key: 'A', title: 'A', content: 'Something A' },
      { key: 'B', title: 'B', content: 'Something B' },
      { key: 'C', title: 'C', content: 'Something C' },
    ]

    it('there is no active items by default', async () => {
      expect(dom(<AccordionAccordion />).querySelector('.active')).toBeNull()
    })

    it('there is no active items by default when "exclusive" is false', async () => {
      expect(dom(<AccordionAccordion exclusive={false} />).querySelector('.active')).toBeNull()
    })

    it('activates an item', async () => {
      const container = dom(<AccordionAccordion activeIndex={0} panels={panels} />)

      expect(container.querySelectorAll('.title')[0]).toHaveClass('active')
      expect(container.querySelectorAll('.title')[1]).not.toHaveClass('active')
      expect(container.querySelectorAll('.title')[2]).not.toHaveClass('active')
    })

    it('items can be toggled by a click', async () => {
      const container = dom(<AccordionAccordion panels={panels} />)

      await user.click(container.querySelectorAll('.title')[0])
      expect(container.querySelectorAll('.title')[0]).toHaveClass('active')

      await user.click(container.querySelectorAll('.title')[0])
      expect(container.querySelectorAll('.title')[0]).not.toHaveClass('active')
    })

    it('activates a proper item', async () => {
      const { container, rerender } = render(<AccordionAccordion activeIndex={0} panels={panels} />)

      rerender(<AccordionAccordion activeIndex={1} panels={panels} />)
      expect(container.querySelectorAll('.title')[0]).not.toHaveClass('active')
      expect(container.querySelectorAll('.title')[1]).toHaveClass('active')
      expect(container.querySelectorAll('.title')[2]).not.toHaveClass('active')
    })

    it('can activate a single item when "exclusive" is false', async () => {
      const container = dom(
        <AccordionAccordion activeIndex={[0]} exclusive={false} panels={panels} />,
      )

      expect(container.querySelectorAll('.title')[0]).toHaveClass('active')
      expect(container.querySelectorAll('.title')[1]).not.toHaveClass('active')
      expect(container.querySelectorAll('.title')[2]).not.toHaveClass('active')
    })

    it('can activate multiple items when "exclusive" is false', async () => {
      const { container, rerender } = render(
        <AccordionAccordion activeIndex={[0, 1]} exclusive={false} panels={panels} />,
      )
      expect(container.querySelectorAll('.title')[0]).toHaveClass('active')
      expect(container.querySelectorAll('.title')[1]).toHaveClass('active')
      expect(container.querySelectorAll('.title')[2]).not.toHaveClass('active')

      rerender(<AccordionAccordion activeIndex={[1, 2]} exclusive={false} panels={panels} />)
      expect(container.querySelectorAll('.title')[0]).not.toHaveClass('active')
      expect(container.querySelectorAll('.title')[1]).toHaveClass('active')
      expect(container.querySelectorAll('.title')[2]).toHaveClass('active')
    })

    it('can be inclusive and can open multiple panels by clicking', async () => {
      const container = dom(<AccordionAccordion exclusive={false} panels={panels} />)

      await user.click(container.querySelectorAll('.title')[0])
      expect(container.querySelectorAll('.title')[0]).toHaveClass('active')

      await user.click(container.querySelectorAll('.title')[1])
      expect(container.querySelectorAll('.title')[0]).toHaveClass('active')
      expect(container.querySelectorAll('.title')[1]).toHaveClass('active')
    })

    it('can be inclusive and close multiple panels by clicking', async () => {
      const container = dom(
        <AccordionAccordion defaultActiveIndex={[0, 1]} exclusive={false} panels={panels} />,
      )

      await user.click(container.querySelectorAll('.title')[0])
      expect(container.querySelectorAll('.title')[0]).not.toHaveClass('active')
      expect(container.querySelectorAll('.title')[1]).toHaveClass('active')

      await user.click(container.querySelectorAll('.title')[1])
      expect(container.querySelectorAll('.title')[0]).not.toHaveClass('active')
      expect(container.querySelectorAll('.title')[1]).not.toHaveClass('active')
    })

    it('warns if is `exclusive` and is given an array', async () => {
      consoleUtil.disableOnce()

      const consoleError = vi.spyOn(console, 'error')
      dom(<AccordionAccordion exclusive activeIndex={[1]} />)

      expect(consoleError).toHaveBeenCalledTimes(1)
    })

    it('warns if not `exclusive` and is given a number', async () => {
      consoleUtil.disableOnce()

      const consoleError = vi.spyOn(console, 'error')
      dom(<AccordionAccordion exclusive={false} activeIndex={1} />)

      expect(consoleError).toHaveBeenCalledTimes(1)
    })
  })

  describe('defaultActiveIndex', () => {
    it('sets the initial activeIndex state', async () => {
      const container = dom(
        <AccordionAccordion
          defaultActiveIndex={1}
          panels={[
            { key: 'A', title: 'A', content: 'Something A' },
            { key: 'B', title: 'B', content: 'Something B' },
          ]}
        />,
      )

      expect(container.querySelectorAll('.title')[0]).not.toHaveClass('active')
      expect(container.querySelectorAll('.title')[1]).toHaveClass('active')
    })
  })

  describe('onTitleClick', () => {
    const panels = (onClick) => [
      { key: 'A', title: { content: 'A', onClick } },
      { key: 'B', title: 'B' },
    ]

    it('is called with (e, titleProps) when clicked', async () => {
      const onClick = vi.fn()
      const onTitleClick = vi.fn()
      const container = dom(
        <AccordionAccordion panels={panels(onClick)} onTitleClick={onTitleClick} />,
      )

      await user.click(container.querySelectorAll('.title')[0])

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls[0][1]).toMatchObject({ index: 0, content: 'A' })
      expect(onTitleClick).toHaveBeenCalledTimes(1)
      expect(onTitleClick.mock.calls[0][1]).toMatchObject({ index: 0, content: 'A' })
    })
  })

  describe('panels', () => {
    // Heads up! The frozen spec rendered once outside its tests and shared the
    // result, so the click assertions depended on execution order.
    const makePanels = (onClick) => [
      {
        key: 'A',
        title: { content: 'A', onClick },
        content: { content: 'Content A', 'data-foo': 'something' },
      },
      { key: 'B', title: 'B', content: { content: 'Content B', 'data-foo': 'something' } },
    ]

    it('renders children', async () => {
      const container = dom(<AccordionAccordion panels={makePanels(vi.fn())} />)
      const titles = container.querySelectorAll('.title')
      const contents = container.querySelectorAll('.content')

      expect(titles[0]).toHaveTextContent('A')
      expect(contents[0]).toHaveTextContent('Content A')
      expect(titles[1]).toHaveTextContent('B')
      expect(contents[1]).toHaveTextContent('Content B')
    })

    it('passes onClick handler', async () => {
      const onClick = vi.fn()
      const container = dom(<AccordionAccordion panels={makePanels(onClick)} />)

      await user.click(container.querySelectorAll('.title')[0])

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick.mock.calls[0][1]).toMatchObject({ content: 'A', index: 0 })
    })

    it('passes arbitrary props', async () => {
      const container = dom(<AccordionAccordion panels={makePanels(vi.fn())} />)

      for (const content of container.querySelectorAll('.content')) {
        expect(content).toHaveAttribute('data-foo', 'something')
      }
    })
  })
})
