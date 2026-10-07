import Button from './internal/Button'
import ButtonContent from './ButtonContent'
import ButtonGroup from './ButtonGroup'
import ButtonOr from './ButtonOr'

// Button is defined in internal/ so that ButtonGroup can import it without importing
// this module back; that cycle broke `Button.Group` whenever the Group loaded first (#8).
//
// The statics are attached in the export itself, not as statements before it. Exporting
// the imported binding lets rollup point the package entry straight at internal/Button,
// leaving this module as a side-effect-only import that bundlers drop under
// "sideEffects": false, and `Button.Group` with it.
export default Object.assign(Button, {
  Content: ButtonContent,
  Group: ButtonGroup,
  Or: ButtonOr,
})
