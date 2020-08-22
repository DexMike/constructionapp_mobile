import React from 'react';
import {Auth, Logger} from 'aws-amplify/lib/index';
import {View, Text, TextInput, TouchableHighlight} from 'react-native';
import {Button, Input} from 'react-native-elements/src/index';
import styles from '../shared.style';
import TAlert from "../materialTable/TAlert";
import ForgotPassword from "aws-amplify-react-native/dist/Auth/ForgotPassword";
import {translate} from '../../i18n';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import OnboardingService from "../../api/OnboardingService";
import UserManagementService from "../../api/UserManagementService";

const logger = new Logger('ForgotPassword');

class ForgotPasswordPage extends ForgotPassword {
  constructor(props) {
    super(props);
    this.state = {
      hidePassword: true,
      authData: this.props.authData,
      authState: this.props.authState,
      modalShowing: false,
      loading: false,
      username: '',
      password: '',
      code: '',
      user: null,
      delivery: null
    };
    this.hidePassword = this.hidePassword.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onConfirmSubmit = this.onConfirmSubmit.bind(this);
    this.onBackToLogIn = this.onBackToLogIn.bind(this);
  }

  async onBackToLogIn() {
    this.changeState('signIn');
    this.setState({
      authData: this.props.authData,
      authState: this.props.authState,
      modalShowing: false,
      hidePassword: true,
      loading: false,
      username: '',
      error: null,
      password: '',
      code: '',
      user: null,
      delivery: null
    });
  }

  hidePassword(e) {
    e.preventDefault();
    const {hidePassword} = this.state;
    this.setState({
      hidePassword: !hidePassword
    });
  }

  async onSubmit() {
    this.setState({loading: true});
    const {username} = this.state;
    try {
      if (username.length <= 0) {
        this.setState({
          error: translate('Username cannot be empty'),
          loading: false
        });
        return;
      }
      let userStatusResponse;
      try {
        if(username.indexOf('@') > -1) {
        // login in with email
        let userStatusRequest = {email: username};
        userStatusResponse = await OnboardingService.checkOnBoardingStatus(userStatusRequest);
      } else {
          const phone_number = `+1${username.replace(/\D/g, '')}`;
          let userStatusRequest = {phone: phone_number};
          userStatusResponse = await OnboardingService.checkOnBoardingStatus(userStatusRequest);
        }
      } catch (err) {
        console.log(err);
        this.setState({
          error: 'Account not found.',
          loading: false
        });
        return;
      }
      if (!userStatusResponse || !userStatusResponse.cognitoId) {
        this.setState({
          error: 'Account not found.',
          loading: false
        });
        return;
      }
      Auth.forgotPassword(userStatusResponse.cognitoId)
        .then(data => {
          logger.debug(data);
          this.setState({ delivery: data.CodeDeliveryDetails, username: userStatusResponse.cognitoId });
        })
        .catch(err => this.setState({
          error: err.message,
          loading: false
        }));
    } catch (err) {
      console.log('Error: ', err);
      this.setState({
        error: err.message,
        loading: false
      });
    }
  }

  async onConfirmSubmit() {
    this.setState({loading: true});
    //
    const { username, code, password } = {...this.state};

    try {
      if (code.length <= 0) {
        this.setState({
          error: translate('Code cannot be empty'),
          loading: false
        });
        return;
      }
      Auth.forgotPasswordSubmit(username, code, password)
        .then(() => {
          this.changeState('signIn');
          this.setState({
            hidePassword: true,
            authData: this.props.authData,
            authState: this.props.authState,
            modalShowing: false,
            loading: false,
            username: '',
            error: null,
            password: '',
            code: '',
            user: null,
            delivery: null
          });
        })
        .catch(err => this.setState({
          error: err.message,
          loading: false
        }));
    } catch (err) {
      console.log('Error: ', err);
      this.setState({
        error: err.message,
        loading: false
      });
    }
  }

