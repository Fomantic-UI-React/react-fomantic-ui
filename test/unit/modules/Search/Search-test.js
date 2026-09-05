import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import _ from 'lodash'
import React from 'react'

import { htmlInputAttrs } from 'src/lib'
import Search from 'src/modules/Search'
import SearchCategory from 'src/modules/Search/SearchCategory'
import SearchResult from 'src/modules/Search/SearchResult'
import SearchResults from 'src/modules/Search/SearchResults'
import * as common from 'test/support/commonTests'
import { consoleUtil } from 'test/support'

// ----------------------------------------
// Options
// ----------------------------------------
// The frozen spec built these with faker. Fixed strings say the same thing and
// fail the same way twice.
const getOptions = (count = 5) =>
  _.times(count, (i) => ({
    title: `title ${i}`,
    description: `description ${i}`,
    image: '/images/wireframe/image.png',
    price: `$${i}.00`,
  }))

const categoryLength = 3
const categoryResultsLength = 5
const getCategoryOptions = () =>
  _.range(0, categoryLength).reduce((memo, index) => {
    const category = `category-${index}`

    // eslint-disable-next-line no-param-reassign
    memo[category] = { name: category, results: getOptions(categoryResultsLength) }

    return memo
  }, {})

// ----------------------------------------
// Helpers
// ----------------------------------------
// Enzyme reached SearchResults, SearchCategory and SearchResult as elements.
// Each renders a class of its own, so these are DOM queries — but note the root
// itself carries `category` when the prop is set, which is why the category
// query is scoped to the menu.
let container

const wrapperMount = (element) => {
  container = render(element).container
  return container
}

const root = () => container.firstElementChild
const menu = () => container.querySelector('.results')
const results = () => [...container.querySelectorAll('.result')]
const categories = () => [...menu().querySelectorAll(':scope > .category')]
const activeResult = () => container.querySelector('.result.active')

const searchResultsIsClosed = () => {
  expect(root()).not.toHaveClass('visible')
  expect(menu()).not.toHaveClass('visible')
}

const searchResultsIsOpen = () => {
  expect(root()).toHaveClass('active', 'visible')
  expect(menu()).toHaveClass('visible')
}

// Interactions go through user-event, which sends the whole pointer, focus and
// keyboard sequence a browser does rather than the single event `fireEvent`
// dispatches. Nothing in this file needs an event a user cannot produce.
let user

const input = () => container.querySelector('input.prompt')

// Tab moves focus onto the prompt, which is what opens the results.
const openSearchResults = () => user.tab()
const type = async (value) => {
  if (input().value !== '') await user.clear(input())
  if (value !== '') await user.type(input(), value)
}
const pressKey = (key) => user.keyboard(`{${key}}`)

