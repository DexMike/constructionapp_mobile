import React from 'react';
import {SignIn} from 'aws-amplify-react-native';
import {Auth} from 'aws-amplify';
import {
  Linking,
  View,
  Text,
  TextInput,
  TouchableHighlight,
  Picker,
  Dimensions,
  ScrollView,
  Platform,
  KeyboardAvoidingView, StatusBar
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import moment from 'moment';
import publicIP from 'react-native-public-ip';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Button, Header, Input, ThemeProvider} from 'react-native-elements';
import {Image} from 'react-native';
import * as PropTypes from 'prop-types';
import styles from './shared.style';
import TAlert from './materialTable/TAlert';
import TFormat from "./common/TFormat";
import AppLoginImg from "../img/welcome_to_trelar_login_02.png";
import UserService from "../api/UserService";
import LoginLogService from '../api/LoginLogService';
import AppLogo from "../img/logo.png";
import DeviceInfo from "react-native-device-info";
import UserManagementService from '../api/UserManagementService';
import {translate} from '../i18n';
import CompanyService from '../api/CompanyService';
import OnboardingService from "../api/OnboardingService";
import SignUpPage from "./signUp/SignUpPage";
import SessionResume from './SessionResume';
import * as Keychain from "react-native-keychain";
import {hasUserSetPinCode} from '@haskkor/react-native-pincode';
import ConfigProperties from '../ConfigProperties';

// import ProfileService from '../api/ProfileService';


