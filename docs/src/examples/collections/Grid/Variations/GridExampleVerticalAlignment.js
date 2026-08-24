import React from 'react'
import { GridRow, GridColumn, Grid, Image } from 'react-fomantic-ui'

const GridExampleVerticalAlignment = () => (
  <Grid verticalAlign='middle' columns={4} centered>
    <GridRow>
      <GridColumn>
        <Image src='/images/wireframe/image.png' />
      </GridColumn>
      <GridColumn>
        <Image src='/images/wireframe/image.png' />
        <br />
        <Image src='/images/wireframe/image.png' />
      </GridColumn>
      <GridColumn>
        <Image src='/images/wireframe/image.png' />
      </GridColumn>
    </GridRow>
  </Grid>
)

export default GridExampleVerticalAlignment
