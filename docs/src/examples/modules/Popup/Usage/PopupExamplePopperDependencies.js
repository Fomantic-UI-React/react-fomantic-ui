import React from 'react'
import {
  PlaceholderParagraph,
  PlaceholderLine,
  PlaceholderHeader,
  Button,
  Header,
  Placeholder,
  Popup,
} from 'react-fomantic-ui'

const PopupExamplePopperDependencies = () => {
  const [data, setData] = React.useState(null)
  const timer = React.useRef()

  return (
    <Popup
      on='click'
      onClose={() => {
        setData(null)
        clearTimeout(timer.current)
      }}
      onOpen={() => {
        setData(null)

        timer.current = setTimeout(() => {
          setData({
            description:
              'Joined in 2013. Maintains the design system and reviews most of the component work. Usually found in the Thursday office hours.',
            name: 'Elliot',
            title: 'Principal Engineer',
          })
        }, 2000)
      }}
      popperDependencies={[!!data]}
      trigger={<Button content='Simulate loading' icon='lab' />}
      wide
    >
      {data === null ? (
        <Placeholder style={{ minWidth: '200px' }}>
          <PlaceholderHeader>
            <PlaceholderLine />
            <PlaceholderLine />
          </PlaceholderHeader>
          <PlaceholderParagraph>
            <PlaceholderLine length='medium' />
            <PlaceholderLine length='short' />
          </PlaceholderParagraph>
        </Placeholder>
      ) : (
        <>
          <Header as='h2' content={data.name} subheader={data.title} />
          <p>{data.description}</p>
        </>
      )}
    </Popup>
  )
}

export default PopupExamplePopperDependencies
