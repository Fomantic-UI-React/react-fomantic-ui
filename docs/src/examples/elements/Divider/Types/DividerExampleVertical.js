import React from 'react'
import { GridColumn, Divider, Grid, Image, Segment } from 'react-fomantic-ui'

const DividerExampleVertical = () => (
  <Segment>
    <Grid columns={2} relaxed='very'>
      <GridColumn>
        <p>
          <Image src='/images/wireframe/short-paragraph.png' />
        </p>
        <p>
          <Image src='/images/wireframe/short-paragraph.png' />
        </p>
        <p>
          <Image src='/images/wireframe/short-paragraph.png' />
        </p>
        <p>
          <Image src='/images/wireframe/short-paragraph.png' />
        </p>
      </GridColumn>
      <GridColumn>
        <p>
          <Image src='/images/wireframe/short-paragraph.png' />
        </p>
        <p>
          <Image src='/images/wireframe/short-paragraph.png' />
        </p>
        <p>
          <Image src='/images/wireframe/short-paragraph.png' />
        </p>
        <p>
          <Image src='/images/wireframe/short-paragraph.png' />
        </p>
      </GridColumn>
    </Grid>

    <Divider vertical>And</Divider>
  </Segment>
)

export default DividerExampleVertical
