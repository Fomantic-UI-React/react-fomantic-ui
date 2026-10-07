import Button from './internal/Button'
import ButtonContent from './ButtonContent'
import ButtonGroup from './ButtonGroup'
import ButtonOr from './ButtonOr'

// Button is defined in internal/ so that ButtonGroup can import it without importing
// this module back. That cycle broke `Button.Group` whenever ButtonGroup loaded first (#8).
Button.Content = ButtonContent
Button.Group = ButtonGroup
Button.Or = ButtonOr

export default Button
