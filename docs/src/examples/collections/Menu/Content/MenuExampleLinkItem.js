import React, { Component } from 'react'
import { MenuItem, Menu, Message } from 'react-fomantic-ui'

export default class MenuExampleLinkItem extends Component {
  state = {}
  handleClick = () => this.setState({ message: 'onClick handled' })

  render() {
    const { message } = this.state

    return (
      <div>
        <Menu vertical>
          <MenuItem href='//example.com' target='_blank'>
            Visit another website
          </MenuItem>
          <MenuItem link>Link via prop</MenuItem>
          <MenuItem onClick={this.handleClick}>Javascript Link</MenuItem>
        </Menu>

        {message && <Message content={message} />}
      </div>
    )
  }
}
