import Card from './internal/Card'
import CardContent from './CardContent'
import CardDescription from './CardDescription'
import CardGroup from './CardGroup'
import CardHeader from './CardHeader'
import CardMeta from './CardMeta'

// Card is defined in internal/ so that CardGroup can import it without importing
// this module back; that cycle broke `Card.Group` whenever the Group loaded first (#8).
//
// The statics are attached in the export itself, not as statements before it. Exporting
// the imported binding lets rollup point the package entry straight at internal/Card,
// leaving this module as a side-effect-only import that bundlers drop under
// "sideEffects": false, and `Card.Group` with it.
export default Object.assign(Card, {
  Content: CardContent,
  Description: CardDescription,
  Group: CardGroup,
  Header: CardHeader,
  Meta: CardMeta,
})
