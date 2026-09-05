import _ from 'lodash'
import React from 'react'
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

const initialState = {
  loading: false,
  results: [],
  value: '',
}

function exampleReducer(state, action) {
  switch (action.type) {
    case 'CLEAN_QUERY':
      return initialState
    case 'START_SEARCH':
      return { ...state, loading: true, value: action.query }
    case 'FINISH_SEARCH':
      return { ...state, loading: false, results: action.results }
    case 'UPDATE_SELECTION':
      return { ...state, value: action.selection }

    default:
      throw new Error()
  }
}

function SearchExampleStandard() {
  const [state, dispatch] = React.useReducer(exampleReducer, initialState)
  const { loading, results, value } = state

  const timeoutRef = React.useRef()
  const handleSearchChange = React.useCallback((e, data) => {
    clearTimeout(timeoutRef.current)
    dispatch({ type: 'START_SEARCH', query: data.value })

    timeoutRef.current = setTimeout(() => {
      if (data.value.length === 0) {
        dispatch({ type: 'CLEAN_QUERY' })
        return
      }

      const re = new RegExp(_.escapeRegExp(data.value), 'i')
      const isMatch = (result) => re.test(result.title)

      dispatch({
        type: 'FINISH_SEARCH',
        results: _.filter(source, isMatch),
      })
    }, 300)
  }, [])
  React.useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <Grid>
      <GridColumn width={6}>
        <Search
          loading={loading}
          placeholder='Search...'
          onResultSelect={(e, data) =>
            dispatch({ type: 'UPDATE_SELECTION', selection: data.result.title })
          }
          onSearchChange={handleSearchChange}
          results={results}
          value={value}
        />
      </GridColumn>

      <GridColumn width={10}>
        <Segment>
          <Header>State</Header>
          <pre style={{ overflowX: 'auto' }}>
            {JSON.stringify({ loading, results, value }, null, 2)}
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

export default SearchExampleStandard
