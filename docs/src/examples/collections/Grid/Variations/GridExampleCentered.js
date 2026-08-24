import React from 'react'
import { GridRow, GridColumn, Grid, Image } from 'react-fomantic-ui'

const GridExampleCentered = () => (
  <Grid centered columns={2}>
    <GridColumn>
      <Image src='/images/wireframe/image.png' />
    </GridColumn>

    <GridRow centered columns={4}>
      <GridColumn>
        <Image src='/images/wireframe/image.png' />
      </GridColumn>
      <GridColumn>
        <Image src='/images/wireframe/image.png' />
      </GridColumn>
      <GridColumn>
        <Image src='/images/wireframe/image.png' />
      </GridColumn>
    </GridRow>

    <GridRow centered columns={4}>
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
    </GridRow>
  </Grid>
)

export default GridExampleCentered
