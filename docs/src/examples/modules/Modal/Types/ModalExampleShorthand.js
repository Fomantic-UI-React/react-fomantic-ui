import React from 'react'
import { Button, Modal } from 'react-fomantic-ui'

function ModalExampleShorthand() {
  return (
    <Modal
      trigger={<Button>Show Modal</Button>}
      header='Reminder!'
      content='Call Benjamin regarding the reports.'
      actions={['Snooze', { key: 'done', content: 'Done', positive: true }]}
    />
  )
}

export default ModalExampleShorthand