class LoginPage extends SignIn {
  constructor(props) {
    super(props);
    this.state = {
      hidePassword: true,
      authData: this.props.authData,
      authState: this.props.authState,
      modalShowing: false,
      loading: false,
      error: null,
      environment: 'dev',
      // isTrelar: false,
      username: this.props.authData.username || '',
      password: this.props.authData.password || '',
      user: null,
      userNotConfirmed: false,
      userUnderReview: false,
      userIsCustomer: false,
      // is userIsNotCarrier is false then user is driver
      userIsNotCarrier: false,
      ip: '',
      loadedUser: {},
      goToDriverSignUp: false,
      goToCarrierSignUp: false,
      userStatus: null,
      cognitoId: null,
      email: '',
      // credentials: false,
      // pin: false,
      resumeSession: false
    };
    this.hidePassword = this.hidePassword.bind(this);
    this.onSignIn = this.onSignIn.bind(this);
    this.onResetPassword = this.onResetPassword.bind(this);
    this.onSignUp = this.onSignUp.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.updateEnvironment = this.updateEnvironment.bind(this);
    this.handleUserInputChange = this.handleUserInputChange.bind(this);
    this.handleUserNotConfirmed = this.handleUserNotConfirmed.bind(this);
    this.createLoginLog = this.createLoginLog.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleLoginStatus = this.handleLoginStatus.bind(this);
    this.validateAccountCredentials = this.validateAccountCredentials.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  async componentDidMount() {
    let { resumeSession } = { ...this.state };
    try {
      // Retrieve the credentials
      const credentials = await Keychain.getGenericPassword();
      const pin = await hasUserSetPinCode();
      resumeSession = !!(pin && credentials);
    } catch (error) {
      console.log('Keychain couldn\'t be accessed!', error);
    }
    let ip = '';
    publicIP()
    .then(response => {
      this.setState({ip: response});
    })
    .catch(error => {
      // console.log(error);
    });
    this.setState({ resumeSession });
  }

  hidePassword(e) {
    e.preventDefault();
    const {hidePassword} = this.state;
    this.setState({
      hidePassword: !hidePassword
    });
  }

  // loginRouting() {
  //   window.location = '/'; // go to the equipments listing as the customer needs to create a job.
  // }

  updateEnvironment(environment) {
    this.setState({environment});
    this.props.setAmplify(environment);
  }

  handleUserNotConfirmed() {
    Auth.resendSignUp(this.state.username);
    this.changeState('signUp', 2);
    this.setState({
      username: '',
      password: '',
      error: null,
      // isTrelar: false,
      userNotConfirmed: false
    });
  }

  handleLogout() {
    this.setState({ resumeSession: false })
  }

  renderBlockerPage() {
    const {userIsCustomer} = {...this.state};
    const theme = {
      colors: {
        primary: 'rgb(0, 111, 83)'
      },
      Text: {
        style: {
          fontFamily: 'Interstate-Regular',
          color: 'rgb(102, 102, 102)'
        }
      },
      Button: {
        titleStyle: {
          fontFamily: 'Interstate-Regular'
        },
        buttonStyle: {
          borderColor: 'white',
          borderWidth: 2
        },
        placeholderStyle: {
          fontFamily: 'Interstate-Regular',
        }
      },
      Input: {
        inputStyle: {
          fontFamily: 'Interstate-Regular',
        },
        inputContainerStyle: {
          borderBottomWidth: 0
        },
        containerStyle: {
          backgroundColor: 'white',
          borderColor: 'rgb(203, 203, 203)',
          borderWidth: 2
        }
      },
      CheckBox: {
        fontFamily: 'Interstate-Regular',
        containerStyle: {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        },
        uncheckedColor: 'rgb(0, 111, 83)'
      }
      // Button: {
      //   buttonStyle: {
      //     backgroundColor: 'rgb(0, 111, 83)'
      //   }
      // }
    };

    const marginTop = (DeviceInfo.hasNotch() ? -45 : -35);
    const marginImage = (DeviceInfo.hasNotch() ? 10 : 50);
    const paddingBottom = (DeviceInfo.hasNotch() ? 35 : 35);
    const height = (DeviceInfo.hasNotch() ? 80 : 70);
    const statusBarHeight = Platform.OS === 'ios' ? 0 : StatusBar.currentHeight;

    return (
      <ThemeProvider theme={theme}>
        <StatusBar barStyle='light-content'/>
        <Header
          innerContainerStyles={{flexDirection: 'row'}}
          leftComponent={
            <Image
              source={AppLogo}
              placeholderStyle={{backgroundColor: 'rgba(0, 0, 0, 0)'}}
              style={
                Platform.OS === 'ios' ?
                  {width: 100, height: 25, marginTop: marginImage + statusBarHeight}
                  :
                  {width: 100, height: 25}
              }
            />
          }
          containerStyle={
            Platform.OS === 'ios' ?
              {
                backgroundColor: 'rgb(0, 111, 83)',
                height: height + statusBarHeight,
                paddingBottom: paddingBottom,
                marginTop: marginTop
              }
              :
              {
                backgroundColor: 'rgb(0, 111, 83)',
                height: height,
                marginTop: marginTop
              }
          }
        />
        {/*<Header*/}
        {/*  innerContainerStyles={{flexDirection: 'row'}}*/}
        {/*  leftComponent={*/}
        {/*    <Image*/}
        {/*      source={AppLogo}*/}
        {/*      placeholderStyle={{backgroundColor: 'rgba(0, 0, 0, 0)'}}*/}
        {/*      style={{width: 100, height: 25, paddingTop: 0}}*/}
        {/*    />*/}
        {/*  }*/}
        {/*  containerStyle={{*/}
        {/*    backgroundColor: 'rgb(0, 111, 83)',*/}
        {/*    height: height,*/}
        {/*    paddingBottom: paddingBottom,*/}
        {/*    marginTop: marginTop*/}
        {/*  }}*/}
        {/*/>*/}
        <View style={{padding: 30, backgroundColor: 'rgb(230, 230, 225)', paddingTop: 60, flex: 1}}>

        <View style={{padding: 30}}>
          <Text style={{fontSize: 15, fontFamily: 'Interstate-Regular',
            color: 'rgb(0, 111, 83)'}}>
            {translate(userIsCustomer ? 'USER_IS_CUSTOMER' : 'ACCOUNT_UNDER_REVIEW')}
          </Text>
        </View>
        {/*<View style={{position: 'absolute', bottom: 100}}>*/}
        {/*  <View style={[styles.mtFifteen, styles.loginBottom]}>*/}
        {/*    {TFormat.asLink('https://www.trelar.com/terms-of-service', translate('Terms of Service'))}*/}
        {/*    <Text style={{color: 'rgb(0, 111, 83)'}}> | </Text>*/}
        {/*    {TFormat.asLink('https://www.trelar.com/privacy-policy', translate('Privacy Policy'))}*/}
        {/*  </View>*/}
        {/*</View>*/}
        <View style={{flex: 1, paddingTop: 20, flexDirection: 'row', justifyContent: 'flex-end'}}>
          <Button
            title="Logout"
            iconRight={true}
            onPress={async () => {
              try {
                // NOTE: have to pass props to change auth state like this
                // ref https://github.com/aws-amplify/amplify-js/issues/1529
                const {onStateChange} = this.props;
                // {global: true} NOTE we might need this
                await Auth.signOut();
                onStateChange('signedOut', null);
                this.setState({
                  hidePassword: true,
                  modalShowing: false,
                  loading: false,
                  error: null,
                  environment: 'dev',
                  // isTrelar: false,
                  username: '',
                  password: '',
                  user: null,
                  userNotConfirmed: false,
                  userUnderReview: false,
                  userIsCustomer: false,
                  userIsNotCarrier: false,
                  ip: '',
                  loadedUser: {},
                  goToDriverSignUp: false,
                  goToCarrierSignUp: false,
                  userStatus: null,
                  cognitoId: null,
                  email: ''
                });
              } catch (err) {
                // POST https://cognito-idp.us-east-1.amazonaws.com/ 400
                // Uncaught (in promise) {code: "NotAuthorizedException",
                // name: "NotAuthorizedException", message: "Access Token has been revoked"}
                onStateChange('signedOut', null);
              }
            }
            }
            icon={
              <Icon
                name="arrow-right"
                size={15}
                color="white"
                style={{paddingLeft: 6}}
              />
            }
          />
        </View>
        </View>
      </ThemeProvider>
    );
  }

  async createLoginLog(state) {
    let {width, height} = Dimensions.get('window');
    const log = {
      attemptedUsername: this.state.username,
      attemptedPassword: !state ? this.state.password : null,
      ipAddress: this.state.ip,
      browserType: 'Mobile',
      browserVersion: null,
      screenSize: `${width} x ${height}`,
      createdBy: 1,
      createdOn: moment.utc().format(),
      modifiedBy: 1,
      modifiedOn: moment.utc().format()
    };

    try {
      await LoginLogService.createLoginLog(log);
      if(state) {
        // let's also upgrade the count
        const { loadedUser } = this.state;
        loadedUser.lastLogin = moment.utc().format();
        loadedUser.loginCount += 1;
        await UserService.updateUser(loadedUser);
      }

    } catch (e) {
      // console.log(e);
    }
  }

  async handleLoginStatus(driverFlow, driverEmail) {
    const {password} = this.state;
    let {username} = this.state;
    try {
      const response = await UserManagementService.signIn({ email: driverFlow ? driverEmail : username, password: password });
        if(response.success) {
          let user = {};
          if(username.indexOf('@') > -1) {
            const userCheck = {email: username};
            user = await UserService.getUserByEmail(userCheck);
          } else {
            const phone_number = `+1${username.replace(/\D/g, '')}`;
            try {
              user = await UserService.getUserByMobile(phone_number);
            } catch (err) {
              console.error(err);
            }
          }
          // save the user
          this.setState({
            loadedUser: user
          });

          const allowedLogin = ["First Login", "Enabled", "Driver Enabled", "COI Pending"];

          if (user.id && !allowedLogin.includes(user.userStatus)) {
            // this.createLoginLog(true);
            this.setState({userUnderReview: true});
            return;
            // user is under review
          }
          if (user.id && user.userStatus === "Driver Enabled") {
            const driver = await UserService.getDriverByUserId(user.id);
            if (driver.id === null || driver.driverStatus !== "Enabled") {
              // this.createLoginLog(true);
              this.setState({userUnderReview: true});
              return;
            }
          }
          const response = await CompanyService.getCompanyTypeByUserId(user.id);
          if (response.type === "Customer") {
            // this.createLoginLog(true);
            this.setState({
              userIsNotCarrier: true,
              error: '',
              loading: false
            });
            return;
          }
          if (response.type === "") {
            // this.createLoginLog(true);
            this.setState({
              userIsNotCarrier: false,
              error: translate('Incorrect username or password'),
              loading: false
            });
            return;
          }
          if(user.cognitoId !== null) {
            username = user.cognitoId;
          }
          const data = await Auth.signIn(username, password);
          // Store the credentials
          await Keychain.setGenericPassword(username, password);
          // console.log(`onSignIn::Response#1: ${JSON.stringify(data, null, 2)}`);
          // If the user session is not null, then we are authenticated
          if (data.signInUserSession !== null) {
            if (this.props.onStateChange) {
              this.props.onStateChange('authenticated', data);
              // this.createLoginLog(true);
              // set user profile info to local storage
              // const profile = await ProfileService.getProfile();
              // const profileData = {
              //   userId: profile.userId,
              //   companyId: profile.companyId,
              //   username: this.state.username
              // }
              // const saveUserId = async profileData => {
              //   try {
              //     await AsyncStorage.setItem('profile', profileData);
              //   } catch (error) {
              //     // Error retrieving data
              //     console.log(error.message);
              //   }
              // };
              // console.log(profileData);
            }
            // window.location = '/';
            // this.loginRouting();
            // return;
          }
          // If there is a challenge, then show the modal
          if ('challengeName' in data) {
            // console.log(`onSignIn: Expecting challenge to be received via ${data.challengeType}`);
            this.setState({
              user: data,
              loading: false,
              modalShowing: true
            });
          }
          // return;
        } else {
          // this.createLoginLog(true);
          this.setState({
            error: translate('Incorrect username or password'),
            loading: false
          });
        }
    } catch (e) {
      // this.createLoginLog(true);
      this.setState({
        error: translate('Incorrect username or password'),
        loading: false
      });
    }
  }

  async validateAccountCredentials(email) {
    const {password} = this.state;
    const response = await UserManagementService.signIn({email, password: password});
    return response.success;
  }

  async handleLogin(phoneOrEmail, driverFlow, carrierFlow) {
    const {username} = this.state;
    let userStatusRequest;
    if (driverFlow) {
      userStatusRequest = {phone: phoneOrEmail, driverFlow: true};
    } else if (carrierFlow) {
      userStatusRequest = {email: phoneOrEmail, driverFlow: false};
    } else {
      return;
    }
    const userResponse = await OnboardingService.checkOnBoardingStatus(userStatusRequest);
    const driverCognitoId = userResponse.cognitoId;
    switch (userResponse.status) {
      case "IS_CUSTOMER":
        // this.createLoginLog(true);
        this.setState({
          userIsCustomer: true,
          loading: false
        });

        break;
      case "DRIVER_INVITED":
        // this.createLoginLog(true);
        this.setState({
          error: translate('Incorrect username or password'),
          loading: false
        });

        break;
      case "COGNITO_ACCOUNT_CREATED":
        // send sms verification (in driver sign up component) and bring to that screen
        this.setState({
          goToDriverSignUp: driverFlow,
          goToCarrierSignUp: carrierFlow,
          userStatus: userResponse.status,
          cognitoId: userResponse.cognitoId,
          email: carrierFlow ? username : userResponse.email
        });
        this.props.onStateChange('signUp', null);
        this.setState({
          loading: false
        });
        // navigate to SMS verification

        break;
      case "COGNITO_ACCOUNT_VERIFIED":
        // navigate to post onboarding

        try {
          const validLogin = await this.validateAccountCredentials(userResponse.cognitoId);
          if (validLogin) {
            // send sms verification and bring to that screen
            this.setState({
              goToDriverSignUp: driverFlow,
              goToCarrierSignUp: carrierFlow,
              userStatus: userResponse.status,
              cognitoId: userResponse.cognitoId,
              email: carrierFlow ? username : userResponse.email
            });
            this.props.onStateChange('signUp', null);
            this.setState({
              loading: false
            });

          } else {
            // this.createLoginLog(true);
            this.setState({
              error: translate('Incorrect username or password'),
              loading: false
            });
          }
        } catch (e) {
          // this.createLoginLog(true);
          this.setState({
            error: translate('Incorrect username or password'),
            loading: false
          });
        }
        // navigate to SMS verification

        break;
      case "FINISHED":
        await this.handleLoginStatus(driverFlow, driverCognitoId);
        this.setState({
          loading: false
        });

        break;
      default:
        // this.createLoginLog(true);
        this.setState({
          error: translate('Incorrect username or password'),
          loading: false
        });
    }
  }

  async onSignIn() {
    const {
      password
      // , isTrelar
    } = this.state;
    let {
      username
      // , environment
    } = this.state;
    this.setState({loading: true});
    // const isTrelarEmail = username.split('@')[1] === 'trelar.net' || username.split('@')[1] === 'trelar.com';
    // if(!isTrelarEmail && username.indexOf('@') > -1) {
    //   // just log in as production.
    //   // console.log('Just logging into production.');
    //   if (!isTrelar) {
    //     // previously verified with trelar email against prod and now signing in into a lower environment with a non-trelar email
    //     environment = 'prod';
    //     this.setState({environment});
    //     this.updateEnvironment(environment);
    //   }
    // }
    // if(isTrelarEmail && !isTrelar) { // let the user be able to switch to a different environment.
    //   // console.log('Letting the user pick their env.');
    //   // check against production orion API call
    //   environment = 'prod';
    //   this.setState({environment});
    //   this.updateEnvironment(environment);
    //   try {
    //     const response = await UserManagementService.signIn({ email: username, password: password });
    //     if(response.success) {
    //       this.setState({isTrelar: true, loading: false});
    //       return; // they'll click 'log in' again to determine the env they want since they own a Trelar account.
    //     } else {
    //       // this.createLoginLog(true);
    //       this.setState({
    //         error: translate('Incorrect username or password'),
    //         loading: false
    //       });
    //     }
    //   } catch (e) {
    //     // this.createLoginLog(true);
    //     this.setState({
    //       error: translate('Incorrect username or password'),
    //       loading: false
    //     });
    //   }
    //   // console.log(response);
    //
    //   // if(response.message && response.message === 'Access Denied') {
    //   //   // console.log('403 so letting them select env.');
    //   //   // note: will get 403 for this call until the orion code gets pushed through all the environments.
    //   //   this.setState({isTrelar: true, loading: false});
    //   //   return; // they'll click 'log in' again to determine the env they want since they own a Trelar account.
    //   // }
    // }
    // // only do this if Trelar email default to dev otherwise default to production.
    // if(isTrelar) {
    //   // console.log('Logging in using the environment the user has picked.');
    //   this.updateEnvironment(environment);
    // }
    try {
      if (!username || username.length <= 0
        || !password || password.length <= 0) {
        this.createLoginLog(false);
        this.setState({
          error: translate('Username and password required'),
          loading: false
        });
        return;
      }

  ///////


      if(username.indexOf('@') > -1) {
        // login in with email
        let userStatusRequest = {email: username};
        let userStatusResponse = await OnboardingService.checkOnBoardingStatus(userStatusRequest);
        // a driver here could still technically enter email address - how do we handle that?
        // for now we assume that drivers have a "refBy" in their email and we stop them from logging in
        if (username.includes("refBy")) {
          // it's a driver login
          // for now, we will say that login is incorrect is driver tries to login with email
          // this.createLoginLog(true);
          this.setState({
            error: translate('Incorrect username or password'),
            loading: false
          });

          return;
        }

        if (userStatusResponse.status === "NOT_STARTED") {
            // it's not driver record nor carrier record
            // this.createLoginLog(true);
            this.setState({
              error: translate('Incorrect username or password'),
              loading: false
            });

            return;
        }

        await this.handleLogin(username, false, true);






        // driverFlow = false;
        // const userCheck = {email: username};
        // user = await UserService.getUserByEmail(userCheck);
      } else {
        // HAVE TO ACCOUNT FOR IF CARRIER TYPES IN PHONE NUMBER - CHECK EMAIL FOR 'REFERREDBY' FOR NOW

        const phone_number = `+1${username.replace(/\D/g, '')}`;

        let response = null;
        try {
          response = await UserManagementService.signIn({ email: phone_number, password: password });
        } catch (err) {
          console.log(err);
        }

        if ((!response || !response.success) && (!response && (response.message != "User not confirmed"))) {
          // not a valid cognito account
          this.setState({
            error: translate('Incorrect username or password'),
            loading: false
          });

          return;
        }
        let userStatusRequest = {phone: phone_number};
        let userStatusResponse = await OnboardingService.checkOnBoardingStatus(userStatusRequest, response.accessToken, response.idToken);
        if (userStatusResponse.status === "NOT_STARTED") {
          userStatusRequest = {phone: phone_number, driverFlow: true};
          userStatusResponse = await OnboardingService.checkOnBoardingStatus(userStatusRequest);
          if (userStatusResponse.status === "NOT_STARTED") {
            // it's not driver record nor carrier record
            // this.createLoginLog(true);
            this.setState({
              error: translate('Incorrect username or password'),
              loading: false
            });

            return;
          }
          // no account ?
        }

        // phone number has an account
        if (userStatusResponse.email.includes("refBy")) {
          // it's a driver sign up
          await this.handleLogin(phone_number, true, false);
        } else {
          // it's a carrier sign up
          // for now, we will say that login is incorrect is carrier tries to login with phone number
          // this.createLoginLog(true);
          this.setState({
            error: translate('Incorrect username or password'),
            loading: false
          });

          return;
        }
      }
      // check if field is email or phone number


      // Anything else and there is a problem

      // TODO-> Verify why the next line is there, it stops execution
      // throw new Error('Invalid response from servers');
    } catch (err) {
      // console.log(`Error: ${JSON.stringify(err, null, 2)}`);
      this.createLoginLog(false);
      console.log(err);
      this.setState({
        error: translate('Incorrect username or password'),
        loading: false,
        userNotConfirmed: err.code === 'UserNotConfirmedException',
      });
    }
  }

  async onConfirmSignin(token) {
    this.setState({loading: true});

    try {
      await Auth.confirmSignIn(this.state.user, token);
      // console.log(`onConfirmSignIn::Response#2: ${JSON.stringify(data, null, 2)}`);
      const profile = await Auth.currentUser();
      this.props.onStateChange('authenticated', profile);
    } catch (err) {
      // console.log('Error: ', err);
      this.setState({
        error: err.message,
        loading: false,
        modalShowing: false
      });
    }
  }

  handleUserInputChange(username) {
    this.setState({username, error: null, userNotConfirmed: false});
  }

  onResetPassword() {
    this.setState({
      username: '',
      password: '',
      error: null,
      // isTrelar: false,
      userNotConfirmed: false
    });
    this.props.onStateChange('forgotPassword');
  }

  onSignUp() {
    this.setState({
      username: '',
      password: '',
      error: null,
      // isTrelar: false,
      userNotConfirmed: false
    });
    this.props.onStateChange('signUp', 1);
  }

  handleInputChange(e) {
    let {value} = e.target;
    if (e.target.name === 'rememberMe') {
      value = e.target.checked ? Number(1) : Number(0);
    }
    this.setState({[e.target.name]: value});
  }

  onDismiss() {
    this.setState({error: null});
  }

  renderLogInForm() {
    const {loading, hidePassword, userNotConfirmed, userIsNotCarrier} = this.state;
    return (
      <View style={{flex: 1}}>
        <KeyboardAvoidingView style={styles.accountInputs} behavior={Platform.OS === "ios" ? "padding" : null}>
          <KeyboardAwareScrollView
            onContentSizeChange={this.onContentSizeChange}
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            enableOnAndroid
          >
            <View style={{marginRight: 0, paddingLeft: 0}}>
              <Image
                source={AppLoginImg}
                resizeMode='contain'
                placeholderStyle={{backgroundColor: 'rgba(0, 0, 0, 0)'}}
                style={{width: 340, height: 90, marginLeft: 0}}
              />
            </View>
            {!!this.state.error
            && <Text style={styles.alertText}>{this.state.error}</Text>}
            {userNotConfirmed && (
              <View style={styles.mtFifteen}>
                <TouchableHighlight fontColor="white">
                  <Button
                    small
                    title={translate("Confirm New Account")}
                    onPress={this.handleUserNotConfirmed}
                    type="clear"
                    titleStyle={{color: 'rgb(0, 111, 83)', fontSize: 15}}
                  />
                </TouchableHighlight>
              </View>
            )}
            {
              userIsNotCarrier ? (
                <View>
                  <Text style={{textAlign: 'center'}}>
                    {translate('PRODUCER_NOT_SUPPORTED')}
                  </Text>
                  <Text
                    style={{color: 'rgb(0, 111, 83)', textDecorationLine: 'underline', textAlign: 'center'}}
                    onPress={() => Linking.openURL('https://app.mytrelar.com')}>
                    &nbsp;app.mytrelar.com&nbsp;
                  </Text>
                </View>
              ) : null
            }

            <Input
              containerStyle={{paddingLeft: 0, paddingRight: 0}}
              inputContainerStyle={[styles.inputContainerLogin, styles.mtFifteen]}
              inputStyle={styles.inputLogin}
              name="username"
              type="text"
              placeholder={translate('Email or Mobile Phone')}
              value={this.state.username}
              autoCapitalize="none"
              onChangeText={(username) => {
                this.handleUserInputChange(username);
              }}
              shake
              leftIcon={(<Icon style={styles.inputLoginIcon} name="account-outline" size={24}/>)}
              leftIconContainerStyle={styles.inputLoginIconContainer}
            />

            <Input
              containerStyle={{paddingLeft: 0, paddingRight: 0}}
              inputContainerStyle={[styles.inputContainerLogin, styles.mtFifteen]}
              inputStyle={styles.inputLogin}
              name="password"
              type={hidePassword ? 'password' : 'text'}
              autoCapitalize="none"
              secureTextEntry={hidePassword}
              placeholder={translate('Password')}
              value={this.state.password}
              onChangeText={password => this.setState(
                {password, error: null, userNotConfirmed: false}
              )}
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

            {/*<Icon*/}
            {/*  name='eye-slash'*/}
            {/*  type='font-awesome'*/}
            {/*  reverse={true}*/}
            {/*  color='#ffffff'*/}
            {/*  onPress={e => this.hidePassword(e)}*/}
            {/*  reverseColor="black"*/}
            {/*/>*/}

            {/*<Link>*/}
            {/*  <Text  className={`form__form-group-button${hidePassword ? ' active' : ''}`}>*/}
            {/*    Show Password*/}
            {/*  </Text>*/}
            {/*</Link>*/}

            <View style={styles.mtFifteen}>
              <TouchableHighlight fontColor="white">
                <Button
                  title={translate("Forgot your password")}
                  onPress={this.onResetPassword}
                  type="clear"
                />
              </TouchableHighlight>
            </View>

            <View style={styles.accountButtons}>
              <View style={styles.mtFifteen}>
                <TouchableHighlight underlayColor="white">
                  <Button
                    raised
                    title={translate("Sign In")}
                    onPress={this.onSignIn}
                    buttonStyle={styles.accountButton}
                    loading={loading}
                    disabled={loading}
                  />
                </TouchableHighlight>
              </View>

              <View style={styles.mtFifteen}>
                <TouchableHighlight underlayColor="white">
                  <Button
                    raised
                    title={translate("Create Account")}
                    onPress={this.onSignUp}
                    buttonStyle={styles.accountButton}
                  />
                </TouchableHighlight>
              </View>

              <View>
                {/*{this.state.isTrelar && (*/}
                {/*  <Picker selectedValue={this.state.environment} onValueChange={this.updateEnvironment}>*/}
                {/*    <Picker.Item label="Prod environment" value="prod"/>*/}
                {/*    <Picker.Item label="Demo environment" value="demo"/>*/}
                {/*    <Picker.Item label="Staging environment" value="staging"/>*/}
                {/*    <Picker.Item label="QA environment" value="qa"/>*/}
                {/*    <Picker.Item label="Dev environment" value="dev"/>*/}
                {/*    <Picker.Item label="CAT environment" value="cat"/>*/}
                {/*  </Picker>*/}
                {/*)*/}
                {/*}*/}
                <Text style={styles.text}>{this.state.user}</Text>
              </View>

              {/*<View style={styles.inlineRowStart}>*/}
              {/*  <CheckBox*/}
              {/*    name="remember_me"*/}
              {/*    title="Remember me"*/}
              {/*    checkedIcon="check-square-o"*/}
              {/*    uncheckedIcon="square-o"*/}
              {/*    checked={this.state.checked}*/}
              {/*  />*/}
              {/*  <Text>Remember Me</Text>*/}
              {/*</View>*/}
            </View>

            <View>
              <View style={[styles.mtFifteen, styles.loginBottom]}>
                {TFormat.asLink('https://www.trelar.com/terms-of-service', translate('Terms of Service'))}
                <Text style={{color: 'rgb(0, 111, 83)'}}> | </Text>
                {TFormat.asLink('https://www.trelar.com/privacy-policy', translate('Privacy Policy'))}
              </View>
            </View>
          </KeyboardAwareScrollView>
        </KeyboardAvoidingView>
      </View>

    );
  }

  renderPage() {
    const { resumeSession } = { ...this.state };
    const { onStateChange } = { ...this.props };
    // debugger;
    return (
      <View style={styles.mainPad}>
        {/*<View style={styles.accountHead}>*/}

        {/*  <Text style={styles.account}>*/}

        {/*    Welcome to&nbsp;*/}
        {/*    <Text style={styles.accountLogo}>*/}
        {/*      TRE*/}
        {/*      <Text style={styles.accountLogoAccent}>*/}
        {/*        LAR*/}
        {/*      </Text>*/}
        {/*    </Text>*/}
        {/*  </Text>*/}

        {/*  <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>*/}
        {/*    <Text style={styles.accountMotto}>Changing How Construction Moves</Text>*/}
        {/*    <Text style={{fontSize: 8, lineHeight: 18}}>TM</Text>*/}
        {/*  </View>*/}
        {/*</View>*/}
        {resumeSession && <SessionResume onStateChange={onStateChange} handleLogout={this.handleLogout} />}
        {!resumeSession && this.renderLogInForm()}
        <Text style={{alignSelf: 'flex-end', color: '#333'}}>
          {ConfigProperties.instance.getEnv().APP_ENV !== 'Prod' ? `${ConfigProperties.instance.getEnv().APP_ENV} ` : ''}
          v{DeviceInfo.getVersion()}
        </Text>
      </View>
    );
  }

  render() {
    const {authState} = {...this.props};
    const {userUnderReview, userIsCustomer, goToDriverSignUp, goToCarrierSignUp, userStatus, cognitoId, password, username, email} = this.state;

    const theme = {};

    return (
      <ThemeProvider theme={theme}>
        {(userUnderReview || userIsCustomer) && this.renderBlockerPage()}
        {(authState === 'signIn' && !userUnderReview && !userIsCustomer) && this.renderPage()}
        <SignUpPage
          onStateChange={this.props.onStateChange}
          authState={authState}
          mobilePhoneNumber={username}
          goToDriverSignUp={goToDriverSignUp}
          goToCarrierSignUp={goToCarrierSignUp}
          userStatus={userStatus}
          cognitoId={cognitoId}
          password={password}
          responseEmail={email}
        />
      </ThemeProvider>
    );
  }
}

LoginPage.propTypes = {
  setAmplify: PropTypes.func.isRequired
};

LoginPage.defaultProps = {
  authData: {},
  authState: 'signIn'// ,
  // onAuthStateChange: (next, data) => {
  // console.log(`SignIn:onAuthStateChange(${next}, ${JSON.stringify(data, null, 2)})`);
  // }
};

export default LoginPage;
