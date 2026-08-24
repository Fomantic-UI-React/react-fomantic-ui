import React from 'react'
import { GridRow, GridColumn, Grid, Image } from 'react-fomantic-ui'

const GridExampleColumns = () => (
  <Grid>
    <GridRow>
      <GridColumn width={8}>
        <Image src='/images/wireframe/paragraph.png' />
      </GridColumn>
      <GridColumn width={8}>
        <Image src='/images/wireframe/paragraph.png' />
      </GridColumn>
    </GridRow>

    <GridRow>
      <GridColumn width={8}>
        <Image src='/images/wireframe/paragraph.png' />
      </GridColumn>
      <GridColumn width={8}>
        <Image src='/images/wireframe/paragraph.png' />
      </GridColumn>
    </GridRow>
  </Grid>
)

export default GridExampleColumns
