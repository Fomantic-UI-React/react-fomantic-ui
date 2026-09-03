import Card from 'src/views/Card/Card'
import CardContent from 'src/views/Card/CardContent'
import CardDescription from 'src/views/Card/CardDescription'
import CardGroup from 'src/views/Card/CardGroup'
import CardHeader from 'src/views/Card/CardHeader'
import CardMeta from 'src/views/Card/CardMeta'
import * as common from 'test/support/commonTests'

describe('Card', () => {
  common.isConformant(Card)
  common.forwardsRef(Card)
  common.hasSubcomponents(Card, [CardContent, CardDescription, CardGroup, CardHeader, CardMeta])
  common.hasUIClassName(Card)
})
