import Card from './internal/Card'
import CardContent from './CardContent'
import CardDescription from './CardDescription'
import CardGroup from './CardGroup'
import CardHeader from './CardHeader'
import CardMeta from './CardMeta'

// Card is defined in internal/ so that CardGroup can import it without importing
// this module back. That cycle broke `Card.Group` whenever CardGroup loaded first (#8).
Card.Content = CardContent
Card.Description = CardDescription
Card.Group = CardGroup
Card.Header = CardHeader
Card.Meta = CardMeta

export default Card
