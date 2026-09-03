const noop = () => undefined

const original = { ...console }
const disabled = { log: noop, error: noop, debug: noop, warn: noop, info: noop }

let isDisabledOnce = false

const enable = () => Object.assign(console, original)
const disable = () => Object.assign(console, disabled)

/** Silence the console for a single test. Re-enabled automatically afterwards. */
const disableOnce = () => {
  isDisabledOnce = true
  disable()
}

afterEach(() => {
  if (isDisabledOnce) {
    isDisabledOnce = false
    enable()
  }
})

export default { enable, disable, disableOnce }
