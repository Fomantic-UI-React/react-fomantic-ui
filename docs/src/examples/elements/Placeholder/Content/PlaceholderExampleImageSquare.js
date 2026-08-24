import React from 'react'
import {
  CardGroup,
  CardContent,
  PlaceholderImage,
  Card,
  Placeholder,
} from 'react-fomantic-ui'

const PlaceholderExampleImageSquare = () => (
  <CardGroup itemsPerRow={3}>
    <Card>
      <CardContent>
        <Placeholder>
          <PlaceholderImage square />
        </Placeholder>
      </CardContent>
    </Card>
    <Card>
      <CardContent>
        <Placeholder>
          <PlaceholderImage square />
        </Placeholder>
      </CardContent>
    </Card>
    <Card>
      <CardContent>
        <Placeholder>
          <PlaceholderImage square />
        </Placeholder>
      </CardContent>
    </Card>
  </CardGroup>
)

export default PlaceholderExampleImageSquare
