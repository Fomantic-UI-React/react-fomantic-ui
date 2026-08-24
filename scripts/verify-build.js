/**
 * Post-build smoke test.
 *
 * Renders a few components from dist/commonjs and asserts the behaviour that
 * has no other coverage while the test suite is being migrated:
 *
 *  - declared props become CSS classes, not DOM attributes (handledProps)
 *  - unknown props still reach the DOM
 *  - shorthand factories render nested elements
 *  - Portal.handledProps resolves, which Modal and Popup read at runtime
 */
const assert = require('assert')
const path = require('path')
const React = require('react')
const ReactDOMServer = require('react-dom/server')

const dist = path.join(__dirname, '..', 'dist', 'commonjs', 'index.js')
const SUI = require(dist)
const render = (el) => ReactDOMServer.renderToStaticMarkup(el)

assert.ok(Object.keys(SUI).length > 150, 'expected >150 exports')

const button = render(React.createElement(SUI.Button, { primary: true, size: 'large' }, 'Go'))
assert.ok(button.includes('primary') && button.includes('large'), 'props should become classes')
assert.ok(!/primary="|size="/.test(button), `props leaked onto the DOM: ${button}`)

const forwarded = render(React.createElement(SUI.Button, { 'data-x': '1', id: 'z' }))
assert.ok(forwarded.includes('data-x="1"'), 'data attributes should reach the DOM')
assert.ok(forwarded.includes('id="z"'), 'id should reach the DOM')

const label = render(React.createElement(SUI.Label, { icon: 'user', content: 'Hi' }))
assert.ok(label.includes('user icon'), `shorthand factory failed: ${label}`)

assert.ok(Array.isArray(SUI.Portal.handledProps), 'Portal.handledProps must be an array')
assert.ok(SUI.Portal.handledProps.length > 0, 'Portal.handledProps must not be empty')

console.log('build verification passed')