  renderSubmitBody() {
    const {hidePassword} = this.state;
    return (
      <View>
        {!!this.state.error && <TAlert visible={!!this.state.error} alertText={(!!this.state.error ? this.state.error : '')}/>}
        <TextInput style={[styles.input, styles.mtFifteen]}
                   name="code"
                   type="text"
                   placeholder={translate("Enter your confirmation code")}
                   autoCapitalize='none'
                   value={this.state.code}
                   onChangeText={(code) => this.setState({code, error: null})}
        />
        <Input
          containerStyle={{paddingLeft: 0, paddingRight: 0}}
          inputContainerStyle={[styles.inputContainerChangePassword, styles.mtFifteen]}
          inputStyle={styles.inputLogin}
          name="password"
          type={hidePassword ? 'password' : 'text'}
          autoCapitalize="none"
          secureTextEntry={hidePassword}
          placeholder={translate('Enter your new password')}
          value={this.state.password}
          onChangeText={(password) => this.setState({password, error: null})}
          leftIcon={(<Icon style={styles.inputLoginIcon} name="key-variant" size={24}/>)}
          leftIconContainerStyle={styles.inputLoginIconContainer}
          rightIcon={(
            <Icon
              style={hidePassword ? styles.eyeLogin : styles.eyeLoginActive}
              name="eye"
              size={24}
              onPress={e => this.hidePassword(e)}
            />
          )}
          rightIconContainerStyle={
            hidePassword ? styles.eyeLoginContainer : styles.eyeLoginContainerActive
          }
        />


        <View style={styles.mtFifteen}>
          <TouchableHighlight underlayColor={'white'}>
            <Button
              raised
              title="Submit"
              onPress={this.onConfirmSubmit}
              buttonStyle={styles.accountButton}
            />
          </TouchableHighlight>
        </View>
        <View style={styles.mtFifteen}>
          <TouchableHighlight underlayColor={'white'}>
            <Button
              title={translate("Back to Log In")}
              onPress={this.onBackToLogIn}
              buttonStyle={styles.accountButton}
            />
          </TouchableHighlight>
        </View>
      </View>
    );
  }


  renderForgotPasswordForm() {
    return (
      <View>
        {!!this.state.error && <TAlert visible={!!this.state.error} alertText={(!!this.state.error ? this.state.error : '')}/>}
        <TextInput style={[styles.input, styles.mtFifteen]}
                   name="username"
                   type="text"
                   placeholder={translate("Email")}
                   autoCapitalize='none'
                   value={this.state.username}
                   onChangeText={(username) => this.setState({username: username.toLowerCase(), error: null})}
        />
        <View style={styles.mtFifteen}>
          <TouchableHighlight underlayColor={'white'}>
            <Button
              raised
              title={translate("Send code")}
              onPress={this.onSubmit}
              buttonStyle={styles.accountButton}
            />
          </TouchableHighlight>
        </View>
        <View style={styles.mtFifteen}>
          <TouchableHighlight underlayColor={'white'}>
            <Button
              title={translate("Back to Log In")}
              onPress={this.onBackToLogIn}
              buttonStyle={styles.accountButton}
            />
          </TouchableHighlight>
        </View>
      </View>
    );
  }

  renderPage() {
    return (
      <View style={styles.mainPad}>
        <View style={styles.accountHead}>
          <Text style={styles.account}>
            Welcome to&nbsp;
            <Text style={styles.accountLogo}>
              TRE
              <Text style={styles.accountLogoAccent}>
                LAR
              </Text>
            </Text>
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
            <Text style={styles.accountMotto}>Changing How Construction Moves</Text>
            <Text style={{fontSize: 8, lineHeight: 18}}>TM</Text>
          </View>
        </View>
        {!this.state.delivery && this.renderForgotPasswordForm()}
        {this.state.delivery && this.renderSubmitBody()}
      </View>
    );
  }

  render() {
    return (
      <React.Fragment>
        {this.props.authState === 'forgotPassword' && this.renderPage()}
      </React.Fragment>
    );
  }
}

ForgotPasswordPage.defaultProps = {
  authData: {},
  authState: 'forgotPassword'// ,
  // onAuthStateChange: (next, data) => {
  // console.log(`SignIn:onAuthStateChange(${next}, ${JSON.stringify(data, null, 2)})`);
  // }
};

export default ForgotPasswordPage;
