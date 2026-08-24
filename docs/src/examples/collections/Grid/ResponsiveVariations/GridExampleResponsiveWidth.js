import React from 'react'
import { GridColumn, Grid, Image } from 'react-fomantic-ui'

const GridExampleResponsiveWidth = () => (
  <div>
    <Grid>
      <GridColumn mobile={16} tablet={8} computer={4}>
        <Image src='/images/wireframe/paragraph.png' />
      </GridColumn>
      <GridColumn mobile={16} tablet={8} computer={4}>
        <Image src='/images/wireframe/paragraph.png' />
      </GridColumn>
      <GridColumn mobile={16} tablet={8} computer={4}>
        <Image src='/images/wireframe/paragraph.png' />
      </GridColumn>
      <GridColumn mobile={16} tablet={8} computer={4}>
        <Image src='/images/wireframe/paragraph.png' />
      </GridColumn>
      <GridColumn mobile={16} tablet={8} computer={4}>
        <Image src='/images/wireframe/paragraph.png' />
      </GridColumn>
    </Grid>

    <Grid>
      <GridColumn largeScreen={2} widescreen={1}>
        <Image src='/images/wireframe/paragraph.png' />
      </GridColumn>
      <GridColumn largeScreen={2} widescreen={1}>
        <Image src='/images/wireframe/paragraph.png' />
      </GridColumn>
      <GridColumn largeScreen={2} widescreen={1}>
        <Image src='/images/wireframe/paragraph.png' />
      </GridColumn>
      <GridColumn largeScreen={2} widescreen={1}>
        <Image src='/images/wireframe/paragraph.png' />
      </GridColumn>
    </Grid>
  </div>
)

export default GridExampleResponsiveWidth
