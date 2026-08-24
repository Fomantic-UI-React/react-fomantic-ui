import React from 'react'
import { HeaderSubheader, HeaderContent, Header, Icon } from 'react-fomantic-ui'

const HeaderExampleSettingsIcon = () => (
  <Header as='h2'>
    <Icon name='settings' />
    <HeaderContent>
      Account Settings
      <HeaderSubheader>Manage your preferences</HeaderSubheader>
    </HeaderContent>
  </Header>
)

export default HeaderExampleSettingsIcon
