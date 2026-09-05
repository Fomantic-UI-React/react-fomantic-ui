import { act, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import _ from 'lodash'
import React from 'react'

import Dropdown from 'src/modules/Dropdown/Dropdown'
import DropdownDivider from 'src/modules/Dropdown/DropdownDivider'
import DropdownHeader from 'src/modules/Dropdown/DropdownHeader'
import DropdownItem from 'src/modules/Dropdown/DropdownItem'
import DropdownMenu from 'src/modules/Dropdown/DropdownMenu'
import DropdownSearchInput from 'src/modules/Dropdown/DropdownSearchInput'
import DropdownText from 'src/modules/Dropdown/DropdownText'
import * as common from 'test/support/commonTests'
import { consoleUtil } from 'test/support'

// ----------------------------------------
// Wrapper
// ----------------------------------------
// The frozen spec attached to a node it appended to the body, so the Dropdown
// could take focus, and unmounted after each test to clean up its document
// listeners. RTL renders into the body and unmounts for us; what is kept is the
// shape — render, then keep the container in scope for the assertions.
let container

const wrapperMount = (element) => {
  container = render(element).container
  return container
}

// ----------------------------------------
// Options
// ----------------------------------------
// The frozen spec built these with faker. Fixed strings say the same thing and
// fail the same way twice.
const getOptions = (count = 5) =>
  _.times(count, (i) => {
    const text = `option ${i}`
    return { text, value: _.snakeCase(text) }
  })

// ----------------------------------------
// Queries
// ----------------------------------------
// Enzyme reached DropdownMenu, DropdownItem, DropdownText and
// DropdownSearchInput as elements. Each renders a class of its own, and asking
// the DOM also proves it rendered.
const root = () => container.firstElementChild
const menu = () => container.querySelector('.menu')
const items = () => [...container.querySelectorAll('.item')]
const selectedItem = () => container.querySelector('.item.selected')
const text = () => container.querySelector('[role="alert"]')
const searchInput = () => container.querySelector('input.search')
const labels = () => [...container.querySelectorAll('a.label')]
const icon = () => container.querySelector('i.icon')

const dropdownMenuIsClosed = () => {
  expect(root()).not.toHaveClass('visible')
  expect(menu()).not.toHaveClass('visible')
}

const dropdownMenuIsOpen = () => {
  expect(root()).toHaveClass('active', 'visible')
  expect(menu()).toHaveClass('visible')
}

const bodyIsFocused = () => expect(document.activeElement).toBe(document.body)
const dropdownIsFocused = () =>
  expect(document.activeElement).toBe(container.querySelector('div.dropdown'))
const dropdownInputIsFocused = () => expect(document.activeElement).toBe(searchInput())

// Every interaction here goes through user-event rather than fireEvent.
// fireEvent dispatches exactly one event, and Dropdown's behaviour depends on
// the ones a browser sends around it: `isMouseDown` is set from mousedown, and
// it gates the `openOnFocus` branch in `componentDidUpdate`. Dispatching a bare
// click makes the focus that selection moves back to the dropdown read as a
// *fresh* focus, and the menu reopens the moment it closes — a component that
// works looking broken. user.click() sends the whole pointer sequence, so the
// component sees what it would in a browser.
let user

// Typing replaces the query rather than appending to it, which is what the
// frozen spec's `simulate('change', { target: { value } })` did. Clearing an
// already-empty input would fire a change of its own, so it is skipped.
const typeSearch = async (value) => {
  const input = searchInput()

  if (input.value !== '') await user.clear(input)
  if (value !== '') await user.type(input, value)
}

// Focus the dropdown without opening it. Holding the mouse button down is how a
// browser reaches that state: focus moves on mousedown, and `isMouseDown` is
// true, so `openOnFocus` does not fire until the button comes back up.
const focusWithoutOpening = () => user.pointer({ target: root(), keys: '[MouseLeft>]' })

// Keeps the last keydown event seen on an element, so `defaultPrevented` can be
// read after every handler has run. Reading it inside the listener would report
// the value before React's own handler had a chance to call preventDefault.
const lastKeydownOn = (element) => {
  const record = { event: null }

  element.addEventListener('keydown', (event) => {
    record.event = event
  })

  return record
}

describe('Dropdown', () => {
  let options

  beforeEach(() => {
    container = undefined
    options = getOptions()
    user = userEvent.setup()
  })

  common.isConformant(Dropdown, {
    // Dropdown's onChange fires when a value is selected, not on a DOM change
    // event, so the event-transparency check cannot exercise it. The behaviour
    // it stands for is covered by the onChange describe block below. Same
    // exception Checkbox needed, for the same reason.
    ignoredEvents: ['onChange'],
  })
  common.forwardsRef(Dropdown)
  common.hasUIClassName(Dropdown)
  common.hasSubcomponents(Dropdown, [
    DropdownDivider,
    DropdownHeader,
    DropdownItem,
    DropdownMenu,
    DropdownSearchInput,
    DropdownText,
  ])

  common.implementsIconProp(Dropdown, {
    defaultValue: 'search',
    assertExactMatch: false,
    autoGenerateKey: false,
  })
  common.implementsShorthandProp(Dropdown, {
    autoGenerateKey: false,
    propKey: 'header',
    ShorthandComponent: DropdownHeader,
    mapValueToProps: (val) => ({ content: val }),
  })

  common.propKeyOnlyToClassName(Dropdown, 'disabled')
  common.propKeyOnlyToClassName(Dropdown, 'error')
  common.propKeyOnlyToClassName(Dropdown, 'loading')
  common.propKeyOnlyToClassName(Dropdown, 'basic')
  common.propKeyOnlyToClassName(Dropdown, 'button')
  common.propKeyOnlyToClassName(Dropdown, 'compact')
  common.propKeyOnlyToClassName(Dropdown, 'fluid')
  common.propKeyOnlyToClassName(Dropdown, 'floating')
  common.propKeyOnlyToClassName(Dropdown, 'inline')
  // TODO: See Dropdown cx notes
  // common.propKeyOnlyToClassName(Dropdown, 'icon')
  common.propKeyOnlyToClassName(Dropdown, 'labeled')
  common.propKeyOnlyToClassName(Dropdown, 'item')
  common.propKeyOnlyToClassName(Dropdown, 'multiple')
  common.propKeyOnlyToClassName(Dropdown, 'search')
  common.propKeyOnlyToClassName(Dropdown, 'selection')
  common.propKeyOnlyToClassName(Dropdown, 'simple')
  common.propKeyOnlyToClassName(Dropdown, 'scrolling')
  common.propKeyOnlyToClassName(Dropdown, 'upward')

  common.propKeyOrValueAndKeyToClassName(Dropdown, 'pointing', [
    'left',
    'right',
    'top',
    'top left',
    'top right',
    'bottom',
    'bottom left',
    'bottom right',
  ])

  describe('defaultSearchQuery', () => {
    it('changes default value of searchQuery', async () => {
      wrapperMount(<Dropdown defaultSearchQuery='foo' search />)

      expect(searchInput()).toHaveValue('foo')
    })
  })

  it('closes on blur', async () => {
    wrapperMount(<Dropdown options={options} />)
    await user.click(root())

    dropdownMenuIsOpen()
    await user.tab()
    dropdownMenuIsClosed()
  })

  it('does not close on blur with closeOnBlur set to false', async () => {
    wrapperMount(<Dropdown options={options} closeOnBlur={false} />)
    await user.click(root())

    dropdownMenuIsOpen()
    await user.tab()
    dropdownMenuIsOpen()
  })

  it('opens on focus', async () => {
    wrapperMount(<Dropdown options={options} />)

    dropdownMenuIsClosed()
    await user.tab()
    dropdownMenuIsOpen()
  })

  describe('disabled', () => {
    it('does not open on click', async () => {
      wrapperMount(<Dropdown options={options} disabled />)

      dropdownMenuIsClosed()
      await user.click(root())
      dropdownMenuIsClosed()
    })

    it('does not open on click with pointer events enabled', async () => {
      wrapperMount(<Dropdown options={options} disabled style={{ pointerEvents: 'all' }} />)

      dropdownMenuIsClosed()
      await user.click(root())
      dropdownMenuIsClosed()
    })

    it('does not open on focus', async () => {
      wrapperMount(<Dropdown options={options} disabled />)

      dropdownMenuIsClosed()

      // A disabled Dropdown renders tabIndex="-1", so a user cannot tab to it.
      await user.tab()
      expect(document.activeElement).not.toBe(root())

      // Focusing it anyway must still not open the menu.
      act(() => root().focus())
      dropdownMenuIsClosed()
    })
  })

  describe('tabIndex', () => {
    it('defaults to 0', async () => {
      wrapperMount(<Dropdown options={options} />)

      expect(root()).toHaveAttribute('tabindex', '0')
    })

    it('defaults to -1 when disabled', async () => {
      wrapperMount(<Dropdown disabled options={options} />)

      expect(root()).toHaveAttribute('tabindex', '-1')
    })

    it('applies when defined', async () => {
      wrapperMount(<Dropdown options={options} tabIndex={1} />)

      expect(root()).toHaveAttribute('tabindex', '1')
    })

    describe('search', () => {
      it('defaults the search input to 0', async () => {
        wrapperMount(<Dropdown options={options} selection search />)

        expect(searchInput()).toHaveAttribute('tabindex', '0')
      })

      it('defaults the disabled search input to -1', async () => {
        wrapperMount(<Dropdown disabled options={options} selection search />)

        expect(searchInput()).toHaveAttribute('tabindex', '-1')
      })

      it('allows explicitly setting the search input value', async () => {
        wrapperMount(<Dropdown options={options} selection search tabIndex={123} />)

        expect(searchInput()).toHaveAttribute('tabindex', '123')
      })

      it('allows explicitly setting the search input value when disabled', async () => {
        wrapperMount(<Dropdown disabled options={options} selection search tabIndex={123} />)

        expect(searchInput()).toHaveAttribute('tabindex', '123')
      })

      it('is not present on the root when is search', async () => {
        wrapperMount(<Dropdown options={options} selection search />)

        expect(root()).not.toHaveAttribute('tabindex')
      })

      it('is not present on the root when is search and defined', async () => {
        wrapperMount(<Dropdown options={options} selection search tabIndex={1} />)

        expect(root()).not.toHaveAttribute('tabindex')
      })
    })
  })

  describe('aria', () => {
    it('should label normal dropdown as a listbox', async () => {
      wrapperMount(<Dropdown />)

      expect(root()).toHaveAttribute('role', 'listbox')
    })

    it('should label search dropdown as a combobox', async () => {
      wrapperMount(<Dropdown search />)

      expect(root()).toHaveAttribute('role', 'combobox')
    })

    it('should label search dropdownMenu as a listbox', async () => {
      wrapperMount(<Dropdown search />)

      expect(menu()).toHaveAttribute('role', 'listbox')
    })

    it('should label search multiple dropdownMenu as aria-multiselectable', async () => {
      wrapperMount(<Dropdown search multiple />)

      expect(menu()).toHaveAttribute('aria-multiselectable', 'true')
    })

    it('should not label normal dropdownMenu with a role', async () => {
      wrapperMount(<Dropdown />)

      expect(menu()).not.toHaveAttribute('role')
    })

    it('should label disabled dropdown as aria-disabled', async () => {
      wrapperMount(<Dropdown disabled />)

      expect(root()).toHaveAttribute('aria-disabled', 'true')
    })

    it('should label normal dropdown without aria-disabled', async () => {
      wrapperMount(<Dropdown />)

      expect(root()).not.toHaveAttribute('aria-disabled')
    })

    it('should label multiple dropdown as aria-multiselectable', async () => {
      wrapperMount(<Dropdown multiple />)

      expect(root()).toHaveAttribute('aria-multiselectable', 'true')
    })

    it('should not label multiple search dropdown as aria-multiselectable', async () => {
      wrapperMount(<Dropdown search multiple />)

      expect(root()).not.toHaveAttribute('aria-multiselectable')
    })

    it('should label normal dropdown without aria-multiselectable', async () => {
      wrapperMount(<Dropdown />)

      expect(root()).not.toHaveAttribute('aria-multiselectable')
    })

    it('should label loading dropdown as aria-busy', async () => {
      wrapperMount(<Dropdown loading />)

      expect(root()).toHaveAttribute('aria-busy', 'true')
    })

    it('should label normal dropdown without aria-busy', async () => {
      wrapperMount(<Dropdown />)

      expect(root()).not.toHaveAttribute('aria-busy')
    })

    it('should label search dropdown input aria-autocomplete=list', async () => {
      wrapperMount(<Dropdown search />)

      expect(searchInput()).toHaveAttribute('aria-autocomplete', 'list')
    })

    it('should label search dropdown input type=text', async () => {
      wrapperMount(<Dropdown search />)

      expect(searchInput()).toHaveAttribute('type', 'text')
    })
  })

  describe('clearable', () => {
    it('does not clear when value is empty', async () => {
      const onChange = vi.fn()
      wrapperMount(<Dropdown clearable onChange={onChange} />)

      await user.click(icon())
      expect(onChange).not.toHaveBeenCalled()
    })

    it('does not clear when is multiple and value is empty', async () => {
      const onChange = vi.fn()
      wrapperMount(<Dropdown clearable multiple onChange={onChange} />)

      await user.click(icon())
      expect(onChange).not.toHaveBeenCalled()
    })

    it('clears when value is not empty', async () => {
      const defaultValue = options[1].value
      const onChange = vi.fn()

      wrapperMount(
        <Dropdown defaultValue={defaultValue} clearable onChange={onChange} options={options} />,
      )
      await user.click(container.querySelector('i.clear'))

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ value: '' }),
      )
      expect(container.querySelectorAll('.selected.item')).toHaveLength(1)
      expect(items()[0]).toHaveClass('selected')
    })

    it('clears when value is multiple and is not empty', async () => {
      const defaultValue = _.map(options, 'value')
      const onChange = vi.fn()

      wrapperMount(
        <Dropdown
          defaultValue={defaultValue}
          clearable
          multiple
          onChange={onChange}
          options={options}
        />,
      )
      await user.click(container.querySelector('i.clear'))

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ value: [] }),
      )
      expect(container.querySelectorAll('.selected.item')).toHaveLength(1)
      expect(items()[0]).toHaveClass('selected')
    })
  })
  describe('handleBlur', () => {
    it('passes the event to the onBlur prop', async () => {
      const onBlur = vi.fn()
      wrapperMount(<Dropdown onBlur={onBlur} />)

      // Tab in, then out — nothing else is tabbable, so focus lands on the body.
      await user.tab()
      await user.tab()

      expect(onBlur).toHaveBeenCalledTimes(1)
      expect(onBlur).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'blur' }),
        expect.anything(),
      )
    })

    it('does not call handleChange if the value has not changed', async () => {
      const onChange = vi.fn()
      wrapperMount(<Dropdown onChange={onChange} options={options} selectOnBlur />)

      // focus, open and select an item
      await user.click(root())
      dropdownMenuIsOpen()

      await user.click(items()[2])
      dropdownMenuIsClosed()
      expect(onChange).toHaveBeenCalledTimes(1)

      await user.click(root())
      await user.click(items()[2])
      dropdownMenuIsClosed()
      expect(onChange).toHaveBeenCalledTimes(1)
    })

    it('sets searchQuery state to empty', async () => {
      wrapperMount(<Dropdown defaultSearchQuery='foo' search />)

      await user.tab()
      await user.tab()

      expect(searchInput()).toHaveValue('')
    })

    it('does not call onBlur when the mouse is down', async () => {
      const onBlur = vi.fn()
      wrapperMount(<Dropdown onBlur={onBlur} selectOnBlur />)

      await focusWithoutOpening()
      await user.tab()

      expect(onBlur).not.toHaveBeenCalled()
    })
  })

  describe('handleClose', () => {
    it('prevents Space from opening a search Dropdown after selecting an item', async () => {
      // Prevent a bug where pressing space in another control opens the Dropdown
      // https://github.com/Semantic-Org/Semantic-UI-React/issues/692
      wrapperMount(<Dropdown options={options} search selection />)

      // open, click an item, assert it is active and in the value
      await user.click(root())
      dropdownMenuIsOpen()

      await user.click(items()[0])
      expect(items()[0]).toHaveClass('active')
      dropdownMenuIsClosed()

      // The dropdown is still focused after an item is selected; move focus
      // off it first.
      await user.tab()

      // doesn't open on space
      await user.keyboard('[Space]')
      dropdownMenuIsClosed()
    })
  })

  describe('closeOnChange', () => {
    it('will close when defined and dropdown is multiple', async () => {
      wrapperMount(<Dropdown selection multiple search closeOnChange options={options} />)
      await user.click(root())

      dropdownMenuIsOpen()

      await user.click(items()[0])

      dropdownMenuIsClosed()
    })

    it('will remain open when undefined and dropdown is multiple', async () => {
      wrapperMount(<Dropdown selection multiple search options={options} />)
      await user.click(root())

      dropdownMenuIsOpen()

      await user.click(items()[0])

      dropdownMenuIsOpen()
    })
  })

  describe('closeOnEscape', () => {
    it('closes the dropdown when Escape key is pressed by default', async () => {
      wrapperMount(<Dropdown defaultOpen />)

      dropdownMenuIsOpen()

      await user.keyboard('{Escape}')
      dropdownMenuIsClosed()
    })

    it('closes the dropdown when is "true" and Escape key is pressed', async () => {
      wrapperMount(<Dropdown defaultOpen closeOnEscape />)

      dropdownMenuIsOpen()

      await user.keyboard('{Escape}')
      dropdownMenuIsClosed()
    })

    it('does not close the dropdown when false and Escape key is pressed', async () => {
      wrapperMount(<Dropdown defaultOpen closeOnEscape={false} />)

      dropdownMenuIsOpen()

      await user.keyboard('{Escape}')
      dropdownMenuIsOpen()
    })
  })

  describe('setSelectedIndex', () => {
    it('will call setSelectedIndex if options change', async () => {
      const { rerender } = render(<Dropdown options={options} />)
      container = document.body.querySelector('div')

      await user.click(root())
      await user.keyboard('{ArrowDown}')
      expect(container.querySelectorAll('.selected.item')).toHaveLength(1)
      expect(items()[1]).toHaveClass('selected')

      rerender(<Dropdown options={[]} />)
      expect(selectedItem()).toBeNull()
    })

    it('will not call setSelectedIndex if options have not changed', async () => {
      const { rerender } = render(<Dropdown options={options} />)
      container = document.body.querySelector('div')

      await user.click(root())
      await user.keyboard('{ArrowDown}')
      expect(items()[1]).toHaveClass('selected')

      rerender(<Dropdown options={options} />)
      expect(items()[1]).toHaveClass('selected')
    })
  })

  describe('selectedIndex', () => {
    it('sets "selectedIndex" when an item was selected', async () => {
      const option = _.last(options)
      wrapperMount(<Dropdown options={options} search selection />)

      // open, simulate search and select option
      await user.click(root())
      await user.keyboard('{ArrowDown}')
      expect(items()[1]).toHaveClass('selected')

      await typeSearch(option.text)
      await user.keyboard('{Enter}')
      expect(items()[4]).toHaveClass('selected')

      // open again
      await user.click(root())
      expect(items()[4]).toHaveClass('selected')
    })

    it('keeps "selectedIndex" when the same item was selected', async () => {
      const option = _.last(options)
      wrapperMount(<Dropdown options={options} search selection />)

      // simulate search and select option
      await typeSearch(option.text)
      await user.keyboard('{Enter}')
      expect(items()[4]).toHaveClass('selected')

      // select the same option again
      await typeSearch(option.text)
      await user.keyboard('{Enter}')
      expect(items()[4]).toHaveClass('selected')
    })
  })

  describe('isMouseDown', () => {
    it('tracks when the mouse is down', async () => {
      // To understand this test please check componentDidUpdate() on Dropdown
      wrapperMount(<Dropdown />)
      dropdownMenuIsClosed()

      // While the button is held, focus has moved but ".isMouseDown" is true,
      // so the focus does not open the menu.
      await focusWithoutOpening()
      dropdownIsFocused()
      dropdownMenuIsClosed()

      // Releasing completes the click, which opens it.
      await user.pointer({ keys: '[/MouseLeft]' })
      dropdownMenuIsOpen()

      // And a focus arriving without a button held opens it too.
      await user.tab()
      await user.tab()
      dropdownMenuIsOpen()
    })
  })

  describe('icon', () => {
    it('defaults to a dropdown icon', async () => {
      wrapperMount(<Dropdown />)

      expect(container.querySelector('.dropdown.icon')).not.toBeNull()
    })

    // The frozen spec had this test twice, character for character.
    it('always opens a dropdown on click', async () => {
      wrapperMount(<Dropdown options={options} selection search />)

      await user.click(icon())

      dropdownMenuIsOpen()
    })

    it('passes onClick handler', async () => {
      const onClick = vi.fn()
      const props = { name: 'user', onClick }
      wrapperMount(<Dropdown icon={props} options={options} />)

      await user.click(icon())

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'click' }),
        expect.objectContaining(props),
      )
    })
  })

  describe('searchQuery', () => {
    it('defaults to empty string', async () => {
      wrapperMount(<Dropdown search />)

      expect(searchInput()).toHaveValue('')
    })

    it('passes value to state', async () => {
      wrapperMount(<Dropdown search searchQuery='foo' />)

      expect(searchInput()).toHaveValue('foo')
    })
  })

  describe('selected item', () => {
    it('defaults to the first item', async () => {
      wrapperMount(<Dropdown options={options} selection />)

      expect(items()[0]).toHaveClass('selected')
    })

    it('defaults to the first non-disabled item', async () => {
      options[0].disabled = true
      wrapperMount(<Dropdown options={options} selection />)

      // selection moved to second item
      expect(items()[0]).not.toHaveClass('selected')
      expect(items()[1]).toHaveClass('selected')
    })

    it('defaults to selected item when options are initially empty', async () => {
      const index = 2
      const value = options[index].value
      const { rerender } = render(<Dropdown options={[]} selection value={value} />)
      container = document.body.querySelector('div')

      rerender(<Dropdown options={options} selection value={value} />)

      expect(items()[index]).toHaveClass('selected')
    })

    it('is null when all options disabled', async () => {
      const disabledOptions = options.map((o) => ({ ...o, disabled: true }))
      wrapperMount(<Dropdown options={disabledOptions} selection />)

      expect(container.querySelector('.selected')).toBeNull()
    })

    it('is set when clicking an item', async () => {
      // skip the first as it's selected by default
      const index = 2
      wrapperMount(<Dropdown options={options} selection />)

      await user.click(items()[index])
      expect(items()[index]).toHaveClass('selected')
    })

    it('is ignored when clicking a disabled item', async () => {
      // skip the first as it's selected by default
      const index = 2
      options[index].disabled = true
      wrapperMount(<Dropdown options={options} selection />)

      await user.click(root())
      await user.click(items()[index])

      expect(items()[index]).not.toHaveClass('selected')
      dropdownMenuIsOpen()
    })

    it('moves down on arrow down when open', async () => {
      wrapperMount(<Dropdown options={options} selection />)

      await user.click(root())
      dropdownMenuIsOpen()

      await user.keyboard('{ArrowDown}')

      // selection moved to second item
      expect(items()[0]).not.toHaveClass('selected')
      expect(items()[1]).toHaveClass('selected')
    })

    it('moves up on arrow up when open', async () => {
      wrapperMount(<Dropdown options={options} selection />)

      await user.click(root())
      expect(items()[0]).toHaveClass('selected')

      await user.keyboard('{ArrowUp}')

      // selection moved to last item
      expect(items()[0]).not.toHaveClass('selected')
      expect(items()[options.length - 1]).toHaveClass('selected')
    })

    it('skips over items filtered by search', async () => {
      const opts = [
        { text: 'a1', value: 'a1' },
        { text: 'skip this one', value: 'skip this one' },
        { text: 'a2', value: 'a2' },
      ]
      wrapperMount(<Dropdown options={opts} search selection />)

      await user.click(root())
      await typeSearch('a')

      expect(selectedItem()).toHaveTextContent('a1')

      await user.keyboard('{ArrowDown}')

      expect(selectedItem()).toHaveTextContent('a2')
    })

    it('filters diacritics on options when using deburr prop', async () => {
      const inputText = 'floresti'
      const textToFind = 'FLOREŞTI'
      const opts = [
        { text: textToFind, value: '1' },
        { text: `ŞANŢU ${textToFind}`, value: '2' },
        { text: `${textToFind} Alba`, value: '3' },
      ]
      wrapperMount(<Dropdown options={opts} search deburr selection />)

      await user.click(root())
      await typeSearch(inputText)

      expect(selectedItem()).toHaveTextContent(textToFind)
    })

    it('filters diacritics on input when using deburr prop', async () => {
      const inputText = 'FLORÉŞTI'
      const textToFind = 'FLORESTI'
      const opts = [
        { text: textToFind, value: '1' },
        { text: `SANTU ${textToFind}`, value: '2' },
        { text: `${textToFind} Alba`, value: '3' },
      ]
      wrapperMount(<Dropdown options={opts} search deburr selection />)

      await user.click(root())
      await typeSearch(inputText)

      expect(selectedItem()).toHaveTextContent(textToFind)
    })

    it('should not filter diacritics when deburr is not set', async () => {
      const inputText = 'FLORÉŞTI'
      const textToFind = 'FLORESTI'
      // Add this in case the default 'no results text' changes.
      const noResultsText = 'NoResultsFound'
      const opts = [
        { text: textToFind, value: '1' },
        { text: `SANTU ${textToFind}`, value: '2' },
        { text: `${textToFind} Alba`, value: '3' },
      ]
      wrapperMount(<Dropdown options={opts} search selection noResultsMessage={noResultsText} />)

      await user.click(root())
      await typeSearch(inputText)

      expect(container.querySelector('.message')).toHaveTextContent(noResultsText)
    })

    it('still works after encountering "no results"', async () => {
      const opts = [
        { text: 'a1', value: 'a1' },
        { text: 'a2', value: 'a2' },
        { text: 'a3', value: 'a3' },
      ]
      wrapperMount(<Dropdown options={opts} search selection />)

      // search for 'a4' — no results appears
      await user.click(root())
      await typeSearch('a4')

      expect(container.querySelectorAll('.message')).toHaveLength(1)

      // search for 'a' (simulated backspace) — no results is removed, the first
      // item is selected, and the down arrow moves the selection
      await typeSearch('a')

      expect(container.querySelector('.message')).toBeNull()
      expect(container.querySelectorAll('.selected')).toHaveLength(1)
      expect(selectedItem()).toHaveTextContent('a1')

      await user.keyboard('{ArrowDown}')

      expect(container.querySelectorAll('.selected')).toHaveLength(1)
      expect(selectedItem()).toHaveTextContent('a2')
    })

    it('skips over disabled items', async () => {
      const opts = [
        { text: 'a1', value: 'a1' },
        { text: 'skip this one', value: 'skip this one', disabled: true },
        { text: 'a2', value: 'a2' },
      ]
      wrapperMount(<Dropdown options={opts} search selection />)

      await user.click(root())
      expect(selectedItem()).toHaveTextContent('a1')

      await user.keyboard('{ArrowDown}')
      expect(selectedItem()).toHaveTextContent('a2')
    })

    it('does not enter an infinite loop when all items are disabled', async () => {
      const onChange = vi.fn()
      const opts = [
        { text: '1', value: '1', disabled: true },
        { text: '2', value: '2', disabled: true },
      ]
      wrapperMount(<Dropdown onChange={onChange} options={opts} search selection />)

      await user.click(root())
      await user.keyboard('{ArrowDown}')

      expect(onChange).not.toHaveBeenCalled()
    })

    it('scrolls the selected item into view', async () => {
      // jsdom computes no layout, so the measurements this reads are stubbed —
      // the same approach Sticky's and Search's ports take. Unlike Search,
      // Dropdown re-runs the scroll from componentDidUpdate when selectedIndex
      // changes, so it sees the item that is actually selected. See issue #29.
      const itemHeight = 20
      const menuHeight = 100
      const opts = getOptions(20)

      wrapperMount(<Dropdown options={opts} selection />)
      await user.click(root())
      dropdownMenuIsOpen()

      const stub = (element, values) =>
        _.forEach(values, (value, key) =>
          Object.defineProperty(element, key, { configurable: true, value }),
        )

      stub(menu(), { clientHeight: menuHeight })
      items().forEach((item, index) =>
        stub(item, { offsetTop: index * itemHeight, clientHeight: itemHeight }),
      )

      // Scrolls to bottom — wrap the selection to the last item.
      expect(selectedItem()).toHaveTextContent(opts[0].text)

      await user.keyboard('{ArrowUp}')

      expect(selectedItem()).toHaveTextContent(_.last(opts).text)
      expect(menu().scrollTop).toBe(opts.length * itemHeight - menuHeight)

      // Scrolls back to top — wrap the selection to the first item.
      await user.keyboard('{ArrowDown}')

      expect(selectedItem()).toHaveTextContent(opts[0].text)
      expect(menu().scrollTop).toBe(0)
    })

    it('becomes active on enter when open', async () => {
      wrapperMount(<Dropdown options={options} selection />)
      await user.click(root())

      expect(items()[1]).not.toHaveClass('selected')
      expect(items()[1]).not.toHaveClass('active')

      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')

      expect(items()[1]).toHaveClass('selected', 'active')
    })

    it('becomes active on spacebar when open', async () => {
      wrapperMount(<Dropdown options={options} selection />)
      await user.click(root())

      expect(items()[1]).not.toHaveClass('selected')
      expect(items()[1]).not.toHaveClass('active')

      await user.keyboard('{ArrowDown}')
      await user.keyboard('[Space]')

      expect(items()[1]).toHaveClass('selected', 'active')
    })

    it('closes the menu on ENTER key', async () => {
      wrapperMount(<Dropdown options={options} selection />)
      await user.click(root())

      dropdownMenuIsOpen()

      await user.keyboard('{Enter}')
      dropdownMenuIsClosed()
    })

    it('closes the menu on SPACE key', async () => {
      wrapperMount(<Dropdown options={options} selection />)
      await user.click(root())

      dropdownMenuIsOpen()

      await user.keyboard('[Space]')
      dropdownMenuIsClosed()
    })

    it('closes the Search menu on ENTER key', async () => {
      wrapperMount(<Dropdown options={options} selection search />)
      await user.click(root())

      dropdownMenuIsOpen()

      await user.keyboard('{Enter}')
      dropdownMenuIsClosed()
    })

    it('does not close the Search menu on SPACE key', async () => {
      wrapperMount(<Dropdown options={options} selection search />)
      await user.click(root())

      dropdownMenuIsOpen()

      await user.keyboard('[Space]')
      dropdownMenuIsOpen()
    })

    it('keeps value of the searchQuery when selection is changed', async () => {
      wrapperMount(<Dropdown options={options} selection search />)

      await typeSearch('foo')
      await user.click(root())
      await user.keyboard('{ArrowDown}')

      expect(searchInput()).toHaveValue('foo')
    })
  })

  describe('value', () => {
    it('sets the corresponding item to active', async () => {
      const index = 2
      wrapperMount(<Dropdown options={options} selection value={options[index].value} />)

      expect(items()[index]).toHaveClass('active')
    })

    it('sets the corresponding item text', async () => {
      const index = 2
      wrapperMount(<Dropdown value={options[index].value} options={options} selection />)

      expect(items()[index]).toHaveTextContent(options[index].text)
    })

    it('updates active item when changed', async () => {
      const { rerender } = render(<Dropdown value={options[1].value} options={options} selection />)
      container = document.body.querySelector('div')

      expect(items()[1]).toHaveClass('active')

      rerender(<Dropdown value={options[3].value} options={options} selection />)

      expect(items()[1]).not.toHaveClass('active')
      expect(items()[3]).toHaveClass('active')
    })

    it('updates text when value changed', async () => {
      const { rerender } = render(<Dropdown options={options} selection value={options[1].value} />)
      container = document.body.querySelector('div')

      expect(text()).toHaveTextContent(options[1].text)

      rerender(<Dropdown options={options} selection value={options[3].value} />)
      expect(text()).toHaveTextContent(options[3].text)
    })

    it('updates value on down arrow', async () => {
      wrapperMount(<Dropdown options={options} selection />)

      await user.click(root())
      await user.keyboard('{ArrowDown}')

      expect(items()[1]).toHaveClass('active')
    })

    it('updates value on up arrow', async () => {
      wrapperMount(<Dropdown options={options} selection />)

      await user.click(root())
      await user.keyboard('{ArrowUp}')

      expect(items()[4]).toHaveClass('active')
    })
  })

  describe('text', () => {
    it('defaults to "placeholder"', async () => {
      wrapperMount(<Dropdown options={options} placeholder='a placeholder' />)

      expect(container.querySelector('div.text')).toHaveTextContent('a placeholder')
    })

    it('sets the display text', async () => {
      wrapperMount(<Dropdown options={options} selection text='some text' />)

      expect(container.querySelector('div.text')).toHaveTextContent('some text')
    })

    it('prevents updates on item click if defined', async () => {
      wrapperMount(<Dropdown options={options} selection text='some text' />)

      await user.click(root())
      await user.click(items()[2])

      expect(container.querySelector('div.text')).toHaveTextContent('some text')
    })

    it('is updated on item click if not already defined', async () => {
      wrapperMount(<Dropdown options={options} selection />)

      await user.click(root())

      const itemText = items()[2].textContent
      await user.click(items()[2])

      expect(container.querySelector('div.text')).toHaveTextContent(itemText)
    })

    it('is updated on item enter if multiple search results present', async () => {
      const searchOptions = [
        { value: 0, text: 'foo' },
        { value: 1, text: 'foe' },
      ]
      wrapperMount(<Dropdown options={searchOptions} search selection />)

      // open and simulate search
      await user.click(root())
      await typeSearch('fo')

      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')

      expect(container.querySelector('div.text')).toHaveTextContent('foe')
    })

    it('displays if value is 0', async () => {
      wrapperMount(<Dropdown options={[{ value: 0, text: 'zero' }]} selection />)

      await user.click(root())
      await user.click(items()[0])

      expect(container.querySelector('div.text')).toHaveTextContent('zero')
    })

    it("does not display if value is ''", async () => {
      wrapperMount(<Dropdown options={[{ value: '', text: 'empty' }]} selection />)

      await user.click(root())
      await user.click(items()[0])

      // The frozen assertion was `should.contain.text('')`, which every
      // string satisfies — including the text of an element that is not
      // there. With no placeholder and nothing to show, the shorthand
      // factory returns null and no text element is rendered at all.
      expect(container.querySelector('div.text')).toBeNull()
    })

    it('does not display if value is null', async () => {
      wrapperMount(<Dropdown options={[{ value: null, text: 'null' }]} selection />)

      await user.click(root())
      await user.click(items()[0])

      // The frozen assertion was `should.contain.text('')`, which every
      // string satisfies — including the text of an element that is not
      // there. With no placeholder and nothing to show, the shorthand
      // factory returns null and no text element is rendered at all.
      expect(container.querySelector('div.text')).toBeNull()
    })

    it('does not display if value is undefined', async () => {
      wrapperMount(
        <Dropdown options={[{ key: 'undef', value: undefined, text: 'undef' }]} selection />,
      )

      await user.click(root())
      await user.click(items()[0])

      // The frozen assertion was `should.contain.text('')`, which every
      // string satisfies — including the text of an element that is not
      // there. With no placeholder and nothing to show, the shorthand
      // factory returns null and no text element is rendered at all.
      expect(container.querySelector('div.text')).toBeNull()
    })
  })

  describe('trigger', () => {
    it('displays the trigger', async () => {
      const trigger = <div className='trigger'>Hey there</div>
      wrapperMount(<Dropdown options={options} trigger={trigger} />)

      expect(container.querySelector('.trigger')).toHaveTextContent('Hey there')
    })
  })

  describe('menu', () => {
    it('opens on dropdown click', async () => {
      wrapperMount(<Dropdown options={options} selection />)

      dropdownMenuIsClosed()
      await user.click(root())
      dropdownMenuIsOpen()
    })

    it('opens on arrow down when focused', async () => {
      wrapperMount(<Dropdown options={options} selection />)

      await focusWithoutOpening()
      dropdownMenuIsClosed()

      await user.keyboard('{ArrowDown}')
      dropdownMenuIsOpen()
    })

    it('opens on space when focused', async () => {
      wrapperMount(<Dropdown options={options} selection />)

      await focusWithoutOpening()
      dropdownMenuIsClosed()

      // Enzyme injected a preventDefault spy into the event. A real event
      // records it on itself — but only once every handler has run, so the
      // event is kept and read after the interaction rather than inside the
      // listener, where React's own handler has not fired yet.
      const keydown = lastKeydownOn(root())
      await user.keyboard('[Space]')

      dropdownMenuIsOpen()
      expect(keydown.event.defaultPrevented).toBe(true)
    })

    it('opens on space in search input when focused', async () => {
      wrapperMount(<Dropdown options={options} selection search />)

      // A search dropdown puts focus on its input, not the root, so the way to
      // reach "focused but closed" is to tab in and press escape — the input
      // keeps focus after the menu closes.
      await user.tab()
      await user.keyboard('{Escape}')
      dropdownInputIsFocused()
      dropdownMenuIsClosed()

      // Space inside a text input must keep its default, or it could not be typed.
      const keydown = lastKeydownOn(searchInput())
      await user.keyboard('[Space]')

      dropdownMenuIsOpen()
      expect(keydown.event.defaultPrevented).toBe(false)
      expect(searchInput()).toHaveValue(' ')
    })

    it('does not open on arrow down when not focused', async () => {
      wrapperMount(<Dropdown options={options} selection />)
      dropdownMenuIsClosed()

      await user.keyboard('{ArrowDown}')
      dropdownMenuIsClosed()
    })

    it('does not open on space when not focused', async () => {
      wrapperMount(<Dropdown options={options} selection />)
      dropdownMenuIsClosed()

      await user.keyboard('[Space]')
      dropdownMenuIsClosed()
    })

    it('closes on dropdown click', async () => {
      wrapperMount(<Dropdown options={options} selection defaultOpen />)

      dropdownMenuIsOpen()
      await user.click(root())
      dropdownMenuIsClosed()
    })

    it('closes on menu item click', async () => {
      wrapperMount(<Dropdown options={options} selection />)

      await user.click(root())
      dropdownMenuIsOpen()

      await user.click(items()[2])
      dropdownMenuIsClosed()
    })

    it('blurs after menu item click (mousedown)', async () => {
      wrapperMount(<Dropdown options={options} selection />)

      await user.click(root())
      dropdownMenuIsOpen()

      await user.pointer({ target: items()[2], keys: '[MouseLeft>]' })
      dropdownMenuIsOpen()
      await user.pointer({ keys: '[/MouseLeft]' })
      dropdownMenuIsClosed()
    })

    it('closes on click outside', async () => {
      wrapperMount(<Dropdown options={options} selection />)

      await user.click(root())
      dropdownMenuIsOpen()

      await user.click(document.body)
      dropdownMenuIsClosed()
    })

    it('handles focus correctly', async () => {
      wrapperMount(<Dropdown options={options} selection />)
      bodyIsFocused()

      act(() => root().focus())
      dropdownIsFocused()

      await user.click(document.body)
      bodyIsFocused()
    })

    it('closes on esc key', async () => {
      wrapperMount(<Dropdown options={options} selection />)

      await user.click(root())
      dropdownMenuIsOpen()

      await user.keyboard('{Escape}')
      dropdownMenuIsClosed()
    })
  })

  describe('onOpen', () => {
    it('called when dropdown would open', async () => {
      const onOpen = vi.fn()
      wrapperMount(<Dropdown options={options} selection onOpen={onOpen} />)

      await user.click(root())
      expect(onOpen).toHaveBeenCalledTimes(1)
    })

    it('not called when dropdown would not open', async () => {
      const onOpen = vi.fn()
      wrapperMount(<Dropdown options={options} selection onOpen={onOpen} />)

      await user.keyboard('{ArrowDown}')
      expect(onOpen).not.toHaveBeenCalled()
    })

    it('is called once when the icon is clicked with a search prop', async () => {
      // https://github.com/Semantic-Org/Semantic-UI-React/issues/2600
      const onOpen = vi.fn()
      wrapperMount(<Dropdown options={options} selection search onOpen={onOpen} />)

      await user.click(icon())
      expect(onOpen).toHaveBeenCalledTimes(1)
    })
  })

  describe('onClose', () => {
    it('called when dropdown would close', async () => {
      const onClose = vi.fn()
      wrapperMount(<Dropdown defaultOpen onClose={onClose} options={options} selection />)

      await user.click(root())
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('called once even when blurred', async () => {
      // Heads up!
      // Special test for: https://github.com/Semantic-Org/Semantic-UI-React/issues/2953
      const onClose = vi.fn()
      wrapperMount(<Dropdown defaultOpen onClose={onClose} options={options} selection />)

      await user.click(root())
      await user.tab()
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('open', () => {
    it('defaultOpen opens the menu when true', async () => {
      wrapperMount(<Dropdown options={options} selection defaultOpen />)
      dropdownMenuIsOpen()
    })

    it('defaultOpen opens the menu on search dropdowns', async () => {
      wrapperMount(<Dropdown search options={options} selection defaultOpen />)
      dropdownMenuIsOpen()
    })

    it('defaultOpen closes the menu when false', async () => {
      wrapperMount(<Dropdown options={options} selection defaultOpen={false} />)
      dropdownMenuIsClosed()
    })

    it('opens the menu when true', async () => {
      wrapperMount(<Dropdown options={options} selection open />)
      dropdownMenuIsOpen()
    })

    it('closes the menu when false', async () => {
      wrapperMount(<Dropdown options={options} selection open={false} />)
      dropdownMenuIsClosed()
    })

    it('closes the menu when toggled from true to false', async () => {
      const { rerender } = render(<Dropdown options={options} selection open />)
      container = document.body.querySelector('div')

      rerender(<Dropdown options={options} selection open={false} />)
      dropdownMenuIsClosed()
    })

    it('opens the menu when toggled from false to true', async () => {
      const { rerender } = render(<Dropdown options={options} selection open={false} />)
      container = document.body.querySelector('div')

      rerender(<Dropdown options={options} selection open />)
      dropdownMenuIsOpen()
    })
  })

  describe('multiple', () => {
    it('does not close the menu on item selection with enter', async () => {
      wrapperMount(<Dropdown options={options} selection multiple />)
      await user.click(root())

      dropdownMenuIsOpen()

      // choosing an item keeps the menu open
      await user.keyboard('{Enter}')
      dropdownMenuIsOpen()
    })

    it('does not close the menu on clicking on an item', async () => {
      wrapperMount(<Dropdown options={options} selection multiple />)

      await user.click(root())
      await user.click(items()[2])

      dropdownMenuIsOpen()
    })

    it('filters active options out of the list', async () => {
      // make all the items active, expect to see none in the list
      const value = _.map(options, 'value')
      wrapperMount(<Dropdown options={options} selection value={value} multiple />)

      expect(items()).toHaveLength(0)
    })

    it('displays a label for active items', async () => {
      const testOptions = [
        { value: 'foo', text: 'foo' },
        { value: 'bar', text: 'bar', image: 'bar.jpg' },
        { value: 'baz', text: <span className='baz'>baz</span> },
        {
          value: 'qux',
          text: () => (
            <span className='qux' key='qux'>
              qux
            </span>
          ),
        },
      ]

      consoleUtil.disableOnce()
      wrapperMount(
        <Dropdown
          multiple
          options={testOptions}
          selection
          value={testOptions.map((option) => option.value)}
        />,
      )

      expect(labels()[0]).toHaveTextContent('foo')
      expect(labels()[1]).toHaveTextContent('bar')
      expect(labels()[1].querySelector('img')).toHaveAttribute('src', 'bar.jpg')
      expect(container.querySelector('span.baz')).toHaveTextContent('baz')
      expect(container.querySelector('span.qux')).toHaveTextContent('qux')
    })

    it('keeps the selection within the range of remaining options', async () => {
      // items are removed as they are made active
      // the selection should move if the last item is made active
      wrapperMount(<Dropdown options={options} selection multiple />)

      await user.click(root())
      dropdownMenuIsOpen()

      // activate the last item, removing it from the list
      await user.keyboard('{ArrowUp}')

      expect(items()).toHaveLength(options.length)
      expect(_.last(items())).toHaveClass('selected')

      await user.keyboard('{Enter}')

      // one item should be gone, and the _new_ last item should be selected
      expect(items()).toHaveLength(options.length - 1)
      expect(_.last(items())).toHaveClass('selected')
    })

    it('keeps the selection on the same index', async () => {
      wrapperMount(<Dropdown options={options} selection multiple />)

      await user.click(root())
      dropdownMenuIsOpen()

      await user.keyboard('{ArrowDown}')
      expect(items()[1]).toHaveClass('selected')

      await user.keyboard('{Enter}')
      expect(items()[1]).toHaveClass('selected')
    })

    it('skips disabled items in selection', async () => {
      const testOptions = [
        { value: 'foo', key: 'foo', text: 'foo' },
        { value: 'bar', key: 'bar', text: 'bar' },
        { value: 'baz', key: 'baz', text: 'baz', disabled: true },
        { value: 'qux', key: 'qux', text: 'qux' },
      ]
      wrapperMount(<Dropdown options={testOptions} selection multiple />)

      await user.click(root())
      dropdownMenuIsOpen()

      await user.keyboard('{ArrowDown}')
      expect(items()[1]).toHaveClass('selected')

      await user.keyboard('{Enter}')
      expect(items()[2]).toHaveClass('selected')
    })

    it('has labels with delete icons', async () => {
      // add a value so we have a label
      const value = [_.head(options).value]
      wrapperMount(<Dropdown options={options} selection value={value} multiple />)

      expect(labels()).toHaveLength(1)
      expect(labels()[0].querySelector('.delete.icon')).not.toBeNull()
    })

    it('enables custom rendering', async () => {
      const value = [_.head(options).value]
      const renderLabel = () => ({ content: 'My custom text!', as: 'div' })
      wrapperMount(
        <Dropdown options={options} selection value={value} multiple renderLabel={renderLabel} />,
      )

      const label = container.querySelector('.label')

      expect(label).toHaveTextContent('My custom text!')
      expect(label).toHaveTagName('div')
    })

    describe('selecting items', () => {
      const index = 2

      it('does not close the menu on clicking on a label', async () => {
        const value = _.map(options, 'value')
        wrapperMount(<Dropdown options={options} selection multiple value={value} />)

        await user.click(root())
        await user.click(labels()[index])

        dropdownMenuIsOpen()
      })

      it('sets label to active', async () => {
        const value = _.map(options, 'value')
        wrapperMount(<Dropdown options={options} selection multiple value={value} />)

        await user.click(root())
        await user.click(labels()[index])

        expect(labels()[index]).toHaveClass('active')
      })

      it('calls onLabelClick', async () => {
        const value = _.map(options, 'value')
        const onLabelClick = vi.fn()
        wrapperMount(
          <Dropdown
            options={options}
            selection
            multiple
            value={value}
            onLabelClick={onLabelClick}
          />,
        )

        await user.click(root())
        await user.click(labels()[index])

        expect(onLabelClick).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ value: value[index] }),
        )
      })

      it('refocuses search on select', async () => {
        wrapperMount(<Dropdown options={options} search selection multiple />)

        await user.click(root())
        await user.click(items()[index])

        dropdownInputIsFocused()
      })
    })

    describe('removing items', () => {
      it('calls onChange without the clicked value', async () => {
        const index = 2
        const value = _.map(options, 'value')
        const expected = _.without(value, value[index])
        const onChange = vi.fn()
        wrapperMount(
          <Dropdown options={options} selection value={value} multiple onChange={onChange} />,
        )

        await user.click(container.querySelectorAll('.delete.icon')[index])

        expect(onChange).toHaveBeenCalledTimes(1)
        expect(onChange).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ value: expected }),
        )
      })
    })
  })

  describe('removing items on backspace', () => {
    let onChange

    beforeEach(() => {
      onChange = vi.fn()
    })

    it('does nothing without selected items', async () => {
      wrapperMount(<Dropdown options={options} selection multiple search onChange={onChange} />)

      await user.click(root())
      await user.keyboard('{Backspace}')

      expect(onChange).not.toHaveBeenCalled()
    })

    it('removes the last item when there is no search query', async () => {
      const value = _.map(options, 'value')
      const expected = _.dropRight(value)
      wrapperMount(
        <Dropdown options={options} selection value={value} multiple search onChange={onChange} />,
      )

      await user.click(root())
      await user.keyboard('{Backspace}')

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ value: expected }),
      )
    })

    it('removes the last item when there is no search query when uncontrolled', async () => {
      const value = _.map(options, 'value')
      const expected = _.dropRight(value)
      wrapperMount(
        <Dropdown
          options={options}
          selection
          defaultValue={value}
          multiple
          search
          onChange={onChange}
        />,
      )

      await user.click(root())
      await user.keyboard('{Backspace}')

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ value: expected }),
      )
    })

    it('does not remove the last item when there is a search query', async () => {
      const value = _.map(options, 'value')
      wrapperMount(
        <Dropdown options={options} selection value={value} multiple search onChange={onChange} />,
      )

      // open and simulate search
      await user.click(root())
      await typeSearch(options[2].text)

      await user.keyboard('{Backspace}')

      expect(onChange).not.toHaveBeenCalled()
    })

    it('does not remove items for multiple dropdowns without search', async () => {
      const value = _.map(options, 'value')
      wrapperMount(
        <Dropdown options={options} selection value={value} multiple onChange={onChange} />,
      )

      await user.click(root())
      await user.keyboard('{Backspace}')

      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('onChange', () => {
    let onChange

    beforeEach(() => {
      onChange = vi.fn()
    })

    it('is called with event and value on item click', async () => {
      const index = 2
      wrapperMount(<Dropdown options={options} selection onChange={onChange} />)

      await user.click(root())
      await user.click(items()[index])

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ value: options[index].value }),
      )
    })

    it('is not called when value is not changed on item click', async () => {
      wrapperMount(<Dropdown options={options} selection onChange={onChange} />)

      await user.click(root())
      await user.click(items()[0])
      expect(onChange).toHaveBeenCalledTimes(1)
      dropdownMenuIsClosed()

      await user.click(root())
      await user.click(items()[0])
      expect(onChange).toHaveBeenCalledTimes(1)
      dropdownMenuIsClosed()
    })

    it('is called with event and value when pressing enter on a selected item', async () => {
      wrapperMount(<Dropdown options={options} selection onChange={onChange} />)

      await user.click(root())
      await user.keyboard('{Enter}')

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ value: options[0].value }),
      )
    })

    it('is called with event and value when blurring', async () => {
      wrapperMount(<Dropdown options={options} selection onChange={onChange} />)

      await user.tab() // open, highlights first item
      await user.tab() // blur should activate selected item

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ value: options[0].value }),
      )
    })

    it('is not called on blur when closed', async () => {
      wrapperMount(<Dropdown options={options} selection open={false} onChange={onChange} />)

      await user.tab()
      await user.tab()

      expect(onChange).not.toHaveBeenCalled()
    })

    it('is not called on blur when selectOnBlur is false', async () => {
      wrapperMount(
        <Dropdown options={options} selection onChange={onChange} selectOnBlur={false} />,
      )

      await user.tab()
      await user.click(root())
      await user.tab()

      expect(onChange).not.toHaveBeenCalled()
    })

    it('is not called on blur with multiple select', async () => {
      wrapperMount(<Dropdown options={options} selection onChange={onChange} multiple />)

      await user.tab()
      await user.click(root())
      await user.tab()

      expect(onChange).not.toHaveBeenCalled()
    })

    it('is not called when updating the value prop', async () => {
      const { rerender } = render(
        <Dropdown options={options} selection value={options[1].value} onChange={onChange} />,
      )
      container = document.body.querySelector('div')

      rerender(
        <Dropdown options={options} selection value={options[3].value} onChange={onChange} />,
      )

      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('onClick', () => {
    it('is called with (event, props)', async () => {
      const onClick = vi.fn()
      wrapperMount(<Dropdown onClick={onClick} options={options} />)

      await user.click(root())

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ options }))
    })

    it("toggles the dropdown when it's not searchable", async () => {
      wrapperMount(<Dropdown options={options} />)

      await user.click(root())
      dropdownMenuIsOpen()

      await user.click(root())
      dropdownMenuIsClosed()
    })

    it("opens the dropdown when it's searchable, but don't close", async () => {
      wrapperMount(<Dropdown options={options} search />)

      await user.click(root())
      dropdownMenuIsOpen()

      await user.click(root())
      dropdownMenuIsOpen()
    })

    it("don't open the dropdown when it's searchable and minCharacters is more that default value", async () => {
      wrapperMount(<Dropdown minCharacters={3} options={options} search />)

      await user.click(root())
      dropdownMenuIsClosed()
    })
  })

  describe('onFocus', () => {
    it('is called with (event, props)', async () => {
      const onFocus = vi.fn()
      wrapperMount(<Dropdown onFocus={onFocus} options={options} />)

      await user.tab()

      expect(onFocus).toHaveBeenCalledTimes(1)
      expect(onFocus).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ options }))
    })

    it("opens the dropdown when it's not searchable", async () => {
      wrapperMount(<Dropdown options={options} />)

      await user.tab()
      dropdownMenuIsOpen()
    })

    it("opens the dropdown when it's searchable", async () => {
      wrapperMount(<Dropdown options={options} search />)

      await user.tab()
      dropdownMenuIsOpen()
    })

    it("don't open the dropdown when it's searchable and minCharacters is more that default value", async () => {
      wrapperMount(<Dropdown minCharacters={3} options={options} search />)

      await user.tab()
      dropdownMenuIsClosed()
    })
  })

  describe('onSearchChange', () => {
    it('is called with (event, value) on search input change', async () => {
      const onSearchChange = vi.fn()
      wrapperMount(<Dropdown options={options} search selection onSearchChange={onSearchChange} />)

      await typeSearch('a')

      expect(onSearchChange).toHaveBeenCalledTimes(1)
      expect(onSearchChange).toHaveBeenCalledWith(
        expect.objectContaining({ target: expect.objectContaining({ value: 'a' }) }),
        expect.objectContaining({ search: true, searchQuery: 'a' }),
      )
    })

    it("don't open the menu on change if query's length is less than minCharacters", async () => {
      wrapperMount(<Dropdown minCharacters={3} options={options} selection search />)

      dropdownMenuIsClosed()

      await typeSearch('a')

      dropdownMenuIsClosed()
    })

    it("closes the opened menu on change if query's length is less than minCharacters", async () => {
      wrapperMount(<Dropdown minCharacters={3} options={options} selection search />)

      await typeSearch('abc')
      dropdownMenuIsOpen()

      await typeSearch('a')
      dropdownMenuIsClosed()
    })
  })

  describe('options', () => {
    it('adds the onClick handler to all items', async () => {
      // Enzyme asked whether each DropdownItem element carried an `onClick`
      // prop. What that prop is for is selecting the item it sits on.
      const onChange = vi.fn()

      // eslint-disable-next-line no-await-in-loop -- interactions are a sequence
      for (const [index, option] of options.entries()) {
        wrapperMount(<Dropdown options={options} selection onChange={onChange} />)
        // eslint-disable-next-line no-await-in-loop -- one click, then the next
        await user.click(root())
        // eslint-disable-next-line no-await-in-loop -- one click, then the next
        await user.click(items()[index])

        expect(onChange).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({ value: option.value }),
        )
      }

      expect(onChange).toHaveBeenCalledTimes(options.length)
    })

    it('renders new options when options change', async () => {
      const customOptions = [
        { text: 'abra', value: 'abra' },
        { text: 'cadabra', value: 'cadabra' },
        { text: 'bang', value: 'bang' },
      ]
      const { rerender } = render(<Dropdown options={customOptions} />)
      container = document.body.querySelector('div')

      expect(items()).toHaveLength(3)

      rerender(<Dropdown options={[...customOptions, { text: 'bar', value: 'bar' }]} />)

      expect(items()).toHaveLength(4)
      expect(_.last(items())).toHaveTextContent('bar')
    })

    it('passes options as props', async () => {
      const customOptions = [
        { text: 'abra', value: 'abra', 'data-foo': 'someValue' },
        { text: 'cadabra', value: 'cadabra', 'data-foo': 'someValue' },
        { text: 'bang', value: 'bang', 'data-foo': 'someValue' },
      ]
      wrapperMount(<Dropdown options={customOptions} selection />)

      for (const item of items()) {
        expect(item).toHaveAttribute('data-foo', 'someValue')
      }
    })

    it('handles keys correctly', async () => {
      // React keys are never rendered, so the frozen assertion — `items.at(1)
      // .key().should.equal('bar')` — has no DOM equivalent. What the key
      // derivation is *for* is React not complaining, and rendering each
      // option once, which is what is asserted instead.
      const error = vi.spyOn(console, 'error').mockImplementation(() => {})
      const customOptions = [
        { key: 0, text: 'foo', value: 'foo' },
        { key: null, text: 'bar', value: 'bar' },
        { key: undefined, text: 'baz', value: 'baz' },
      ]

      wrapperMount(<Dropdown options={customOptions} selection />)

      expect(items()).toHaveLength(3)
      expect(error).not.toHaveBeenCalledWith(
        expect.stringContaining('unique "key"'),
        expect.anything(),
        expect.anything(),
      )
      error.mockRestore()
    })

    it('invokes "onClick" on item and handles', async () => {
      const onItemClick = vi.fn()
      const customOptions = [
        { key: 'foo', text: 'foo', value: 'foo' },
        { key: 'bar', text: 'bar', value: 'bar', onClick: onItemClick },
      ]
      wrapperMount(<Dropdown options={customOptions} />)
      dropdownMenuIsClosed()

      await user.click(root())
      dropdownMenuIsOpen()

      await user.click(items()[1])
      dropdownMenuIsClosed()
      expect(items()[1]).toHaveClass('selected')

      expect(onItemClick).toHaveBeenCalledTimes(1)
      expect(onItemClick).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'click' }),
        expect.objectContaining({ value: 'bar' }),
      )
    })
  })

  describe('search', () => {
    it('does not add a search input when not defined', async () => {
      wrapperMount(<Dropdown options={options} selection />)

      expect(searchInput()).toBeNull()
    })

    it('adds a search input when present', async () => {
      wrapperMount(<Dropdown options={options} selection search />)

      expect(container.querySelectorAll('input.search')).toHaveLength(1)
    })

    it('sets focus to the search input on open', async () => {
      wrapperMount(<Dropdown options={options} selection search />)

      await user.click(root())

      dropdownInputIsFocused()
    })

    it('sets focus to the search input on click on the placeholder', async () => {
      wrapperMount(
        <Dropdown minCharacters={3} options={options} placeholder='foo' selection search />,
      )

      await user.click(text())

      dropdownInputIsFocused()
    })

    it('sets focus to the search input on click Dropdown when is opened', async () => {
      wrapperMount(<Dropdown open options={options} multiple selection search />)

      await user.click(root())

      dropdownInputIsFocused()
    })

    it('clears the search query when an item is selected', async () => {
      wrapperMount(<Dropdown options={options} selection search />)

      // open and simulate search
      await user.click(root())
      await typeSearch(options[2].text)

      // click the first item (we searched for exact text)
      await user.click(items()[0])

      // bye bye search query
      expect(searchInput()).toHaveValue('')
    })

    it('opens the menu on change if there is a query and not already open', async () => {
      wrapperMount(<Dropdown options={options} selection search />)

      dropdownMenuIsClosed()

      await typeSearch('a')

      dropdownMenuIsOpen()
    })

    it('does not call onChange on query change', async () => {
      const onChange = vi.fn()
      wrapperMount(<Dropdown options={options} selection search onChange={onChange} />)

      await typeSearch('a')

      expect(onChange).not.toHaveBeenCalled()
    })

    it('filters the items based on display text', async () => {
      wrapperMount(<Dropdown options={options} selection search />)

      // searching for a value yields 0 results
      await typeSearch(options[2].value)
      expect(items(), "Searching for an item's value did not yield 0 results.").toHaveLength(0)

      // searching for the text yields 1 result
      await typeSearch(options[2].text)
      expect(items(), "Searching for an item's text did not yield any results.").toHaveLength(1)
    })

    it('filters the items based on custom search function', async () => {
      const searchFunction = vi.fn(() => options.slice(0, 2))
      const searchQuery = '__nonExistingSearchQuery__'
      wrapperMount(<Dropdown options={options} selection search={searchFunction} />)

      await typeSearch(searchQuery)

      expect(searchFunction).toHaveBeenCalledWith(expect.anything(), searchQuery)
      expect(
        items(),
        'Searching with a custom search function did not yield 2 results.',
      ).toHaveLength(2)
    })

    it('sets the selected item to the first search result', async () => {
      const testOptions = [
        { value: 'foo', key: 'foo', text: 'foo' },
        { value: 'bar', key: 'bar', text: 'bar' },
        { value: 'baz', key: 'baz', text: 'baz' },
        { value: 'qux', key: 'qux', text: 'qux' },
      ]
      wrapperMount(<Dropdown options={testOptions} selection search />)

      // the first item is selected by default; move off it to avoid a false positive
      await user.click(root())
      await user.keyboard('{ArrowUp}')
      expect(items()[3]).toHaveClass('selected')

      await typeSearch('baz')
      expect(items()[0]).toHaveClass('selected')
    })

    it('still allows moving selection after blur/focus', async () => {
      wrapperMount(<Dropdown options={options} selection search />)

      // open, first item is selected
      await user.click(root())
      dropdownMenuIsOpen()
      expect(items()[0]).toHaveClass('selected')

      // blur, focus, open, move item selection down
      await user.tab()
      await user.tab()
      await user.keyboard('{ArrowDown}')

      expect(items()[0]).not.toHaveClass('selected')
      expect(items()[1]).toHaveClass('selected')

      // blur, focus, open, move item selection up
      await user.tab()
      await user.tab()
      await user.keyboard('{ArrowUp}')

      expect(items()[0]).toHaveClass('selected')
      expect(items()[1]).not.toHaveClass('selected')
    })

    it('does not close the menu when options are empty', async () => {
      wrapperMount(<Dropdown options={options} search selection />)

      await user.click(root())
      await typeSearch('nothing matches this')
      await user.keyboard('{Enter}')

      dropdownMenuIsOpen()
    })

    it('sets focus to the search input after selection', async () => {
      // skip the first as it's selected by default
      wrapperMount(<Dropdown options={options} selection search />)

      await user.click(root())
      await user.click(items()[2])

      dropdownMenuIsClosed()
      dropdownInputIsFocused()
    })

    it('sets focus to the dropdown after selection', async () => {
      wrapperMount(<Dropdown options={options} selection />)

      await user.click(root())
      await user.click(items()[2])

      // The frozen spec had this assertion commented out as a TODO waiting on
      // an Enzyme update it never got. A real click makes it hold.
      // https://github.com/Semantic-Org/Semantic-UI-React/pull/3747#issuecomment-522018329
      dropdownMenuIsClosed()
      dropdownIsFocused()
    })

    it('does not select a "disabled" item after blur', async () => {
      const customOptions = [
        { key: 'foo', text: 'foo', value: 'foo' },
        { key: 'bar', text: 'bar', value: 'bar', disabled: true },
      ]
      wrapperMount(<Dropdown options={customOptions} selection search />)

      await user.tab()
      dropdownMenuIsOpen()

      await typeSearch('bar')
      await user.tab()

      dropdownMenuIsClosed()
      expect(container.querySelector('.item.disabled')).not.toHaveClass('selected')
    })
  })

  describe('searchInput', () => {
    it('overrides onChange handler', async () => {
      const onInputChange = vi.fn()
      const onSearchChange = vi.fn()
      wrapperMount(
        <Dropdown
          onSearchChange={onSearchChange}
          options={options}
          search
          searchInput={{ onChange: onInputChange }}
        />,
      )

      await typeSearch('a')

      expect(onInputChange).toHaveBeenCalledTimes(1)
      expect(onSearchChange).toHaveBeenCalledTimes(1)
    })
  })

  describe('no results message', () => {
    const message = () => container.querySelector('.message')
    const searchForNothing = () => typeSearch('_________________')

    it('is shown when a search yields no results', async () => {
      wrapperMount(<Dropdown options={options} selection search />)

      expect(message()).toBeNull()

      await searchForNothing()

      expect(message()).not.toBeNull()
    })

    it('is not shown on multiple dropdowns with no remaining items', async () => {
      // make all the items active so there are no remaining options
      const value = _.map(options, 'value')
      wrapperMount(<Dropdown options={options} selection value={value} multiple />)

      await user.click(root())
      dropdownMenuIsOpen()

      expect(items()).toHaveLength(0)
      expect(message()).toBeNull()
    })

    it('uses default noResultsMessage', async () => {
      wrapperMount(<Dropdown options={options} selection search />)

      await searchForNothing()

      expect(message()).toHaveTextContent('No results found.')
    })

    it('uses custom string for noResultsMessage', async () => {
      wrapperMount(
        <Dropdown options={options} selection search noResultsMessage='Something custom' />,
      )

      await searchForNothing()

      expect(message()).toHaveTextContent('Something custom')
    })

    it('uses custom component for noResultsMessage', async () => {
      wrapperMount(
        <Dropdown
          options={options}
          selection
          search
          noResultsMessage={<span>Something custom</span>}
        />,
      )

      await searchForNothing()

      expect(message().querySelector('span')).not.toBeNull()
    })

    it('uses no noResultsMessage', async () => {
      wrapperMount(<Dropdown options={options} selection search noResultsMessage='' />)

      await searchForNothing()

      expect(message()).toBeEmptyDOMElement()
    })

    it('is not shown when set to `null`', async () => {
      wrapperMount(<Dropdown options={options} selection search noResultsMessage={null} />)

      await searchForNothing()

      expect(message()).toBeNull()
    })
  })

  describe('placeholder', () => {
    const placeholderText = () => container.querySelector('.default.text')

    it('is present when defined', async () => {
      wrapperMount(<Dropdown options={options} selection placeholder='hi' />)

      expect(placeholderText()).not.toBeNull()
    })

    it('is not present when not defined', async () => {
      wrapperMount(<Dropdown options={options} selection />)

      expect(placeholderText()).toBeNull()
    })

    it('is not present when there is a value', async () => {
      wrapperMount(<Dropdown options={options} selection value='hi' placeholder='hi' />)

      expect(placeholderText()).toBeNull()
    })

    it('is present on a multiple dropdown with an empty value array', async () => {
      wrapperMount(<Dropdown options={options} selection multiple placeholder='hi' />)

      expect(placeholderText()).not.toBeNull()
    })

    it('has a filtered className when there is a search query', async () => {
      wrapperMount(<Dropdown options={options} selection search placeholder='hi' />)

      await typeSearch('a')

      expect(container.querySelector('.default.text.filtered')).not.toBeNull()
    })
  })

  describe('lazyLoad', () => {
    it('does not render options when closed', async () => {
      wrapperMount(<Dropdown options={options} lazyLoad />)

      expect(items()).toHaveLength(0)
    })

    it('renders options when open', async () => {
      wrapperMount(<Dropdown options={options} lazyLoad open />)

      expect(items()).toHaveLength(options.length)
    })
  })

  describe('Dropdown.Menu child', () => {
    it('renders child passed', async () => {
      wrapperMount(
        <Dropdown text='required prop'>
          <Dropdown.Menu data-find-me />
        </Dropdown>,
      )

      expect(menu()).not.toBeNull()
      expect(menu()).toHaveAttribute('data-find-me', 'true')
    })

    it('opens on click', async () => {
      wrapperMount(
        <Dropdown text='required prop'>
          <Dropdown.Menu />
        </Dropdown>,
      )

      dropdownMenuIsClosed()
      await user.click(root())
      dropdownMenuIsOpen()
    })

    it('spreads extra menu props', async () => {
      wrapperMount(
        <Dropdown text='required prop'>
          <Dropdown.Menu data-foo-bar />
        </Dropdown>,
      )

      expect(menu()).toHaveAttribute('data-foo-bar', 'true')
    })

    it("merges the user's menu className", async () => {
      wrapperMount(
        <Dropdown text='required prop'>
          <Dropdown.Menu className='foo-bar' />
        </Dropdown>,
      )

      expect(menu()).toHaveClass('menu', 'foo-bar')
    })
  })

  describe('allowAdditions', () => {
    const customOptions = [
      { text: 'abra', value: 'abra' },
      { text: 'cadabra', value: 'cadabra' },
      { text: 'bang', value: 'bang' },
    ]
    const search = (value) => typeSearch(value)
    const addition = () => container.querySelector('.item.addition')

    it('adds an option for arbitrary search value', async () => {
      wrapperMount(<Dropdown options={customOptions} selection search allowAdditions />)

      expect(items()).toHaveLength(3)

      await search('boo')

      expect(items()).toHaveLength(1)
      expect(items()[0]).toHaveTextContent('boo')
    })

    it('adds an option for prefix search value', async () => {
      wrapperMount(<Dropdown options={customOptions} selection search allowAdditions />)

      expect(items()).toHaveLength(3)

      await search('a')

      expect(items()).toHaveLength(4)
      expect(items()[0]).toHaveClass('addition')
    })

    // The frozen spec read the addition item's `text` prop and picked apart the
    // React elements inside it — `text[1].type`, `text[1].key`. What those
    // elements produce is the label and the query in a <b>, which is what a
    // user sees and what these assert instead.
    it('uses default additionLabel', async () => {
      wrapperMount(<Dropdown options={customOptions} selection search allowAdditions />)

      await search('boo')

      expect(items()).toHaveLength(1)
      expect(addition()).toHaveTextContent('Add boo')
      expect(addition().querySelector('b')).toHaveTextContent('boo')
    })

    it('uses custom additionLabel string', async () => {
      wrapperMount(
        <Dropdown options={customOptions} selection search allowAdditions additionLabel='New: ' />,
      )

      await search('boo')

      expect(items()).toHaveLength(1)
      expect(addition()).toHaveTextContent('New: boo')
      expect(addition().querySelector('b')).toHaveTextContent('boo')
    })

    it('uses custom additionLabel element', async () => {
      wrapperMount(
        <Dropdown
          options={customOptions}
          selection
          search
          allowAdditions
          additionLabel={<i>New: </i>}
        />,
      )

      await search('boo')

      expect(items()).toHaveLength(1)
      expect(addition().querySelector('i')).toHaveTextContent('New:')
      expect(addition().querySelector('b')).toHaveTextContent('boo')
    })

    it('uses no additionLabel', async () => {
      wrapperMount(
        <Dropdown options={customOptions} selection search allowAdditions additionLabel='' />,
      )

      await search('boo')

      expect(items()).toHaveLength(1)
      expect(addition()).toHaveTextContent('boo')
      expect(addition().querySelector('b')).toHaveTextContent('boo')
    })

    it('keeps custom value option (bottom) when options change', async () => {
      const { rerender } = render(
        <Dropdown
          options={customOptions}
          selection
          search
          allowAdditions
          additionPosition='bottom'
        />,
      )
      container = document.body.querySelector('div')

      await search('a')

      expect(items()).toHaveLength(4)
      expect(_.last(items())).toHaveClass('addition')

      rerender(
        <Dropdown
          options={[...customOptions, { text: 'bar', value: 'bar' }]}
          selection
          search
          allowAdditions
          additionPosition='bottom'
        />,
      )

      expect(items()).toHaveLength(5)
      expect(_.last(items())).toHaveClass('addition')
    })

    it('keeps custom value option (top) when options change', async () => {
      const { rerender } = render(
        <Dropdown options={customOptions} selection search allowAdditions />,
      )
      container = document.body.querySelector('div')

      await search('a')

      expect(items()).toHaveLength(4)
      expect(items()[0]).toHaveClass('addition')

      rerender(
        <Dropdown
          options={[...customOptions, { text: 'bar', value: 'bar' }]}
          selection
          search
          allowAdditions
        />,
      )

      expect(items()).toHaveLength(5)
      expect(items()[0]).toHaveClass('addition')
    })

    it('calls onAddItem prop when clicking new value', async () => {
      const calls = []
      const onAddItem = vi.fn(() => calls.push('onAddItem'))
      const onChange = vi.fn(() => calls.push('onChange'))
      wrapperMount(
        <Dropdown
          allowAdditions
          onAddItem={onAddItem}
          onChange={onChange}
          options={customOptions}
          search
          selection
        />,
      )

      await search('boo')
      await user.click(items()[0])

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onAddItem).toHaveBeenCalledTimes(1)
      expect(onAddItem).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ value: 'boo' }),
      )
      // onAddItem must run after onChange
      expect(calls).toEqual(['onChange', 'onAddItem'])
    })

    it('calls onAddItem prop when pressing enter on new value', async () => {
      const calls = []
      const onAddItem = vi.fn(() => calls.push('onAddItem'))
      const onChange = vi.fn(() => calls.push('onChange'))
      wrapperMount(
        <Dropdown
          allowAdditions
          onAddItem={onAddItem}
          onChange={onChange}
          options={customOptions}
          search
          selection
        />,
      )

      await search('boo')
      await user.keyboard('{Enter}')

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onAddItem).toHaveBeenCalledTimes(1)
      expect(onAddItem).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ value: 'boo' }),
      )
      expect(calls).toEqual(['onChange', 'onAddItem'])
    })

    it('clears value of the searchQuery when selection is only option', async () => {
      wrapperMount(<Dropdown options={customOptions} selection search allowAdditions />)

      await search('boo')
      await user.keyboard('{Enter}')

      expect(searchInput()).toHaveValue('')
    })
  })

  describe('header', () => {
    it('renders a header when present', async () => {
      wrapperMount(<Dropdown options={options} header='a header' />)

      expect(container.querySelector('.menu .header')).toHaveTextContent('a header')
    })

    it('does not render a header when not present', async () => {
      wrapperMount(<Dropdown options={options} />)

      expect(container.querySelector('.menu .header')).toBeNull()
    })
  })

  describe('value validations', () => {
    it('logs an error if dropdown is not multiple and value is array', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { rerender } = render(<Dropdown options={options} value={options[0].value} selection />)

      rerender(<Dropdown options={options} value={[options[1].value]} selection />)

      expect(error).toHaveBeenCalledTimes(1)
      expect(error).toHaveBeenCalledWith(
        'Dropdown `value` must not be an array when `multiple` is not set.' +
          ' Either set `multiple={true}` or use a string or number value.',
      )
      error.mockRestore()
    })

    it('logs an error if dropdown is multiple and value not array', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {})
      const nextValue = options[1].value
      const { rerender } = render(
        <Dropdown options={options} value={[options[0].value]} selection multiple />,
      )

      rerender(<Dropdown options={options} value={nextValue} selection multiple />)

      expect(error).toHaveBeenCalledTimes(1)
      expect(error).toHaveBeenCalledWith(
        'Dropdown `value` must be an array when `multiple` is set.' +
          ` Received type: \`${Object.prototype.toString.call(nextValue)}\`.`,
      )
      error.mockRestore()
    })
  })

  describe('selectOnNavigation', () => {
    it('is on by default', async () => {
      const onChange = vi.fn()
      wrapperMount(
        <Dropdown options={options} defaultValue={options[0].value} onChange={onChange} />,
      )

      await user.click(root())
      await user.keyboard('{ArrowDown}')

      expect(onChange).toHaveBeenCalled()
      expect(items()[1]).toHaveClass('active')
    })

    it('does not change value when set to false', async () => {
      const onChange = vi.fn()
      wrapperMount(
        <Dropdown
          options={options}
          defaultValue={options[0].value}
          selectOnNavigation={false}
          onChange={onChange}
        />,
      )

      await user.click(root())
      await user.keyboard('{ArrowDown}')

      expect(onChange).not.toHaveBeenCalled()
      expect(items()[0]).toHaveClass('active')
    })
  })

  describe('wrapSelection', () => {
    it("does not move up on arrow up when first item is selected when open and 'wrapSelection' is false", async () => {
      wrapperMount(<Dropdown options={options} selection wrapSelection={false} />)

      await user.click(root())
      expect(items()[0]).toHaveClass('selected')

      await user.keyboard('{ArrowUp}')

      // the selection should stay on the first item rather than wrapping
      expect(items()[0]).toHaveClass('selected')
      expect(items()[options.length - 1]).not.toHaveClass('selected')
    })

    it("does not move down on arrow down when last item is selected when open and 'wrapSelection' is false", async () => {
      wrapperMount(<Dropdown options={options} selection wrapSelection={false} />)

      // open and make the last item selected
      await user.click(root())
      for (let i = 0; i < options.length - 1; i += 1) {
        // eslint-disable-next-line no-await-in-loop -- keypresses are a sequence
        await user.keyboard('{ArrowDown}')
      }

      expect(items()[options.length - 1]).toHaveClass('selected')

      // the selection should stay on the last item rather than wrapping
      await user.keyboard('{ArrowDown}')

      expect(items()[0]).not.toHaveClass('selected')
      expect(items()[options.length - 1]).toHaveClass('selected')
    })
  })

  describe('upward', () => {
    // `setOpenDirection` compares the dropdown's rect against the viewport
    // height, neither of which jsdom computes. Both are stubbed, as in Sticky's
    // port, so the arithmetic has real numbers to work with.
    const viewportHeight = 768
    const menuHeight = 200

    const stubLayout = (top) => {
      Object.defineProperty(document.documentElement, 'clientHeight', {
        configurable: true,
        value: viewportHeight,
      })
      Object.defineProperty(menu(), 'clientHeight', { configurable: true, value: menuHeight })
      root().getBoundingClientRect = () => ({
        top,
        height: 40,
        bottom: top + 40,
        left: 0,
        right: 0,
      })
    }

    afterEach(() => {
      delete document.documentElement.clientHeight
    })

    it('is false when there is enough space below', async () => {
      wrapperMount(<Dropdown options={options} defaultOpen />)
      stubLayout(0)

      await user.click(root())
      await user.click(root())

      expect(root()).not.toHaveClass('upward')
    })

    it('is true when there is not enough space below', async () => {
      wrapperMount(<Dropdown options={options} defaultOpen />)
      stubLayout(viewportHeight - 50)

      await user.click(root())
      await user.click(root())

      expect(root()).toHaveClass('upward')
    })
  })
})
