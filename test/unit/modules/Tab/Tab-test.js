import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import Tab from 'src/modules/Tab/Tab'
import TabPane from 'src/modules/Tab/TabPane'
import * as common from 'test/support/commonTests'

describe('Tab', () => {
  common.isConformant(Tab)
  common.forwardsRef(Tab)
  common.forwardsRef(Tab, { requiredProps: { menu: { vertical: true } } })
  common.hasSubcomponents(Tab, [TabPane])

  const panes = [
    { menuItem: 'Tab 1', render: () => <Tab.Pane>Tab 1 Content</Tab.Pane> },
    { menuItem: 'Tab 2', render: () => <Tab.Pane>Tab 2 Content</Tab.Pane> },
    { menuItem: 'Tab 3', render: () => <Tab.Pane>Tab 3 Content</Tab.Pane> },
  ]

  // The frozen spec reached the Menu, the Grid columns and the panes as React
  // elements. Each renders a class name of its own, so the DOM equivalent is a
  // class selector — and unlike the element tree it also proves they rendered.
  const menuOf = (container) => container.querySelector('.menu')
  const itemsOf = (container) => [...container.querySelectorAll('.menu .item')]
  const panesOf = (container) => [...container.querySelectorAll('.tab')]
  const columnsOf = (container) => [...container.querySelectorAll('.ui.grid > .column')]
  const childrenOf = (container) => [...container.firstElementChild.children]

  // Menu items are clicked through user-event, which sends the pointer and
  // focus sequence a browser does rather than the lone `click` fireEvent
  // dispatches.
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  describe('menu', () => {
    it('passes the props to the Menu', () => {
      const { container } = render(<Tab menu={{ 'data-foo': 'bar' }} />)

      expect(menuOf(container)).toHaveAttribute('data-foo', 'bar')
    })

    it('has an item for every menuItem in panes', () => {
      const { container } = render(<Tab panes={panes} />)
      const items = itemsOf(container)

      expect(items).toHaveLength(3)
      expect(items[0]).toHaveTextContent('Tab 1')
      expect(items[1]).toHaveTextContent('Tab 2')
      expect(items[2]).toHaveTextContent('Tab 3')
    })

    it('renders above the pane by default', () => {
      const { container } = render(<Tab panes={panes} />)
      const [first, second] = childrenOf(container)

      expect(first).toHaveClass('menu')
      expect(second).toHaveClass('tab')
    })

    it("renders below the pane when attached='bottom'", () => {
      const { container } = render(<Tab menu={{ attached: 'bottom' }} panes={panes} />)
      const [first, second] = childrenOf(container)

      expect(first).toHaveClass('tab')
      expect(second).toHaveClass('menu')
    })

    it("infers tabular's value from tab's menuPosition if tabular is set to true", () => {
      const menu = { fluid: true, vertical: true, tabular: true }
      const { container } = render(<Tab menu={menu} menuPosition='right' panes={panes} />)
      const [paneColumn, menuColumn] = columnsOf(container)

      expect(paneColumn.firstElementChild).toHaveClass('tab')
      expect(menuColumn.firstElementChild).toHaveClass('menu')
      expect(menuOf(container)).toHaveClass('right', 'tabular')
    })

    it("does not infer tabular's value from tab's menuPosition if tabular is explicitly set", () => {
      const menu = { fluid: true, vertical: true, tabular: 'right' }
      const { container } = render(<Tab menu={menu} menuPosition='left' panes={panes} />)
      const [menuColumn, paneColumn] = columnsOf(container)

      expect(menuColumn.firstElementChild).toHaveClass('menu')
      expect(paneColumn.firstElementChild).toHaveClass('tab')
      expect(menuOf(container)).toHaveClass('right', 'tabular')
    })

    it('renders right when tabular is set to right', () => {
      const menu = { fluid: true, vertical: true, tabular: 'right' }
      const { container } = render(<Tab menu={menu} panes={panes} />)
      const [paneColumn, menuColumn] = columnsOf(container)

      expect(paneColumn.firstElementChild).toHaveClass('tab')
      expect(menuColumn.firstElementChild).toHaveClass('menu')
    })
  })

  describe('menuPosition', () => {
    it('renders left of the pane when set left', () => {
      const menu = { fluid: true, vertical: true }
      const { container } = render(<Tab menu={menu} menuPosition='left' panes={panes} />)
      const [menuColumn, paneColumn] = columnsOf(container)

      expect(menuColumn.firstElementChild).toHaveClass('menu')
      expect(paneColumn.firstElementChild).toHaveClass('tab')
    })

    it("renders left of the pane when set 'left', even if tabular is right", () => {
      const menu = { fluid: true, vertical: true, tabular: 'right' }
      const { container } = render(<Tab menu={menu} menuPosition='left' panes={panes} />)
      const [menuColumn, paneColumn] = columnsOf(container)

      expect(menuColumn.firstElementChild).toHaveClass('menu')
      expect(paneColumn.firstElementChild).toHaveClass('tab')
    })

    it("renders right of the pane when set 'right'", () => {
      const menu = { fluid: true, vertical: true }
      const { container } = render(<Tab menu={menu} menuPosition='right' panes={panes} />)
      const [paneColumn, menuColumn] = columnsOf(container)

      expect(paneColumn.firstElementChild).toHaveClass('tab')
      expect(menuColumn.firstElementChild).toHaveClass('menu')
    })
  })

  describe('activeIndex', () => {
    // Enzyme read `activeIndex` off the Menu element. The Menu turns it into
    // the `active` class on one item, which is what the prop is for.
    it('is passed to the Menu', () => {
      const { container } = render(<Tab panes={panes} activeIndex={1} />)
      const items = itemsOf(container)

      expect(items[0]).not.toHaveClass('active')
      expect(items[1]).toHaveClass('active')
      expect(items[2]).not.toHaveClass('active')
    })

    it('is set when clicking an item', async () => {
      const { container } = render(<Tab panes={panes} />)

      expect(container).toHaveTextContent('Tab 1 Content')

      await user.click(itemsOf(container)[1])
      expect(container).toHaveTextContent('Tab 2 Content')
    })

    it('can be set via props', () => {
      const { container, rerender } = render(<Tab panes={panes} activeIndex={1} />)

      expect(container).toHaveTextContent('Tab 2 Content')

      rerender(<Tab panes={panes} activeIndex={2} />)
      expect(container).toHaveTextContent('Tab 3 Content')
    })

    it('determines which pane render method is called', () => {
      // Copied rather than spied in place: the spy would outlive this test on
      // the shared `panes`, which is how three specs in this suite grew an
      // order dependency (see PLAN.md, PR 7d).
      const ownPanes = panes.map((pane) => ({ ...pane }))
      const props = { activeIndex: 1, panes: ownPanes }
      const spy = vi.spyOn(ownPanes[1], 'render')

      render(<Tab {...props} />)

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(expect.objectContaining(props))
    })
  })

  describe('onTabChange', () => {
    it('is called with (e, { ...props, activeIndex }) when a menu item is clicked', async () => {
      // The frozen spec passed a `{ fake: 'event' }` object through Enzyme's
      // `simulate()` and asserted it arrived. React only ever hands a DOM
      // handler the event, so the real event is what is asserted here.
      const onTabChange = vi.fn()
      const props = { onTabChange, panes }
      const { container } = render(<Tab {...props} />)

      await user.click(itemsOf(container)[1])

      expect(onTabChange).toHaveBeenCalledTimes(1)
      expect(onTabChange).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'click' }),
        expect.objectContaining({ ...props, activeIndex: 1 }),
      )
    })

    it('is called with the new proposed activeIndex, not the current', async () => {
      const onTabChange = vi.fn()
      const { container } = render(<Tab activeIndex={-1} onTabChange={onTabChange} panes={panes} />)
      const items = itemsOf(container)

      expect(onTabChange).not.toHaveBeenCalled()

      for (const index of [0, 1, 2]) {
        // eslint-disable-next-line no-await-in-loop -- clicks are a sequence
        await user.click(items[index])

        expect(onTabChange).toHaveBeenCalledTimes(index + 1)
        expect(onTabChange).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({ activeIndex: index }),
        )
      }
    })
  })

  describe('renderActiveOnly', () => {
    it('renders all tabs when false', () => {
      const textPanes = [{ pane: 'Tab 1' }, { pane: 'Tab 2' }, { pane: 'Tab 3' }]
      const { container } = render(<Tab panes={textPanes} renderActiveOnly={false} />)
      const tabPanes = panesOf(container)

      expect(tabPanes).toHaveLength(3)
      expect(tabPanes[0]).toHaveTextContent('Tab 1')
      expect(tabPanes[1]).toHaveTextContent('Tab 2')
      expect(tabPanes[2]).toHaveTextContent('Tab 3')
    })
  })
})
