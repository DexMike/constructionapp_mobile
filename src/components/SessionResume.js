import React, {Component} from 'react';
import {Image, KeyboardAvoidingView, Platform, TouchableHighlight, View} from 'react-native';
import styles from './shared.style';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import AppLoginImg from '../img/welcome_to_trelar_login_02.png';
import {Button} from 'react-native-elements';
import {translate} from '../i18n';
import PINCode from '@haskkor/react-native-pincode';
import * as Keychain from 'react-native-keychain';
import {Auth} from 'aws-amplify';

class SessionResume extends Component {

  constructor(props) {
    super(props);

    this.state = {
      usePin: false
    };

    this.toggleUsePin = this.toggleUsePin.bind(this);
    this.logout = this.logout.bind(this);
  }

  async storeCredentials() {
    const username = 'zuck';
    const password = 'poniesRgr8';
    // Store the credentials
    await Keychain.setGenericPassword(username, password);

    try {
      // Retrieve the credentials
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        console.log('Credentials successfully loaded for user ' + credentials.username);
      } else {
        console.log('No credentials stored');
      }
    } catch (error) {
      console.log('Keychain couldn\'t be accessed!', error);
    }
    await Keychain.resetGenericPassword();
  }

  async logIn() {
    try {
      const credentials = await Keychain.getGenericPassword();
      const data = await Auth.signIn('adam@trelar.com', 'Letme1n!');
    } catch (err) {
      console.error(err);
    }
  }

  async logout() {
    const {onStateChange, handleLogout} = { ...this.props };
    try {
      // NOTE: have to pass props to change auth state like this
      // ref https://github.com/aws-amplify/amplify-js/issues/1529
      // {global: true} NOTE we might need this
      await Keychain.resetGenericPassword();
      handleLogout();
      await Auth.signOut();
      onStateChange('signedOut', null);
    } catch (err) {
      // POST https://cognito-idp.us-east-1.amazonaws.com/ 400
      // Uncaught (in promise) {code: "NotAuthorizedException",
      // name: "NotAuthorizedException", message: "Access Token has been revoked"}
      onStateChange('signedOut', null);
    }
  }

  toggleUsePin() {
    let {usePin} = {...this.state};
    this.setState({usePin: !usePin});
  }

  render() {
    const {usePin} = {...this.state};
    return (
      <View style={{flex: 1}}>
        {!usePin && (
          <View style={{marginRight: 0, paddingLeft: 0}}>
            <Image
              source={AppLoginImg}
              resizeMode='contain'
              placeholderStyle={{backgroundColor: 'rgba(0, 0, 0, 0)'}}
              style={{width: 340, height: 90, marginLeft: 0}}
            />
            <View style={styles.mtFifteen}>
              <TouchableHighlight underlayColor="white">
                <Button
                  raised
                  title={'Unlock'}
                  onPress={this.toggleUsePin}
                  buttonStyle={styles.accountButton}
                  loading={false}
                  disabled={false}
                />
              </TouchableHighlight>
            </View>
            <View style={styles.mtFifteen}>
              <TouchableHighlight underlayColor="white">
                <TouchableHighlight underlayColor="white">
                  <Button
                    raised
                    title={translate('Logout')}
                    onPress={this.logout}
                    buttonStyle={styles.accountButton}
                    loading={false}
                    disabled={false}
                  />
                </TouchableHighlight>
              </TouchableHighlight>
            </View>
          </View>
        )}
        {usePin && (
          <React.Fragment>
            <PINCode
              status={'enter'}
              // handleResultEnterPin={this.toggleUsePin}
              finishProcess={this.logIn}
            />
          </React.Fragment>
        )}
      </View>
    );
  }
}

export default SessionResume;
