import React from 'react';
import {Auth} from 'aws-amplify/lib/index';
import {View, Text, TextInput, TouchableHighlight} from 'react-native';
import {Button} from 'react-native-elements/src/index';
import styles from '../shared.style';
import TAlert from "../materialTable/TAlert";
import ConfirmSignUp from "aws-amplify-react-native/dist/Auth/ConfirmSignUp";


class ConfirmSignUpPage extends ConfirmSignUp {
  constructor(props) {
    super(props);
    this.state = {
      authData: this.props.authData,
      authState: this.props.authState,
      modalShowing: false,
      loading: false,
      confirmationCode: '',
      user: null
    };
    this.onConfirmSignUp = this.onConfirmSignUp.bind(this);
    this.handleConfirmationCodeInputChange = this.handleConfirmationCodeInputChange.bind(this);
    this.onBackToLogIn = this.onBackToLogIn.bind(this);
  }

  async onBackToLogIn() {
    this.changeState('signIn');
    this.setState({username: '', password: '', error: null, confirmationCode: ''});
  }

  async onConfirmSignUp() {
    this.setState({loading: true});
    // console.log('testing button');
    try {
      const {props} = this;
      const username = props.authData;
      const {confirmationCode} = {...this.state};
      const code = confirmationCode;
      if (code.length <= 0) {
        this.setState({
          error: 'Code cannot be empty',
          loading: false
        });
        return;
      }
      Auth.confirmSignUp(username, code)
        .then(() => {
          this.changeState('signIn');
          this.setState({username: '', password: '', error: null, confirmationCode: ''});
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

  handleConfirmationCodeInputChange(confirmationCode) {
    this.setState({confirmationCode, error: null});
  }

  renderSignUpForm() {
    const {props} = this;
    const username = props.authData;
    return (
      <View>
        {!!this.state.error &&
        <TAlert visible={!!this.state.error} alertText={(!!this.state.error ? this.state.error : '')}/>}
        <TextInput style={[styles.input, styles.mtFifteen]}
                   name="username"
                   type="text"
                   autoCapitalize='none'
                   placeholder={username}
                   value={username}
                   disabled
        />
        <TextInput style={[styles.input, styles.mtFifteen]}
                   name="confirmationCode"
                   type="text"
                   placeholder="Code"
                   autoCapitalize='none'
                   value={this.state.confirmationCode}
                   onChangeText={(confirmationCode) => this.handleConfirmationCodeInputChange(confirmationCode)}
        />
        <View style={styles.mtFifteen}>
          <TouchableHighlight underlayColor={'white'}>
            <Button
              raised
              title="Confirm account"
              onPress={this.onConfirmSignUp}
              buttonStyle={styles.accountButton}
            >
            </Button>
          </TouchableHighlight>
        </View>
        <View style={styles.mtFifteen}>
          <TouchableHighlight underlayColor={'white'}>
            <Button
              title="Back to Log In"
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
        {this.renderSignUpForm()}
      </View>
    );
  }

  render() {
    const {authState} = this.props;
    return (
      <React.Fragment>
        {authState == 'confirmSignUp' && this.renderPage()}
      </React.Fragment>
    );
  }
}

ConfirmSignUpPage.defaultProps = {
  authData: {},
  authState: 'confirmSignUp'// ,
  // onAuthStateChange: (next, data) => {
  // console.log(`SignIn:onAuthStateChange(${next}, ${JSON.stringify(data, null, 2)})`);
  // }
};

export default ConfirmSignUpPage;
