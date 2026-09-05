import _ from 'lodash'
import React, { Component } from 'react'
import { GridColumn, Search, Grid, Header, Segment } from 'react-fomantic-ui'

const source = [
  {
    title: 'Bergstrom Group',
    description: 'Distributed hybrid infrastructure for growing teams',
    image: '/images/avatar/small/elliot.jpg',
    price: '$24.00',
  },
  {
    title: 'Cassin and Sons',
    description: 'Front-line encompassing workflow automation',
    image: '/images/avatar/small/jenny.jpg',
    price: '$48.50',
  },
  {
    title: 'Dietrich Holdings',
    description: 'Organic zero-administration knowledge base',
    image: '/images/avatar/small/matt.jpg',
    price: '$12.75',
  },
  {
    title: 'Kuhlman Partners',
    description: 'Reactive object-oriented reporting for the enterprise',
    image: '/images/avatar/small/steve.jpg',
    price: '$91.20',
  },
  {
    title: 'Weimann Industries',
    description: 'Seamless bi-directional analytics at any scale',
    image: '/images/avatar/small/tom.jpg',
    price: '$67.00',
  },
]

const initialState = { isLoading: false, results: [], value: '' }

export default class SearchExampleStandard extends Component {
  state = initialState

  handleResultSelect = (e, { result }) => this.setState({ value: result.title })

  handleSearchChange = (e, { value }) => {
    this.setState({ isLoading: true, value })

    setTimeout(() => {
      if (this.state.value.length < 1) return this.setState(initialState)

      const re = new RegExp(_.escapeRegExp(this.state.value), 'i')
      const isMatch = (result) => re.test(result.title)

      this.setState({
        isLoading: false,
        results: _.filter(source, isMatch),
      })
    }, 300)
  }

  render() {
    const { isLoading, value, results } = this.state

    return (
      <Grid>
        <GridColumn width={6}>
          <Search
            aligned='right'
            loading={isLoading}
            onResultSelect={this.handleResultSelect}
            onSearchChange={_.debounce(this.handleSearchChange, 500, {
              leading: true,
            })}
            results={results}
            value={value}
          />
        </GridColumn>
        <GridColumn width={10}>
          <Segment>
            <Header>State</Header>
            <pre style={{ overflowX: 'auto' }}>
              {JSON.stringify(this.state, null, 2)}
            </pre>
            <Header>Options</Header>
            <pre style={{ overflowX: 'auto' }}>
              {JSON.stringify(source, null, 2)}
            </pre>
          </Segment>
        </GridColumn>
      </Grid>
    )
  }
}
