import React from 'react'
import { Accordion, Label, Message } from 'react-fomantic-ui'

const panels = [
  {
    key: 'panel-0',
    title: { content: <Label color='blue' content='What is a dog?' /> },
    content: {
      content: (
        <Message
          info
          header='A domesticated carnivorous mammal'
          content='A dog is a type of domesticated animal. Known for its loyalty and faithfulness, it can be found as a welcome guest in many households across the world.'
        />
      ),
    },
  },
  {
    key: 'panel-1',
    title: {
      content: <Label color='blue' content='What kinds of dogs are there?' />,
    },
    content: {
      content: (
        <Message
          info
          header='Hundreds of breeds, in every shape and size'
          content='There are many breeds of dogs. Each breed varies in size and temperament. Owners often select a breed of dog that they find to be compatible with their own lifestyle and desires from a companion.'
        />
      ),
    },
  },
  {
    key: 'panel-2',
    title: {
      content: <Label color='blue' content='How do you acquire a dog?' />,
    },
    content: {
      content: (
        <Message
          info
          header='Adopt, or go to a breeder'
          content='Three common ways for a prospective owner to acquire a dog is from pet shops, private owners, or shelters. A pet shop may be the most convenient way to buy a dog. Buying a dog from a private owner allows you to assess the pedigree and upbringing of your dog before choosing to take it home.'
        />
      ),
    },
  },
]

const AccordionExampleShorthand = () => (
  <Accordion defaultActiveIndex={1} panels={panels} />
)

export default AccordionExampleShorthand
