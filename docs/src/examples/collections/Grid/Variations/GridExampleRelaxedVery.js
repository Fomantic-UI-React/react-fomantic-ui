import React from 'react'
import { GridColumn, Grid, Image } from 'react-fomantic-ui'

const GridExampleRelaxedVery = () => (
  <Grid relaxed='very' columns={4}>
    <GridColumn>
      <Image src='/images/wireframe/image.png' />
    </GridColumn>
    <GridColumn>
      <Image src='/images/wireframe/image.png' />
    </GridColumn>
    <GridColumn>
      <Image src='/images/wireframe/image.png' />
    </GridColumn>
    <GridColumn>
      <Image src='/images/wireframe/image.png' />
    </GridColumn>
  </Grid>
)

export default GridExampleRelaxedVery