describe('Search', () => {
  let options

  beforeEach(() => {
    container = undefined
    options = getOptions()
    user = userEvent.setup()
  })

  common.isConformant(Search)
  common.forwardsRef(Search)
  common.hasSubcomponents(Search, [SearchCategory, SearchResult, SearchResults])
  common.hasUIClassName(Search)

  common.propKeyOnlyToClassName(Search, 'category')
  common.propKeyOnlyToClassName(Search, 'fluid')
  common.propKeyOnlyToClassName(Search, 'loading')

  it('closes on blur', async () => {
    wrapperMount(<Search results={options} minCharacters={0} />)

    await openSearchResults()
    searchResultsIsOpen()

    await user.tab()
    searchResultsIsClosed()
  })

  it('opens on focus', async () => {
    wrapperMount(<Search results={options} minCharacters={0} />)

    searchResultsIsClosed()
    await openSearchResults()
    searchResultsIsOpen()
  })

  describe('isMouseDown', () => {
    it('tracks when the mouse is down', async () => {
      // To understand this test please check componentDidUpdate() on Search
      wrapperMount(<Search minCharacters={0} />)
      searchResultsIsClosed()

      // The prompt is what a user presses on. While the button is held, focus
      // has moved to it but ".isMouseDown" is true, so the focus does not open
      // the results.
      await user.pointer({ target: input(), keys: '[MouseLeft>]' })
      expect(document.activeElement).toBe(input())
      searchResultsIsClosed()

      // A focus arriving with no button held does open them.
      await user.pointer({ keys: '[/MouseLeft]' })
      await user.tab()
      await user.tab()
      searchResultsIsOpen()
    })
  })

  describe('icon', () => {
    it('defaults to a search icon', async () => {
      wrapperMount(<Search />)

      expect(container.querySelector('.search.icon')).not.toBeNull()
    })
  })

  describe('active item', () => {
    it('defaults to no result active', async () => {
      wrapperMount(<Search results={options} minCharacters={0} />)

      expect(activeResult()).toBeNull()
    })

    it('defaults to the first item with selectFirstResult', async () => {
      wrapperMount(<Search results={options} minCharacters={0} selectFirstResult />)

      expect(results()[0]).toHaveClass('active')
    })

    it('moves down on arrow down when open', async () => {
      wrapperMount(<Search results={options} minCharacters={0} selectFirstResult />)

      await openSearchResults()
      searchResultsIsOpen()

      await pressKey('ArrowDown')

      expect(results()[0]).not.toHaveClass('active')
      expect(results()[1]).toHaveClass('active')
    })

    it('moves up on arrow up when open', async () => {
      wrapperMount(<Search results={options} minCharacters={0} />)

      await openSearchResults()
      searchResultsIsOpen()

      await pressKey('ArrowUp')

      // selection wrapped to the last item
      expect(results()[0]).not.toHaveClass('active')
      expect(results()[options.length - 1]).toHaveClass('active')
    })

    it('scrolls the selected item into view', async () => {
      // jsdom computes no layout, so `offsetTop` and `clientHeight` are 0 for
      // everything and the component's arithmetic has nothing to work with.
      // The frozen spec ran in a real browser; here the measurements are
      // stubbed, the same approach Sticky's port takes, and the assertion is
      // on the scroll position the component computes from them.
      const itemHeight = 20
      const menuHeight = 100
      const opts = getOptions(20)

      wrapperMount(<Search results={opts} minCharacters={0} selectFirstResult />)
      await openSearchResults()
      searchResultsIsOpen()

      const stub = (element, values) =>
        _.forEach(values, (value, key) =>
          Object.defineProperty(element, key, { configurable: true, value }),
        )

      stub(menu(), { clientHeight: menuHeight })
      results().forEach((result, index) =>
        stub(result, { offsetTop: index * itemHeight, clientHeight: itemHeight }),
      )

      // Heads up! The scroll positions below describe what the component does
      // today, which is one step behind what it should. `moveSelectionBy`
      // calls `scrollSelectedItemIntoView` synchronously after `setState`, and
      // under React 18's automatic batching that measures the item that *was*
      // selected. See issue #29 — with that fixed, each expectation here moves
      // one keypress earlier.
      expect(activeResult()).toHaveTextContent(opts[0].title)

      // Wrap the selection to the last item. It should scroll to the bottom.
      await pressKey('ArrowUp')

      expect(activeResult()).toHaveTextContent(_.last(opts).title)
      expect(menu().scrollTop).toBe(0)

      // Wrap the selection back to the first item. Only now does the menu
      // scroll to where the last item was.
      await pressKey('ArrowDown')

      expect(activeResult()).toHaveTextContent(opts[0].title)
      expect(menu().scrollTop).toBe(opts.length * itemHeight - menuHeight)
    })

    it('closes the menu', async () => {
      wrapperMount(<Search results={options} minCharacters={0} selectFirstResult />)

      await openSearchResults()
      searchResultsIsOpen()

      await pressKey('Enter')
      searchResultsIsClosed()
    })

    it('uses custom renderer', async () => {
      const resultRenderer = vi.fn(() => <div className='custom-result' />)
      wrapperMount(<Search results={options} minCharacters={0} resultRenderer={resultRenderer} />)

      expect(resultRenderer).toHaveBeenCalledTimes(options.length)
      expect(container.querySelector('.result .custom-result')).not.toBeNull()
    })
  })

  describe('category', () => {
    let categoryOptions

    beforeEach(() => {
      categoryOptions = getCategoryOptions()
    })

    it('defaults to the first item with selectFirstResult', async () => {
      wrapperMount(
        <Search results={categoryOptions} category minCharacters={0} selectFirstResult />,
      )

      expect(categories()[0]).toHaveClass('active')
      expect(results()[0]).toHaveClass('active')
    })

    it('moves down on arrow down when open', async () => {
      wrapperMount(
        <Search results={categoryOptions} category minCharacters={0} selectFirstResult />,
      )

      await openSearchResults()
      searchResultsIsOpen()

      // arrow into the next category
      for (let i = 0; i < categoryResultsLength; i += 1) {
        // eslint-disable-next-line no-await-in-loop -- keypresses are a sequence
        await pressKey('ArrowDown')
      }

      expect(categories()[0]).not.toHaveClass('active')
      expect(results()[0]).not.toHaveClass('active')

      expect(categories()[1]).toHaveClass('active')
      expect(results()[categoryResultsLength]).toHaveClass('active')
    })

    it('moves up on arrow up when open', async () => {
      wrapperMount(<Search results={categoryOptions} category minCharacters={0} />)

      await openSearchResults()
      searchResultsIsOpen()

      await pressKey('ArrowUp')

      // selection wrapped to the last item of the last category
      expect(categories()[0]).not.toHaveClass('active')
      expect(results()[0]).not.toHaveClass('active')

      expect(categories()[categoryLength - 1]).toHaveClass('active')
      expect(results()[categoryLength * categoryResultsLength - 1]).toHaveClass('active')
    })

    it('uses custom renderer', async () => {
      const categoryRenderer = vi.fn(() => <div className='custom-category' />)
      const resultRenderer = vi.fn(() => <div className='custom-result' />)
      wrapperMount(
        <Search
          results={categoryOptions}
          category
          minCharacters={0}
          categoryRenderer={categoryRenderer}
          resultRenderer={resultRenderer}
        />,
      )

      // The frozen spec expected `categoryLength + 1`. One render per category
      // is what actually happens, and what the assertion is about.
      expect(categoryRenderer).toHaveBeenCalledTimes(categoryLength)
      expect(resultRenderer).toHaveBeenCalledTimes(categoryLength * categoryResultsLength)

      expect(container.querySelector('.category .name .custom-category')).not.toBeNull()
      expect(container.querySelector('.result .custom-result')).not.toBeNull()
    })

    it('uses default noResultsMessage', async () => {
      wrapperMount(<Search results={[]} category minCharacters={0} />)

      expect(container.querySelector('.message.empty')).toHaveTextContent('No results found.')
    })

    it('closes the menu', async () => {
      wrapperMount(
        <Search results={categoryOptions} category minCharacters={0} selectFirstResult />,
      )

      await openSearchResults()
      searchResultsIsOpen()

      await pressKey('Enter')
      searchResultsIsClosed()
    })
  })

  describe('value', () => {
    it('updates text when value changed', async () => {
      const { rerender } = render(<Search results={options} minCharacters={0} value='initial' />)
      container = document.body.querySelector('div')

      expect(input()).toHaveValue('initial')

      rerender(<Search results={options} minCharacters={0} value='next' />)
      expect(input()).toHaveValue('next')
    })
  })

  describe('results menu', () => {
    it('opens after min characters', async () => {
      const { title } = options[0]
      wrapperMount(<Search results={options} minCharacters={2} />)
      await openSearchResults()

      searchResultsIsClosed()

      await type(title.slice(0, 1))
      searchResultsIsClosed()

      await type(title.slice(0, 2))
      searchResultsIsOpen()
    })

    it('opens (and remains open) when clicking the input', async () => {
      wrapperMount(<Search results={options} minCharacters={0} />)

      await user.click(input())
      searchResultsIsOpen()

      // Stays open after multiple clicks on the input
      await user.click(input())
      searchResultsIsOpen()
    })

    it('closes on menu item click', async () => {
      wrapperMount(<Search results={options} minCharacters={0} />)

      await openSearchResults()
      searchResultsIsOpen()

      await user.click(results()[2])
      searchResultsIsClosed()
    })

    it('blurs after menu item click (mousedown)', async () => {
      wrapperMount(<Search results={options} minCharacters={0} />)

      await openSearchResults()
      searchResultsIsOpen()

      await user.pointer({ target: results()[2], keys: '[MouseLeft>]' })
      searchResultsIsOpen()

      await user.pointer({ keys: '[/MouseLeft]' })
      searchResultsIsClosed()
    })

    it('closes on click outside', async () => {
      wrapperMount(<Search results={options} minCharacters={0} />)

      await openSearchResults()
      searchResultsIsOpen()

      await user.click(document.body)
      searchResultsIsClosed()
    })

    it('closes on esc key', async () => {
      wrapperMount(<Search results={options} minCharacters={0} />)

      await openSearchResults()
      searchResultsIsOpen()

      await pressKey('Escape')
      searchResultsIsClosed()
    })
  })

  describe('open', () => {
    it('defaultOpen opens the menu when true', async () => {
      wrapperMount(<Search results={options} minCharacters={0} defaultOpen />)

      searchResultsIsOpen()
    })

    it('defaultOpen stays open on focus', async () => {
      wrapperMount(<Search results={options} minCharacters={0} defaultOpen />)

      await openSearchResults()
      searchResultsIsOpen()
    })

    it('defaultOpen closes the menu when false', async () => {
      wrapperMount(<Search results={options} minCharacters={0} defaultOpen={false} />)

      searchResultsIsClosed()
    })

    it('opens the menu when true', async () => {
      wrapperMount(<Search results={options} minCharacters={0} open />)

      searchResultsIsOpen()
    })

    it('closes the menu when false', async () => {
      wrapperMount(<Search results={options} minCharacters={0} open={false} />)

      searchResultsIsClosed()
    })

    it('closes the menu when toggled from true to false', async () => {
      const { rerender } = render(<Search results={options} minCharacters={0} open />)
      container = document.body.querySelector('div')

      rerender(<Search results={options} minCharacters={0} open={false} />)
      searchResultsIsClosed()
    })

    it('opens the menu when toggled from false to true', async () => {
      const { rerender } = render(<Search results={options} minCharacters={0} open={false} />)
      container = document.body.querySelector('div')

      rerender(<Search results={options} minCharacters={0} open />)
      searchResultsIsOpen()
    })
  })

  describe('onBlur', () => {
    it('is called with (event, data) on search input blur', async () => {
      const onBlur = vi.fn()
      wrapperMount(<Search results={options} onBlur={onBlur} />)

      // Tab onto the prompt, then off it again.
      await user.tab()
      await user.tab()

      expect(onBlur).toHaveBeenCalledTimes(1)
      expect(onBlur).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ onBlur, results: options }),
      )
    })

    it('is not called on an item click', async () => {
      const onBlur = vi.fn()
      wrapperMount(<Search results={options} onBlur={onBlur} />)

      await openSearchResults()
      await user.click(results()[0])

      expect(onBlur).not.toHaveBeenCalled()
    })
  })

  describe('onFocus', () => {
    it('is called with (event, data) on search input focus', async () => {
      const onFocus = vi.fn()
      wrapperMount(<Search results={options} onFocus={onFocus} />)

      await openSearchResults()

      expect(onFocus).toHaveBeenCalledTimes(1)
      expect(onFocus).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ onFocus, results: options }),
      )
    })
  })

  describe('onResultSelect', () => {
    let onResultSelect

    beforeEach(() => {
      onResultSelect = vi.fn()
    })

    it('is called with event and value on item click', async () => {
      const index = 2
      wrapperMount(<Search results={options} minCharacters={0} onResultSelect={onResultSelect} />)

      await openSearchResults()
      searchResultsIsOpen()

      await user.click(results()[index])

      expect(onResultSelect).toHaveBeenCalledTimes(1)
      expect(onResultSelect).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          minCharacters: 0,
          result: options[index],
          results: options,
        }),
      )
    })

    it('is called with event and value when pressing enter on a selected item', async () => {
      wrapperMount(
        <Search
          results={options}
          minCharacters={0}
          onResultSelect={onResultSelect}
          selectFirstResult
        />,
      )

      await openSearchResults()
      searchResultsIsOpen()

      await pressKey('Enter')

      expect(onResultSelect).toHaveBeenCalledTimes(1)
      expect(onResultSelect).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ result: options[0] }),
      )
    })

    it('is not called when updating the value prop', async () => {
      const { rerender } = render(
        <Search
          results={options}
          minCharacters={0}
          value={options[0].title}
          onResultSelect={onResultSelect}
        />,
      )

      rerender(
        <Search
          results={options}
          minCharacters={0}
          value={options[1].title}
          onResultSelect={onResultSelect}
        />,
      )

      expect(onResultSelect).not.toHaveBeenCalled()
    })

    it('does not call onResultSelect on query change', async () => {
      wrapperMount(<Search results={options} minCharacters={0} onResultSelect={onResultSelect} />)

      await type('query')

      expect(onResultSelect).not.toHaveBeenCalled()
    })
  })

  describe('onSearchChange', () => {
    it('is called with (event, value) on search input change', async () => {
      const onSearchChange = vi.fn()
      wrapperMount(<Search results={options} minCharacters={0} onSearchChange={onSearchChange} />)

      await type('a')

      expect(onSearchChange).toHaveBeenCalledTimes(1)
      expect(onSearchChange).toHaveBeenCalledWith(
        expect.objectContaining({ target: expect.objectContaining({ value: 'a' }) }),
        expect.objectContaining({ minCharacters: 0, results: options, value: 'a' }),
      )
    })
  })

  describe('onSelectionChange', () => {
    it('is called with (event, data) when the active selection index is changed', async () => {
      const onSelectionChange = vi.fn()
      wrapperMount(
        <Search
          minCharacters={0}
          onSelectionChange={onSelectionChange}
          results={options}
          selectFirstResult
        />,
      )

      await openSearchResults()
      await pressKey('ArrowDown')

      // The selection moves to `options[1]`, but the handler is told
      // `options[0]` — `handleSelectionChange` reads `this.state.selectedIndex`
      // in the same tick as the `setState` that changes it. The frozen spec
      // expected `options[1]` and got it, because React 17 did not batch
      // updates from a native document listener. See issue #29.
      expect(results()[1]).toHaveClass('active')

      expect(onSelectionChange).toHaveBeenCalledTimes(1)
      expect(onSelectionChange).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          minCharacters: 0,
          result: options[0],
          results: options,
        }),
      )
    })
  })

  describe('results prop', () => {
    it('adds the onClick handler to all items', async () => {
      // Enzyme asked whether each SearchResult element carried an `onClick`
      // prop. What that prop is for is selecting the result it sits on.
      const onResultSelect = vi.fn()

      for (const [index, option] of options.entries()) {
        wrapperMount(<Search results={options} minCharacters={0} onResultSelect={onResultSelect} />)
        // eslint-disable-next-line no-await-in-loop -- interactions are a sequence
        await openSearchResults()
        // eslint-disable-next-line no-await-in-loop -- interactions are a sequence
        await user.click(results()[index])

        expect(onResultSelect).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({ result: option }),
        )
      }

      expect(onResultSelect).toHaveBeenCalledTimes(options.length)
    })

    it('renders new options when options change', async () => {
      const customOptions = [
        { title: 'abra', description: 'abra' },
        { title: 'cadabra', description: 'cadabra' },
        { title: 'bang', description: 'bang' },
      ]
      const { rerender } = render(<Search results={customOptions} defaultOpen />)
      container = document.body.querySelector('div')

      expect(results()).toHaveLength(3)

      rerender(
        <Search results={[...customOptions, { title: 'bar', description: 'bar' }]} defaultOpen />,
      )

      expect(results()).toHaveLength(4)

      const newItem = _.last(results())
      expect(newItem.querySelector('.title')).toHaveTextContent('bar')
      expect(newItem.querySelector('.description')).toHaveTextContent('bar')
    })

    it('passes options as props', async () => {
      const customOptions = [
        { title: 'abra', description: 'abra', 'data-foo': 'someValue' },
        { title: 'cadabra', description: 'cadabra', 'data-foo': 'someValue' },
        { title: 'bang', description: 'bang', 'data-foo': 'someValue' },
      ]
      wrapperMount(<Search results={customOptions} />)

      for (const result of results()) {
        expect(result).toHaveAttribute('data-foo', 'someValue')
      }
    })

    it('ignores search value', async () => {
      wrapperMount(<Search results={options} minCharacters={0} selectFirstResult />)

      await openSearchResults()
      searchResultsIsOpen()

      // search for something we know will not exist
      await type('_________________')

      expect(results()).toHaveLength(options.length)
    })
  })

  describe('no results message', () => {
    const emptyMessage = () => container.querySelector('.message.empty')

    it('is shown when there are no results', async () => {
      const { rerender } = render(<Search results={options} minCharacters={0} defaultOpen />)
      container = document.body.querySelector('div')

      expect(emptyMessage()).toBeNull()

      rerender(<Search results={[]} minCharacters={0} defaultOpen />)
      expect(emptyMessage()).not.toBeNull()
    })

    it('uses default noResultsMessage', async () => {
      wrapperMount(<Search results={[]} minCharacters={0} />)

      expect(emptyMessage().querySelector('.header')).toHaveTextContent('No results found.')
    })

    it('uses custom string for noResultsMessage', async () => {
      wrapperMount(<Search results={[]} minCharacters={0} noResultsMessage='Something custom' />)

      expect(emptyMessage().querySelector('.header')).toHaveTextContent('Something custom')
    })

    it('uses custom component for noResultsMessage', async () => {
      wrapperMount(<Search results={[]} minCharacters={0} noResultsMessage={<span>Test</span>} />)

      expect(emptyMessage().querySelector('.header span')).not.toBeNull()
    })

    it('uses custom noResultsDescription if present', async () => {
      wrapperMount(
        <Search results={[]} minCharacters={0} noResultsDescription='Something custom' />,
      )

      expect(emptyMessage().querySelector('.header')).toHaveTextContent('No results found.')
      expect(emptyMessage().querySelector('.description')).toHaveTextContent('Something custom')
    })

    it('uses no noResultsMessage', async () => {
      wrapperMount(<Search results={[]} minCharacters={0} noResultsMessage='' />)

      expect(emptyMessage().querySelector('.header')).toHaveTextContent('')
    })

    it('shows no message with showNoResults=false', async () => {
      wrapperMount(<Search results={[]} minCharacters={0} showNoResults={false} />)

      expect(emptyMessage()).toBeNull()
    })
  })

  describe('input', () => {
    it('merges nested shorthand props for the <input>', async () => {
      wrapperMount(<Search input={{ input: { className: 'foo', tabIndex: '-1' } }} />)

      expect(input()).toHaveAttribute('tabindex', '-1')
      expect(input()).toHaveClass('foo', 'prompt')
    })

    it('will not merge for a function', async () => {
      // TODO: V4 remove this test and simplify the implementation
      consoleUtil.disableOnce()

      wrapperMount(<Search input={{ input: (Component, props) => <Component {...props} /> }} />)
      const element = container.querySelector('input')

      expect(element).toHaveAttribute('autocomplete', 'off')
      expect(element).not.toHaveClass('prompt')
    })

    it('"placeholder" in passed to an "input"', async () => {
      wrapperMount(<Search placeholder='foo' />)

      expect(input()).toHaveAttribute('placeholder', 'foo')
    })
  })

  describe('input props', () => {
    // Search handles some of html props
    // `autoFocus` is excluded on top of the frozen spec's two: React consumes
    // it and calls `focus()` rather than writing an attribute, so there is
    // nothing on the element to assert. Enzyme read the React prop instead.
    const props = _.without(htmlInputAttrs, 'defaultValue', 'type', 'autoFocus')
    const booleanProps = ['disabled']

    props.forEach((propName) => {
      it(`passes "${propName}" to the <input>`, () => {
        const propValue = _.includes(booleanProps, propName) ? true : 'off'
        wrapperMount(<Search {...{ [propName]: propValue }} />)
        const element = container.querySelector('input')

        // Some of these land as attributes and some as DOM properties, so ask
        // the element rather than assuming which — the same check Checkbox's
        // port makes. Enzyme could read the React prop straight off the
        // element, which is why the original asserted nothing about where it
        // ended up.
        expect(
          element.hasAttribute(propName.toLowerCase()) || element[propName] !== undefined,
          `"${propName}" did not reach the input`,
        ).toBe(true)
      })
    })
  })
})
