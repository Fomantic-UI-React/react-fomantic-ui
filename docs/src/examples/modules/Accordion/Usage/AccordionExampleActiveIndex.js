import React, { Component } from 'react'
import { Accordion, Segment } from 'react-fomantic-ui'

const panels = [
  {
    key: 'panel-0',
    title: 'What is a dog?',
    content:
      'A dog is a type of domesticated animal. Known for its loyalty and faithfulness, it can be found as a welcome guest in many households across the world.',
  },
  {
    key: 'panel-1',
    title: 'What kinds of dogs are there?',
    content:
      'There are many breeds of dogs. Each breed varies in size and temperament. Owners often select a breed of dog that they find to be compatible with their own lifestyle and desires from a companion.',
  },
  {
    key: 'panel-2',
    title: 'How do you acquire a dog?',
    content:
      'Three common ways for a prospective owner to acquire a dog is from pet shops, private owners, or shelters. A pet shop may be the most convenient way to buy a dog.',
  },
]

export default class AccordionExampleActiveIndex extends Component {
  state = { activeIndex: 0 }

  handleSliderChange = (e) =>
    this.setState({ activeIndex: Number(e.target.value) })

  handleTitleClick = (e, itemProps) => {
    const { index } = itemProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index

    this.setState({ activeIndex: newIndex })
  }

  render() {
    const { activeIndex } = this.state

    return (
      <div>
        <Segment secondary>
          <div>activeIndex: {activeIndex}</div>
          <input
            type='range'
            min='-1'
            max={panels.length - 1}
            value={activeIndex}
            onChange={this.handleSliderChange}
          />
        </Segment>

        <Accordion
          activeIndex={activeIndex}
          panels={panels}
          onTitleClick={this.handleTitleClick}
        />
      </div>
    )
  }
}
