import React from 'react'
import { GridColumn, Grid } from 'react-fomantic-ui'

const GridExampleReversedTablet = () => (
  <Grid reversed='tablet' columns='equal'>
    <GridColumn>Tablet Fourth</GridColumn>
    <GridColumn>Tablet Third</GridColumn>
    <GridColumn>Tablet Second</GridColumn>
    <GridColumn>Tablet First</GridColumn>
  </Grid>
)

export default GridExampleReversedTablet
