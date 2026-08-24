import React from 'react'
import { HeaderSubheader, Header, Icon } from 'react-fomantic-ui'

const HeaderExampleSettingsIcon = () => (
  <Header as='h2' icon>
    <Icon name='settings' />
    Account Settings
    <HeaderSubheader>
      Manage your account settings and set e-mail preferences.
    </HeaderSubheader>
  </Header>
)

export default HeaderExampleSettingsIcon
