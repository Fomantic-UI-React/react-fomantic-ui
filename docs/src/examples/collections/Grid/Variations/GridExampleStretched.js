import React from 'react'
import { GridRow, GridColumn, Grid, Segment } from 'react-fomantic-ui'

const GridExampleStretched = () => (
  <Grid columns={3} divided>
    <GridRow stretched>
      <GridColumn>
        <Segment>1</Segment>
      </GridColumn>
      <GridColumn>
        <Segment>1</Segment>
        <Segment>2</Segment>
      </GridColumn>
      <GridColumn>
        <Segment>1</Segment>
        <Segment>2</Segment>
        <Segment>3</Segment>
      </GridColumn>
    </GridRow>
  </Grid>
)

export default GridExampleStretched
