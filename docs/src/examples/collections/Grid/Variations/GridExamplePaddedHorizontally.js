import React from 'react'
import { GridColumn, Grid, Image } from 'react-fomantic-ui'

const GridExamplePaddedHorizontally = () => (
  <div>
    <p>The following grid has horizontal gutters.</p>

    <Grid columns={2} padded='horizontally'>
      <GridColumn>
        <Image src='/images/wireframe/paragraph.png' />
      </GridColumn>
      <GridColumn>
        <Image src='/images/wireframe/paragraph.png' />
      </GridColumn>
    </Grid>
  </div>
)

export default GridExamplePaddedHorizontally
