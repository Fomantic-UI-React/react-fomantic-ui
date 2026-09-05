import React from 'react'
import { Accordion } from 'react-fomantic-ui'

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

const AccordionExampleExclusive = () => (
  <Accordion
    defaultActiveIndex={[0, 2]}
    panels={panels}
    exclusive={false}
    fluid
  />
)

export default AccordionExampleExclusive
