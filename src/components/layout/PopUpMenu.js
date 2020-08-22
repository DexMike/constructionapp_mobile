import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Auth } from 'aws-amplify';
import {View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, FlatList} from 'react-native';

import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';

import ProfileService from '../../api/ProfileService';
import CompanyService from '../../api/CompanyService';
import {translate} from "../../i18n";
import * as Keychain from "react-native-keychain";

class PopUpMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
        isAdmin: null
    };
  }

  async componentDidMount() {
    this.mounted = true;
    const profile = await ProfileService.getProfile();
    const company = await CompanyService.getCompanyById(profile.companyId);
    let isAdmin = false;
    if (company.adminId === profile.userId) {
      isAdmin = true;
    } else {
      isAdmin = false;
    }
    if (this.mounted) {
      this.setState({
        isAdmin
      });
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { isAdmin } = this.state;
    return (
      <Menu>
        <MenuTrigger>
          <Icon name={'perm-identity'} size={32} color="#FFF" style={{paddingRight: 16}}/>
        </MenuTrigger>
        <MenuOptions
          style={{padding: 16}}
          optionsContainerStyle={{ marginTop: 40, width: 200}}>
            {
              isAdmin ? (
                <MenuOption
                  onSelect={() => this.props.navigation.navigate('CompanySettings')}
                >
                  <Text style={styles.adminItem}>{translate('Company Settings')}</Text>
                </MenuOption>
              ) : null
            }

          <MenuOption
            onSelect={() => this.props.navigation.navigate('UserSettings')}
          >
            <Text style={isAdmin ? styles.item : styles.adminItem}>{translate('User Settings')}</Text>
          </MenuOption>
          <MenuOption
            onSelect={async () => {
              try {
                // NOTE: have to pass props to change auth state like this
                // ref https://github.com/aws-amplify/amplify-js/issues/1529
                const {onStateChange} = this.props.screenProps;
                // {global: true} NOTE we might need this
                await Keychain.resetGenericPassword();
                await Auth.signOut();
                onStateChange('signedOut', null);
              } catch (err) {
                // POST https://cognito-idp.us-east-1.amazonaws.com/ 400
                // Uncaught (in promise) {code: "NotAuthorizedException",
                // name: "NotAuthorizedException", message: "Access Token has been revoked"}
                onStateChange('signedOut', null);
              }
              }
          }
          >
            <Text style={styles.item}>{translate('Logout')}</Text>
          </MenuOption>
        </MenuOptions>
      </Menu>
    );
  }
}

const styles = StyleSheet.create({
  adminItem: {
    fontSize: 16,
    color: '#212121'
  },
	item: {
    fontSize: 16,
    paddingTop: 16,
    color: '#212121'
	}
});

export default PopUpMenu;
