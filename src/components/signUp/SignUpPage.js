import React from 'react';
import {View, Platform, StatusBar, TouchableOpacity} from 'react-native';
import {Button, Header, Text, ThemeProvider, Image} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import SignUp from "aws-amplify-react-native/dist/Auth/SignUp";
import AppLogo from "../../img/logo.png";
import DeviceInfo from 'react-native-device-info';
import {translate} from '../../i18n';
import DriverSignUp from "./DriverSignUp";
import CarrierSignUp from "./CarrierSignUp";
import RF from "react-native-responsive-fontsize";
import * as PropTypes from "prop-types";
import TMapLive from "../common/TMapLive";

class SignUpPage extends SignUp {
  constructor(props) {
    super(props);
    this.state = {
      authData: this.props.authData,
      step: 1,
      authState: this.props.authState,
      modalShowing: false,
      loading: false,
      error: null,
      errorEmail: null,
      email: this.props.authData.email || '',
      password: this.props.authData.password || '',
      // userType: 'Select',
      mobilePhoneNumber: '',
      companyName: '',
      streetAddress1: '',
      streetAddress2: '',
      city: '',
      state: '',
      zip: '',
      isCompanyOwner: '',
      isCompanyDriver: '',
      isCompanyDispatcher: '',
      dotNumber: '',
      company: null,
      user: null,
      termsChecked: false,
      startUpload: false,
      hidePassword: true,
      driverSignUp: false,
      showDriverFields: false,
      driverUser: null,
      signUpType: '',
      cognitoId: '',
      signUpStatus: '',
      goToDriverSignUp: false,
      responseEmail: ''
    };
    this.onBackToSignUpChoice = this.onBackToSignUpChoice.bind(this);
    this.onBackToLogin = this.onBackToLogin.bind(this);
  }

  async componentDidMount() {
    const {props} = this;
    const step = props.authData;
    this.setState({
      showDriverFields: false
    });
  }

  componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any): void {
    const {goToDriverSignUp, goToCarrierSignUp, userStatus, cognitoId, password, mobilePhoneNumber, responseEmail} = this.props;
    if (goToDriverSignUp) {
      this.setState({goToDriverSignUp, signUpType: "Driver", signUpStatus: userStatus, cognitoId, password, mobilePhoneNumber, responseEmail});
    } else if (goToCarrierSignUp) {
      this.setState({goToCarrierSignUp, signUpType: "Carrier", signUpStatus: userStatus, cognitoId, password, mobilePhoneNumber, responseEmail});
    }
  }

  async onBackToSignUpChoice() {
    // this.changeState('signIn');
    this.setState({
      email: '',
      password: '',
      // userType: 'Select',
      mobilePhoneNumber: '',
      companyName: '',
      streetAddress1: '',
      streetAddress2: '',
      city: '',
      state: '',
      zip: '',
      step: 1,
      user: null,
      isCompanyOwner: '',
      isCompanyDriver: '',
      isCompanyDispatcher: '',
      dotNumber: '',
      termsChecked: false,
      company: null,
      error: null,
      errorEmail: null,
      startUpload: false,
      hidePassword: true,
      signUpType: '',
      driverUser: null
    });
  }

  onBackToLogin() {
    this.onBackToSignUpChoice();
    this.props.onStateChange('signIn');
  }

  // async updateCertificates() {
  //   const {companyName, streetAddress1, streetAddress2, city, state, zip, company, user} = {...this.state};
  // }

  renderUserTypeChoice() {
    const {hidePassword, error, showDriverFields} = this.state;
    let passwordError = false;

    if (error && error.includes("Value at 'password'")) {
      passwordError = true;
    }
    return (
      <React.Fragment>
        {/* Note: not needed as is redundant to the description in the cards */}
        {/*<View style={{*/}
        {/*  color: 'rgb(112,112,112)',*/}
        {/*  fontSize: RF(3.5),*/}
        {/*  marginTop: 15,*/}
        {/*  marginBottom: 15,*/}
        {/*  paddingLeft: 15*/}
        {/*}}>*/}
          {/*<Text style={{fontSize: 20}}>{translate('I am a')}... </Text>*/}
        {/*</View>*/}
        <View
          style={{
            flexDirection: 'column',
            backgroundColor: '#FFF',
            marginTop: 5,
            marginBottom: 12
          }}>

          <TouchableOpacity onPress={() =>
            this.setState({signUpType: 'Carrier'})

          }
          >
            <View
              style={{
                flexDirection: 'row',
                padding: 16,
                alignItems: 'center'
              }}
            >
              <View style={{flex: 0.95}}>
                <Text>
                  <Text
                    style={{fontWeight: "normal", fontFamily: 'Interstate', fontSize: 18, color: 'rgb(0, 111, 83)'}}>
                    {translate("Carrier (Owner/Operator)")}
                  </Text>
                  {"\n"}
                  <Text style={{fontWeight: '100', fontFamily: 'Interstate', fontSize: 14, color: '#666666'}}>
                    {translate("CarrierDescription")}
                  </Text>
                </Text>
              </View>
              <View style={{flex: 0.05}}>
                <Icon
                  name="chevron-right"
                  size={16}
                  color='rgb(0, 111, 83)'
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: 'column',
            backgroundColor: '#FFF'
          }}>

          <TouchableOpacity onPress={() =>
            this.setState({signUpType: 'Driver'})

          }
          >
            <View
              style={{
                flexDirection: 'row',
                padding: 16,
                alignItems: 'center'
              }}
            >
              <View style={{flex: 0.95}}>
                <Text>
                  <Text
                    style={{fontWeight: "normal", fontFamily: 'Interstate', fontSize: 18, color: 'rgb(0, 111, 83)'}}>
                    {translate("Truck Driver")}
                  </Text>
                  {"\n"}
                  <Text style={{fontWeight: '100', fontFamily: 'Interstate', fontSize: 14, color: '#666666'}}>
                    {translate("TruckDriverDescription")}
                  </Text>
                </Text>
              </View>
              <View style={{flex: 0.05}}>
                <Icon
                  name="chevron-right"
                  size={16}
                  color='rgb(0, 111, 83)'
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </React.Fragment>
    );
  }

  renderPage() {
    const {signUpType, cognitoId, signUpStatus, goToDriverSignUp, goToCarrierSignUp, password, mobilePhoneNumber, responseEmail} = this.state;
    const marginTop = (DeviceInfo.hasNotch() ? -50 : -35);
    const marginImage = (DeviceInfo.hasNotch() ? 0 : 50);
    const paddingBottom = (DeviceInfo.hasNotch() ? 35 : 35);
    const height = (DeviceInfo.hasNotch() ? 70 : 70);
    const statusBarHeight = Platform.OS === 'ios' ? 0 : StatusBar.currentHeight;
    return (
      <React.Fragment>
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
        {signUpType === '' &&
        <View style={{
          flex: 1,
          backgroundColor: '#E7E7E2',
          width: '100%'
        }}>
          <View
            style={{
              padding: 16
            }}
          >
            {this.renderUserTypeChoice()}
          </View>
        </View>
        }
        <View
          style={{
            zIndex: -1,
            flex: 1,
            backgroundColor: 'rgb(230, 230, 225)',
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 0
          }}
        >
          {signUpType === 'Driver' && (
            <DriverSignUp
              onStateChange={this.props.onStateChange}
              onBackToLogin={this.onBackToSignUpChoice}
              onBackToLoginMain={this.onBackToLogin}
              cognitoId={cognitoId}
              signUpStatus={signUpStatus}
              goToDriverSignUp={goToDriverSignUp}
              password={password}
              mobilePhoneNumber={mobilePhoneNumber}
              responseEmail={responseEmail}
            />

          )}
          {signUpType === 'Carrier' && (
            <CarrierSignUp
              onStateChange={this.props.onStateChange}
              onBackToLogin={this.onBackToSignUpChoice}
              onBackToLoginMain={this.onBackToLogin}
              cognitoId={cognitoId}
              signUpStatus={signUpStatus}
              goToCarrierSignUp={goToCarrierSignUp}
              password={password}
              email={mobilePhoneNumber}
              responseEmail={responseEmail}
            />
          )}
          {/*footer buttons*/}

        </View>
        {signUpType === '' &&
        <View style={{paddingBottom: 40}}>
          <View>

            <Button
              title='Back'
              type='outline'
              onPress={this.onBackToLogin}
              buttonStyle={{backgroundColor: 'white', borderColor: 'rgb(0, 111, 83)'}}
              icon={
                <Icon
                  name="arrow-left"
                  size={15}
                  color='rgb(0, 111, 83)'
                  style={{paddingRight: 6}}
                />
              }
            />
          </View>
        </View>
        }
      </React.Fragment>
    );
  }

  render() {
    const {authState} = this.props;
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
          fontFamily: 'Interstate-Regular',
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
    return (
      <ThemeProvider theme={theme}>
        {authState === 'signUp' && this.renderPage()}
      </ThemeProvider>
    );
  }
}

SignUpPage.propTypes = {
  goToDriverSignUp: PropTypes.bool,
  goToCarrierSignUp: PropTypes.bool,
  userStatus: PropTypes.string,
  cognitoId: PropTypes.string,
  password: PropTypes.string,
  mobilePhoneNumber: PropTypes.string,
  responseEmail: PropTypes.string
};

SignUpPage.defaultProps = {
  authData: {},
  authState: 'signUp'// ,
  // onAuthStateChange: (next, data) => {
  // console.log(`SignIn:onAuthStateChange(${next}, ${JSON.stringify(data, null, 2)})`);
  // }
};

export default SignUpPage;
