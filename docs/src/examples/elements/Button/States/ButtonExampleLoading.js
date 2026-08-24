import React from 'react'
import { Button } from 'react-fomantic-ui'

const ButtonExampleLoading = () => (
  <div>
    <Button loading>Loading</Button>
    <Button basic loading>
      Loading
    </Button>
    <Button loading primary>
      Loading
    </Button>
    <Button loading secondary>
      Loading
    </Button>
  </div>
)

export default ButtonExampleLoading
