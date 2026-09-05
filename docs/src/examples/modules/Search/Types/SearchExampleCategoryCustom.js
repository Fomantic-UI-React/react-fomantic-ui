import PropTypes from 'prop-types'
import _ from 'lodash'
import React, { Component } from 'react'
import {
  GridColumn,
  Search,
  Grid,
  Header,
  Segment,
  Label,
} from 'react-fomantic-ui'

const categoryLayoutRenderer = ({ categoryContent, resultsContent }) => (
  <div>
    <h3 className='name'>{categoryContent}</h3>
    <div style={{ background: 'red' }} className='results'>
      {resultsContent}
    </div>
  </div>
)

categoryLayoutRenderer.propTypes = {
  categoryContent: PropTypes.node,
  resultsContent: PropTypes.node,
}

const categoryRenderer = ({ name }) => <Label as='span' content={name} />

categoryRenderer.propTypes = {
  name: PropTypes.string,
}

const resultRenderer = ({ title }) => <Label content={title} />

resultRenderer.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
}

const initialState = { isLoading: false, results: [], value: '' }

const categories = {
  bandwidth: [
    {
      title: 'Bergstrom Group',
      description: 'Distributed hybrid infrastructure',
    },
    { title: 'Cassin and Sons', description: 'Front-line workflow automation' },
    {
      title: 'Dietrich Holdings',
      description: 'Organic zero-administration knowledge base',
    },
    {
      title: 'Kuhlman Partners',
      description: 'Reactive object-oriented reporting',
    },
    {
      title: 'Weimann Industries',
      description: 'Seamless bi-directional analytics',
    },
  ],
  firewall: [
    {
      title: 'Abbott Logistics',
      description: 'Multi-layered client-server firmware',
    },
    {
      title: 'Bosco Analytics',
      description: 'Cross-platform intangible middleware',
    },
    { title: 'Grady Networks', description: 'Optional composite hierarchy' },
    {
      title: 'Hane Systems',
      description: 'Streamlined bottom-line encryption',
    },
    {
      title: 'Roob Communications',
      description: 'Ergonomic mission-critical throughput',
    },
  ],
  protocol: [
    {
      title: 'Beier and Daughters',
      description: 'Persistent zero-defect protocol',
    },
    {
      title: 'Emard Digital',
      description: 'Assimilated coherent instruction set',
    },
    { title: 'Larson Group', description: 'Fundamental national attitude' },
    { title: 'Rippin Consulting', description: 'Balanced dedicated matrix' },
    {
      title: 'Volkman Labs',
      description: 'Universal well-modulated capability',
    },
  ],
}

const avatars = ['elliot', 'jenny', 'matt', 'steve', 'tom']

const source = _.mapValues(categories, (results, name) => ({
  name,
  results: _.map(results, (result, index) => ({
    ...result,
    image: `/images/avatar/small/${avatars[index]}.jpg`,
    price: `$${(index + 1) * 17}.00`,
  })),
}))

export default class SearchExampleCategory extends Component {
  state = initialState

  handleResultSelect = (e, { result }) => this.setState({ value: result.title })

  handleSearchChange = (e, { value }) => {
    this.setState({ isLoading: true, value })

    setTimeout(() => {
      if (this.state.value.length < 1) return this.setState(initialState)

      const re = new RegExp(_.escapeRegExp(this.state.value), 'i')
      const isMatch = (result) => re.test(result.title)

      const filteredResults = _.reduce(
        source,
        (memo, data, name) => {
          const results = _.filter(data.results, isMatch)
          if (results.length) memo[name] = { name, results } // eslint-disable-line no-param-reassign

          return memo
        },
        {},
      )

      this.setState({
        isLoading: false,
        results: filteredResults,
      })
    }, 300)
  }

  render() {
    const { isLoading, value, results } = this.state

    return (
      <Grid>
        <GridColumn width={8}>
          <Search
            category
            categoryLayoutRenderer={categoryLayoutRenderer}
            categoryRenderer={categoryRenderer}
            loading={isLoading}
            onResultSelect={this.handleResultSelect}
            onSearchChange={_.debounce(this.handleSearchChange, 500, {
              leading: true,
            })}
            resultRenderer={resultRenderer}
            results={results}
            value={value}
          />
        </GridColumn>
        <GridColumn width={8}>
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
