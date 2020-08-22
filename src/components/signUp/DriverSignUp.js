import React from 'react';
import {Auth} from 'aws-amplify';
import {View, KeyboardAvoidingView, ScrollView, Platform, Picker, ActivityIndicator} from 'react-native';
import {Button, Input, Text, ThemeProvider, Image, CheckBox, Overlay} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../shared.style';
import SignUp from "aws-amplify-react-native/dist/Auth/SignUp";
import LookupsService from "../../api/LookupsService";
import UserManagementService from "../../api/UserManagementService";
import UserService from "../../api/UserService";
import DriverService from "../../api/DriverService";
import TFormat from "../common/TFormat";
import {translate} from '../../i18n';
import TDatePickerModal from "../common/TDatePickerModal";
import TPickerModal from "../common/TPickerModal";
import * as PropTypes from "prop-types";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import CompanyService from "../../api/CompanyService";
import PasswordValidator from '../../utils/PasswordValidator';
import OnboardingService from "../../api/OnboardingService";

class DriverSignUp extends SignUp {
  constructor(props) {
    super(props);
    this.state = {
      authData: this.props.authData,
      step: 1,
      authState: this.props.authState,
      modalShowing: false,
      loading: false,
      error: null,
      errorLicenseId: null,
      errorLicenseIssueDate: null,
      errorLicenseExpirationDate: null,
      errorLicenseState: null,
      errorEmail: null,
      errorCheckbox: null,
      email: this.props.authData.email || '',
      password: this.props.authData.password || '',
      firstName: '',
      lastName: '',
      verificationCodeSMS: '',
      verificationCodeEmail: '',
      // userType: 'Select',
      mobilePhoneNumber: '',
      user: null,
      driver: null,
      termsChecked: false,
      hidePassword: true,
      driverSignUp: false,
      showDriverFields: false,
      driverUser: null,
      driverLicenseId: null,
      driverLicenseIssueDate: null,
      driverLicenseExpDate: null,
      driverLicenseState: null,
      driverExists: true,
      cognitoAccountExists: false,
      cogResponse: null,
      isLoading: true,
      all_states: [],
      driversCompany: null,
      isHandlingNext: false,
      accessToken: null,
      idToken: null,
      cognitoId: null,
      responseEmail: ''
    };
    this.createCognitoAccount = this.createCognitoAccount.bind(this);
    this.confirmCognitoAccount = this.confirmCognitoAccount.bind(this);
    this.handleUserInputChange = this.handleUserInputChange.bind(this);
    this.handlePasswordInputChange = this.handlePasswordInputChange.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handleSaveDriver = this.handleSaveDriver.bind(this);
    this.handleBack = this.handleBack.bind(this);
    this.validatePage = this.validatePage.bind(this);
    this.validatePageOne = this.validatePageOne.bind(this);
    this.validatePageTwo = this.validatePageTwo.bind(this);
    this.validatePageThree = this.validatePageThree.bind(this);
    this.validatePageFour = this.validatePageFour.bind(this);
    this.validatePageFive = this.validatePageFive.bind(this);
    this.resendSMSVerification = this.resendSMSVerification.bind(this);
    this.resendEmailVerification = this.resendEmailVerification.bind(this);
    this.userPhoneVerified = this.userPhoneVerified.bind(this);
    this.hidePassword = this.hidePassword.bind(this);
    this.handleChangeValue = this.handleChangeValue.bind(this);
    this.validateDriverRecord = this.validateDriverRecord.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
  }

  componentDidMount(): void {
    const {goToDriverSignUp} = this.props;
    this.setState({isLoading: goToDriverSignUp});

  }

  async componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any): void {
    const {goToDriverSignUp, signUpStatus, cognitoId, password, mobilePhoneNumber, responseEmail} = this.props;
    let {all_states} = this.state;

    if (goToDriverSignUp) {
      this.setState({cognitoId, password, responseEmail});

      switch (signUpStatus) {
        case "COGNITO_ACCOUNT_CREATED":
          this.resendSMSVerification(responseEmail);
          this.setState({
            step: 2,
            mobilePhoneNumber,
            isLoading: false
          });

          break;
        case "COGNITO_ACCOUNT_VERIFIED":
          let authResponse;
          try {
            authResponse = await UserManagementService.signIn({email: cognitoId, password});
          } catch (err) {
            console.error(err);
          }

          if (!authResponse.success) {
            this.props.onBackToLoginMain();
            return;
          }

          const accessToken = authResponse.accessToken;
          const idToken = authResponse.idToken;
          // note: this could be optimized, we just needed a list of us states.
          let lookups;
          try {
            lookups = await LookupsService.getLookupsStates(accessToken, idToken);
          } catch (err) {
            console.error(err);
          }
          Object.values(lookups)
            .forEach((itm) => {
              all_states.push(itm.val1);

            });
          this.setState({
            // driversCompany,
            // user: updatedUser,
            all_states,
            step: 3,
            error: null,
            errorCheckbox: null,
            accessToken,
            idToken,
            mobilePhoneNumber,
            isLoading: false
          });

          break;
        default:
        // ?? what to do on default
      }
    }
  }

  handleChangeValue(name, val) {
    let errorName;
    switch (name) {
      case 'driverLicenseIssueDate':
        errorName = 'errorLicenseIssueDate';
        break;
      case 'driverLicenseExpDate':
        errorName = 'errorLicenseExpirationDate';
        break;
      case 'driverLicenseState':
        errorName = 'errorLicenseState';
        break;
      default:
        errorName = 'error'
    }
    this.setState({[name]: val, [errorName]: null})
  }

  async handleNext() {
    let {step, mobilePhoneNumber, user, accessToken, idToken} = {...this.state};
    const { email, password } = {...this.state};
    this.setState({ isHandlingNext: true });
    switch (step) {
      case 1:
        if (this.validatePageOne()) {
          const phone_number = `+1${mobilePhoneNumber.replace(/\D/g, '')}`;
          const isValidateDriver = await this.validateDriverRecord(phone_number);

          try {
            if (isValidateDriver) {
              // if this is a valid sign up with a user record of status "Driver Invited" based on phone number
              await this.createCognitoAccount(phone_number);
            }
            this.setState({ user });
          } catch (err) {
            console.error(err);
          }
        }
        break;
      case 2:
        if (this.validatePageTwo()) {
          try {
            // They can authenticate at this point.
            await this.confirmCognitoAccount();
          } catch (err) {
            console.error('failed to confirm phone number');
            this.setState({error: 'Failed to confirm phone number.'});
          }
        }
        break;
      case 3:
        if (this.validateAccountPage()) {
          step = step + 1;
          this.setState({step});
        }
        break;
      case 4:
        let isPageThreeValid = false;
        try {
          isPageThreeValid = this.validatePageThree();
        } catch (err) {
          console.error('failed to validate step 3');
          this.setState({error: 'Failed to validate step 3.'});
        }
        if (isPageThreeValid) {
          try {
            await this.handleSaveDriver();
          } catch (err) {
            console.error('failed to update CDL and send registration email');
            this.setState({error: 'Failed to update CDL and send registration email.'});
          }
        }
        break;
      default:
        break;
    }
    this.setState({ isHandlingNext: false });
  }

  handleBack() {
    let {step} = this.state;
    if (step === 1) {
      this.props.onBackToLogin();
    } else {
      step = step - 1;
      this.setState({step});
    }
  }

  async handleLogin() {
    const {cognitoId, password} = this.state;
    this.setState({ isHandlingNext: true });
    try {
      const data = await Auth.signIn(cognitoId, password);
      if (data.signInUserSession !== null) {
        if (this.props.onStateChange) {
          this.props.onStateChange('authenticated', data);
        }
      }
    } catch (err) {
      console.log(err);
      this.props.onBackToLogin();
    }
  }

  hidePassword(e) {
    e.preventDefault();
    const {hidePassword} = this.state;
    this.setState({
      hidePassword: !hidePassword
    });
  }

  async validateDriverRecord(phone_number) {
    // here call method to check if cognito account exists/is verified or onboarding is done
    const userStatusRequest = {phone: phone_number, driverFlow: true};
    let userStatusResponse;
    try {
      userStatusResponse = await OnboardingService.checkOnBoardingStatus(userStatusRequest);
    } catch (err) {
      console.log(err);
    }
    switch (userStatusResponse.status) {
      case "DRIVER_INVITED":
        // driver has "invited" record and does not have a cognito account (we're good to go)
        this.setState({
          email: userStatusResponse.email
        });
        return true;
      case "NOT_STARTED":
        // no record of a user or user with this phone number exists with status other than "Driver Invited"
        this.setState({
          driverExists: false
        });
        return false;
      default:
        // user already has cognito account, in which case we make user go to login page
        this.setState({
          cognitoAccountExists: true
        });
        return false;
    }
      // if (user.id && user.userStatus === 'Driver Invited') {
    //   // continue driver sign up
    //   return true;
    // } else {
    //   this.setState({
    //     driverExists: false
    //   });
    //   // no record of a user or user with this phone number already exists with status other than "Driver Invited"
    //   return false;
    // }
  }

  validatePageOne() {
    const {
      password,
      mobilePhoneNumber
    } = {...this.state};
    const mobilePhone = mobilePhoneNumber.replace(/\D/g, '');
    if (!password || password.length <= 0
      || !mobilePhone || mobilePhone.length < 10) {
      this.setState({
        error: 'Missing fields.',
        loading: false
      });
      return false;
    }
    if(!PasswordValidator.isValidPassword(password)) {
      this.setState({
        error: 'Password does not meet the requirements',
        loading: false
      });
      return false;
    }
    return true;
  }

  validateAccountPage() {
    const {
      firstName,
      lastName,
      termsChecked
    } = {...this.state};
    if (!firstName || firstName.length <= 0
      || !lastName || lastName.length <= 0) {
      this.setState({
        error: 'Missing fields.',
        loading: false
      });
      return false;
    }
    if (!termsChecked) {
      this.setState({
        errorCheckbox: 'Must accept conditions.',
        loading: false
      });
      return false;
    }
    return true;
  }

  validatePageTwo() {
    const {verificationCodeSMS} = {...this.state};
    if (!verificationCodeSMS || verificationCodeSMS.length <= 0) {
      this.setState({
        error: 'Missing field.',
        loading: false
      });
      return false;
    }
    return true;
  }

  validatePageThree() {
    const {
      driverLicenseId,
      driverLicenseIssueDate,
      driverLicenseExpDate,
      driverLicenseState
    } = {...this.state};
    let {
      errorLicenseId,
      errorLicenseIssueDate,
      errorLicenseExpirationDate,
      errorLicenseState,
      loading
    } = {...this.state};
    let isValid = true;
    if (!driverLicenseId || driverLicenseId.length <= 0) {
      errorLicenseId = '*';
      loading = false;
      isValid = false;
    }
    if (!driverLicenseIssueDate || driverLicenseIssueDate.length <= 0) {
      errorLicenseIssueDate = '*';
      loading = false;
      isValid = false;
    }
    if (!driverLicenseExpDate || driverLicenseExpDate.length <= 0) {
      errorLicenseExpirationDate = '*';
      loading = false;
      isValid = false;
    }
    const todaysDate = new Date();
    const todaysDateTrimmed = new Date(todaysDate.getFullYear(), todaysDate.getMonth(), todaysDate.getDate());
    if ((!errorLicenseIssueDate || errorLicenseIssueDate === '')
      && driverLicenseIssueDate > todaysDateTrimmed) {
      errorLicenseIssueDate = 'Invalid';
      loading = false;
      isValid = false;
    }
    if ((!errorLicenseExpirationDate || errorLicenseExpirationDate === '')
      && driverLicenseExpDate <= todaysDateTrimmed) {
      errorLicenseExpirationDate = 'Invalid';
      loading = false;
      isValid = false;
    }
    if (!driverLicenseState || driverLicenseState.length <= 0) {
      errorLicenseState = '*';
      loading = false;
      isValid = false;
    }
    if (!isValid) {
      this.setState({
        errorLicenseId,
        errorLicenseIssueDate,
        errorLicenseExpirationDate,
        errorLicenseState,
        loading
      });
    }
    return isValid;
  }

  async validatePageFour() {
    // if email verification code entered and is correct

    const {verificationCodeEmail, email, password, user} = {...this.state};
    if (!verificationCodeEmail || verificationCodeEmail.length <= 0) {
      this.setState({
        error: 'Missing field.',
        loading: false
      });
      return false;
    }
    const verificationCode = verificationCodeEmail;
    const verificationDetails = {
      email,
      password,
      verificationCode
    };
    try {
      const response = await UserManagementService.verifyCodeByEmail(verificationDetails);
      if (response.message !== "Successfully verified the verification code.") {
        this.setState({
          error: "Failed to validate email.",
          loading: false
        });
        return false;
      } else {
        user.userStatus = "Email Verified";
        user.isEmailVerified = 1;
        await UserService.updateUser(user);
        this.setState({user});
      }
    } catch (err) {
      this.setState({
        error: "Failed to validate email.",
        loading: false
      });
      return false;
    }
    return true;
  }

  validatePageFive() {
    const {dotNumber} = {...this.state};
    if (!dotNumber || dotNumber.length <= 0) {
      this.setState({
        error: 'Missing fields.',
        loading: false
      });
      return false;
    }
    return true;
  }

  async createCognitoAccount(phone_number) {
    let {step, cognitoId} = this.state;
    this.setState({loading: true});
    // console.log('testing button');
    const {password, email} = this.state;

    try {
      const params = {
        username: email,
        password,
        attributes: {
          email,          // optional
          phone_number,   // optional - E.164 number convention
          // other custom attributes
        },
        validationData: []  //optional
      };
      let cognitoData = await Auth.signUp(params);
      cognitoId = cognitoData.userSub;
      step += 1;

      this.setState({cognitoId, loading: false, step, email, error: null, errorCheckbox: null });
    } catch (err) {
      this.setState({ error: 'Failed to sign up user', loading: false });
      console.error(err);
    }
  }

  async handleSaveDriver() {
    let {
      driverLicenseId,
      step,
      driversCompany
    } = {...this.state};
    const {
      firstName,
      lastName,
      mobilePhoneNumber,
      driverLicenseExpDate,
      driverLicenseIssueDate,
      driverLicenseState,
      cognitoId,
      accessToken,
      idToken
    } = {...this.state};
    // let {user, step} = {...this.state};
    // let driver = {};
    // try {
    //    driver = await UserService.getDriverByUserId(user.id);
    // } catch (err) {
    //   this.setState({error: 'Failed to get driver information.'});
    //   console.error('Failed to get driver information');
    // }
    driverLicenseId = driverLicenseId.trim();
    // driver.driverLicenseId = driverLicenseIdTrimmed;
    // driver.driverLicenseIssueDate = driverLicenseIssueDate;
    // driver.driverLicenseExpDate = driverLicenseExpDate;
    // driver.driverLicenseState = driverLicenseState;
    // driver.driverStatus = "Enabled";
    // user.userStatus = "Driver Enabled";
    // user.driverId = driver.id;

    // CALL HERE TO SAVE DRIVER
    const phone_number = `+1${mobilePhoneNumber.replace(/\D/g, '')}`;

    step = step + 1;

    const driver = {
      firstName,
      lastName,
      mobilePhone: phone_number,
      driverLicenseId,
      driverLicenseExpDate,
      driverLicenseIssueDate,
      driverLicenseState,
      cognitoId,
      driverFlow: true
    };

    try {
       const r = await OnboardingService.onboardDriver(driver, accessToken, idToken);
       driversCompany = r.carrierCompanyLegalName;
    } catch (err) {
      console.error(err);
    }

    this.setState({step, driversCompany});
    // try {
    //   // driver = await DriverService.updateDriverOnBoarding(driver, accessToken, idToken);
    //   // user = await UserService.updateUserOnBoarding(user, accessToken, idToken);
    //   step = step + 1;
    //   this.setState({driver, user, step});
    // } catch (err) {
    //   this.setState({error: 'Failed to update CDL.'});
    //   console.error(err);
    // }
  }

  async confirmCognitoAccount() {
    let {step, all_states, accessToken, idToken} = this.state;
    const {verificationCodeSMS, password, user, cognitoId} = {...this.state};
    this.setState({loading: true});
    const username = cognitoId;
    const code = verificationCodeSMS;
    try {
      await Auth.confirmSignUp(username, code);
      // note: says email as request but actually is using the cognitoId

      // validateSignIn
      // if not valid sign them out


      let authResponse;
      try {
        authResponse = await UserManagementService.signIn({email: username, password});
      } catch (err) {
        console.error(err);
      }

      if (!authResponse.success) {
        this.props.onBackToLoginMain();
        return;
      }

      accessToken = authResponse.accessToken;
      idToken = authResponse.idToken;
      // note: this could be optimized, we just needed a list of us states.

      let lookups;
      try {
        lookups = await LookupsService.getLookupsStates(accessToken, idToken);
      } catch (err) {
        console.error(err);
      }
      Object.values(lookups)
        .forEach((itm) => {
          all_states.push(itm.val1);
        });
      step = step + 1;
      this.setState({
        // driversCompany,
        // user: updatedUser,
        all_states,
        step,
        error: null,
        errorCheckbox: null,
        accessToken,
        idToken
      });

    } catch (err) {
      console.log('Error: ', err);
      this.setState({
        error: err.message,
        loading: false
      });
    }
  }

  async userPhoneVerified() {
    const {user, driverSignUp} = {...this.state};
    if (driverSignUp) {
      await this.createUserRecord();
    } else {
      user.userStatus = driverSignUp ? "Driver Phone Verified" : "Phone Verified";
      user.isPhoneVerified = 1;
      await UserService.updateUser(user);
      this.setState({user});
    }
  }

  validatePage(pageNum) {
    // make sure to validate for @ sign on page 1
  }

  async resendEmailVerification() {
    const {email, password, accessToken, idToken, responseEmail} = {...this.state};
    const username = !responseEmail ? email : responseEmail;
    try {
      let response;
      try {
        response = await UserManagementService.sendVerificationCodeByEmail({email: username, password}, accessToken, idToken);
      } catch (err) {
        console.error(err);
        return;
      }
      if (response.message !== "Successfully emailed the verification code.") {
        this.setState({
          error: "Failed to send email verification code.",
          loading: false
        });
        return false;
      }
    } catch (err) {
      this.setState({
        error: "Failed to send email verification code.",
        loading: false
      });
      return false;
    }
    return true;
  }

  resendSMSVerification(responseEmail) {
    this.setState({loading: true});
    try {
      const username = responseEmail;

      Auth.resendSignUp(username)
        .then(() => {
          // this.changeState('confirmSignUp', username);
          // this.setState({username: '', password: '', error: null});
          this.setState({error: null});
        })
        .catch(err => {
          this.setState({
            error: err.message,
            loading: false
          });
        });
    } catch (err) {
      this.setState({
        error: err.message,
        loading: false
      });
    }
  }

  handleUserInputChange(username) {
    this.setState({username, error: null});
  }

  handlePasswordInputChange(password) {
    this.setState({password, error: null});
  }

  renderSignUpFormOne() {
    const {hidePassword, error} = this.state;
    let passwordError = false;

    if (error && error.includes("Value at 'password'")) {
      passwordError = true;
    }
    return (
      <React.Fragment>
        <View style={styles.signUpPageTitle}>
          <Text style={{fontSize: 20}}>Account Details</Text>
        </View>
        <View style={styles.signUpFormPad}>
          <Text style={{fontSize: 15}}>Mobile Phone Number</Text>
          <View style={styles.rowInput}>
            <Input
              name="phone"
              keyboardType={'number-pad'}
              returnKeyType="done"
              placeholder="(555) 555 - 5555"
              value={this.state.mobilePhoneNumber}
              autoCapitalize='none'
              onChangeText={(mobilePhone) => {
                const mobilePhoneNumber = TFormat.mobileAmericanNumber(mobilePhone);
                this.setState({
                  mobilePhoneNumber,
                  error: null
                })
              }
              }
            />
          </View>
          <Text style={{fontSize: 15}}>Password</Text>
          <View style={styles.rowInput}>
            <Input
              name="password"
              type={hidePassword ? 'password' : 'text'}
              secureTextEntry={hidePassword}
              autoCapitalize='none'
              placeholder={`8+ ${translate('characters')}: A-Z, a-z, 0-9`}
              value={this.state.password}
              onChangeText={(password) => this.setState({password, error: null})}
              rightIcon={(
                <Icon
                  style={hidePassword ? styles.eyeLoginContainerSignUp : styles.eyeLoginContainerActiveSignUp}
                  name="eye"
                  size={24}
                  onPress={e => this.hidePassword(e)}
                />
              )}
              rightIconContainerStyle={
                hidePassword ? styles.eyeLoginContainerSignUp : styles.eyeLoginContainerActiveSignUp
              }
            />
            <Text style={{color: passwordError ? 'red' : 'rgb(0, 111, 83)', fontSize: 12}}>
              {`8 ${translate('characters')}, ${translate('with at least one of')}:`} {"\n"}
              {translate('Upper, Lower, and a Number')}
            </Text>
          </View>
        </View>
      </React.Fragment>
    );
  }

  renderAccountDetails() {

    return (
      <React.Fragment>
        <View style={styles.signUpPageTitle}>
          <Text style={{fontSize: 20}}>Account Details</Text>
        </View>
        <View style={styles.signUpFormPad}>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 15}}>First Name</Text>
            {(!!this.state.error) &&
            <Text style={{fontSize: 15, color: 'red', width: 200, paddingLeft: 20}}
                  visible={!!this.state.error}>{this.state.error}</Text>}
          </View>
          <View style={styles.rowInput}>
            <Input
              name="firstName"
              value={this.state.firstName}
              onChangeText={(firstName) => this.setState({firstName, error: null})}
              errorStyle={{paddingTop: 0, backgroundColor: 'yellow'}}
            />
          </View>
          <Text style={{fontSize: 15}}>Last Name</Text>
          <View style={styles.rowInput}>
            <Input
              name="lastName"
              value={this.state.lastName}
              onChangeText={(lastName) => this.setState({lastName, error: null})}
            />
          </View>
          {/*<Text style={{fontSize: 15}}>Password</Text>*/}
          {/*<View style={styles.rowInput}>*/}
          {/*  <Input*/}
          {/*    name="password"*/}
          {/*    type={hidePassword ? 'password' : 'text'}*/}
          {/*    secureTextEntry={hidePassword}*/}
          {/*    autoCapitalize='none'*/}
          {/*    placeholder={`8+ ${translate('characters')}: A-Z, a-z, 0-9`}*/}
          {/*    value={this.state.password}*/}
          {/*    onChangeText={(password) => this.setState({password, error: null})}*/}
          {/*    rightIcon={(*/}
          {/*      <Icon*/}
          {/*        style={hidePassword ? styles.eyeLoginContainerSignUp : styles.eyeLoginContainerActiveSignUp}*/}
          {/*        name="eye"*/}
          {/*        size={24}*/}
          {/*        onPress={e => this.hidePassword(e)}*/}
          {/*      />*/}
          {/*    )}*/}
          {/*    rightIconContainerStyle={*/}
          {/*      hidePassword ? styles.eyeLoginContainerSignUp : styles.eyeLoginContainerActiveSignUp*/}
          {/*    }*/}
          {/*  />*/}
          {/*  <Text style={{color: passwordError ? 'red' : 'rgb(0, 111, 83)', fontSize: 12}}>*/}
          {/*    {`8 ${translate('characters')}, ${translate('with at least one of')}:`} {"\n"}*/}
          {/*    {translate('Upper, Lower, and a Number')}*/}
          {/*  </Text>*/}
          {/*</View>*/}
          {/*<Text style={{fontSize: 15}}>Mobile Phone Number</Text>*/}
          {/*<View style={styles.rowInput}>*/}
          {/*  <Input*/}
          {/*    name="phone"*/}
          {/*    keyboardType={'number-pad'}*/}
          {/*    placeholder="(555) 555 - 5555"*/}
          {/*    value={this.state.mobilePhoneNumber}*/}
          {/*    autoCapitalize='none'*/}
          {/*    onChangeText={(mobilePhone) => {*/}
          {/*      const mobilePhoneNumber = TFormat.mobileAmericanNumber(mobilePhone);*/}
          {/*      this.setState({*/}
          {/*        mobilePhoneNumber,*/}
          {/*        error: null*/}
          {/*      })*/}
          {/*    }*/}
          {/*    }*/}
          {/*  />*/}
          {/*</View>*/}
          <View style={{paddingBottom: 25}}>
            <View style={{
              flex: 1,
              flexDirection: 'row'
            }}>
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CheckBox
                  center
                  checked={this.state.termsChecked}
                  onPress={() => this.setState({termsChecked: !this.state.termsChecked, errorCheckbox: null})}
                />
              </View>
              <View style={{marginRight: 100}}>
                <Text style={{paddingTop: 18}}>{`I agree to the Trelar `}
                  {TFormat.asLink('https://www.trelar.com/terms-of-service', 'Terms of Service')}
                  {` and to `}
                  {TFormat.asLink('https://www.trelar.com/privacy-policy', 'Privacy Policy')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </React.Fragment>
    );
  }

  renderMobileValidation() {
    return (
      <React.Fragment>
        <View>
          <View style={styles.signUpPageTitle}>
            <Text style={{fontSize: 20}}>Mobile Phone Validation</Text>
          </View>
          <View style={styles.signUpPageBody}>
            <Text style={{fontSize: 15, paddingBottom: 30}}>
              We sent a text message containing a 6-digit code.
              Please enter the code below to verify your mobile phone number.
            </Text>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={{fontSize: 15, paddingBottom: 10}}>Verification code</Text>
              {!!this.state.error &&
              <Text style={{fontSize: 15, color: 'red', width: 200, paddingLeft: 20}}
                    visible={!!this.state.error}>{this.state.error}</Text>}
            </View>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
              <Input
                name="smsVerification"
                containerStyle={{width: 120}}
                value={this.state.verificationCodeSMS}
                onChangeText={(verificationCodeSMS) => this.setState({verificationCodeSMS, error: null})}
              />
              <Button
                title='Send Again'
                type='outline'
                onPress={this.resendSMSVerification}
                buttonStyle={{backgroundColor: 'transparent', borderColor: 'transparent'}}
              />
            </View>
          </View>
        </View>
      </React.Fragment>
    );
  }

  renderDriverLicenseInfo() {
    const items = this.state.all_states;
    return (
      <React.Fragment>
        <View style={styles.signUpPageTitle}>
          <Text style={{fontSize: 20}}>CDL</Text>
        </View>
        <View style={styles.signUpFormPad}>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 15}}>Driver License ID</Text>
            {!!this.state.errorLicenseId &&
            <Text style={{fontSize: 15, color: 'red', paddingLeft: 10}}
                  visible={!!this.state.errorLicenseId}>{this.state.errorLicenseId}</Text>}
          </View>
          <View style={styles.rowInput}>
            <Input
              name="driverLicenseId"
              value={this.state.driverLicenseId}
              onChangeText={(driverLicenseId) => {
                // const alphaNumeric = driverLicenseId.replace(/[^a-z0-9]/gi,'').toUpperCase();
                if (driverLicenseId.length > 25) {
                  return;
                }
                this.setState({driverLicenseId, errorLicenseId: null})
              }}
              errorStyle={{paddingTop: 0, backgroundColor: 'yellow'}}
            />
          </View>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 15}}>Driver License Issue Date</Text>
            {!!this.state.errorLicenseIssueDate &&
            <Text style={{fontSize: 15, color: 'red', paddingLeft: 10}}
                  visible={!!this.state.errorLicenseIssueDate}>{this.state.errorLicenseIssueDate}</Text>}
          </View>
          <View style={[styles.rowInput, {paddingTop: 15}]}>
            <TDatePickerModal
              modalTitle="Driver License Issue Date"
              name="driverLicenseIssueDate"
              changeDate={this.handleChangeValue}
              buttonFontSize={14}
            />
          </View>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 15}}>Driver License Expiration Date</Text>
            {!!this.state.errorLicenseExpirationDate &&
            <Text style={{fontSize: 15, color: 'red', paddingLeft: 10}}
                  visible={!!this.state.errorLicenseExpirationDate}>{this.state.errorLicenseExpirationDate}</Text>}
          </View>
          <View style={[styles.rowInput, {paddingTop: 15}]}>
            <TDatePickerModal
              modalTitle="Driver License Expiration Date"
              name="driverLicenseExpDate"
              changeDate={this.handleChangeValue}
              buttonFontSize={14}
            />
          </View>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{fontSize: 15}}>Driver License State</Text>
            {!!this.state.errorLicenseState &&
            <Text style={{fontSize: 15, color: 'red', paddingLeft: 10}}
                  visible={!!this.state.errorLicenseState}>{this.state.errorLicenseState}</Text>}
          </View>
          <View style={[styles.rowInput, {paddingTop: 15}]}>
            <TPickerModal
              items={items}
              buttonTitle="Change"
              modalTitle="Driver License State"
              name="driverLicenseState"
              changeItem={this.handleChangeValue}
              buttonFontSize={14}
            />
          </View>
        </View>
      </React.Fragment>
    );
  }

  renderDriverSignUpFormEnd() {
    let {driversCompany} = {...this.state};
    if (!driversCompany || driversCompany === '') {
      driversCompany = "your carrier company";
    }
    return (
      <React.Fragment>
        <View style={styles.signUpPageTitle}>
          <Text style={{fontSize: 20}}>Welcome to Trelar.</Text>
        </View>
        <View style={styles.signUpPageBody}>
          <Text style={{fontSize: 15, paddingBottom: 20}}>
            Thank you for providing the requested information.
            You will now be able to see any jobs that have been assigned to you
            by {driversCompany}.{"\n"}{"\n"}
          </Text>
        </View>
      </React.Fragment>
    );
  }

  renderDriverSignUpNotInvited() {
    return (
      <React.Fragment>
        {/*<View style={styles.signUpPageTitle}>*/}
        {/*  <Text style={{fontSize: 20}}>Welcome to Trelar.</Text>*/}
        {/*</View>*/}
        <View style={styles.signUpPageBody}>
          <Text style={{fontSize: 15, paddingBottom: 20}}>
            Thank you for providing the requested information. You are not currently linked to a carrier.
            Trelar will be in contact with you shortly to get more information
            to complete your registration.{"\n"}{"\n"}
          </Text>
        </View>
      </React.Fragment>
    );
  }

  renderCognitoExistsModal() {
    const {cognitoAccountExists} = {...this.state};
    return (
      <View>
        <Overlay
          isVisible={cognitoAccountExists}
          onBackdropPress={() => null}
          height={150}
        >
          <View style={{
            flex: 1,
            flexDirection: 'column'
          }}>
            <View>
              <Text style={{color: 'rgb(0, 111, 83)', fontSize: 14}}>Existing Account</Text>
            </View>
            <View>
              <Text style={{
                marginTop: 10,
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}>Another account with your information already exists. Please login.</Text>
            </View>
          </View>
          <View style={{marginTop: 10, flexDirection: 'row', justifyContent: 'space-between'}}>
            <Button
              title="Login"
              onPress={this.props.onBackToLoginMain}
            />
            {/*<Button
              type="outline"
              title={translate('Close')}
              onPress={() => null}
            />*/}
          </View>
        </Overlay>
      </View>
    );
  }

  renderFooterButtons() {
    const {step, termsChecked, driverExists, isHandlingNext} = this.state;
    return (
      <View style={styles.footerButtons}>
        <View style={{flex: 1, flexDirection: 'row', justifyContent: (step === 5 || !driverExists) ? 'flex-end' : 'space-between'}}>
          {(step === 1 && driverExists
            || step === 4
          ) &&
          <Button
            title='Back'
            type='outline'
            onPress={this.handleBack}
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
          }
          {(step === 1 && driverExists) && <Text style={{paddingTop: 15, paddingRight: 15, paddingLeft: 15}}>Step 1</Text>}
          {(step !== 1 && driverExists && step !== 5) && <Text style={{paddingTop: 15, paddingRight: 15, paddingLeft: 15}}>{`Step ${step} of ${4}`}</Text>}
          {(!driverExists) && <Text style={{paddingTop: 15, paddingRight: 15, paddingLeft: 15}}>Step 2 of 2</Text>}
          <Button
            title={step === 5 || !driverExists ? 'Ok' : 'Next'}
            iconRight={true}
            disabled={(step === 3 && !termsChecked) || (isHandlingNext)}
            onPress={!driverExists ? this.props.onBackToLoginMain : step === 5 ? this.handleLogin : this.handleNext}
            loading={ isHandlingNext }
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
    )

  }

  renderPage() {
    const {step, driverExists} = this.state;

    return (
      <React.Fragment>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{flex: 1, backgroundColor: 'rgb(230, 230, 225)'}}>
          <View style={{marginTop: 20}}>
            {(step === 1 && driverExists) &&
            <View style={{flex: 1}}>
              <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : null}>
                <KeyboardAwareScrollView
                  onContentSizeChange={this.onContentSizeChange}
                  keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
                  enableOnAndroid={'true'}
                >
                  {this.renderCognitoExistsModal()}
                  {this.renderSignUpFormOne()}
                  {this.renderFooterButtons()}

                </KeyboardAwareScrollView>
              </KeyboardAvoidingView>
            </View>
            }
            {(step === 2 && driverExists) && this.renderMobileValidation()}
            {(step === 3 && driverExists) && this.renderAccountDetails()}
            {(step === 4 && driverExists) && this.renderDriverLicenseInfo()}
            {(step === 5 && driverExists) && this.renderDriverSignUpFormEnd()}
            {!driverExists && this.renderDriverSignUpNotInvited()}
            {(step !== 1 || !driverExists) && this.renderFooterButtons()}
          </View>
        </ScrollView>
      </React.Fragment>
    );
  }

  render() {
    const {authState} = this.props;
    const {isLoading} = this.state;
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
          fontColor: 'yellow'
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
        {isLoading &&
        <View style={{flex: 1, padding: 0, backgroundColor: 'rgb(230,230,225)', justifyContent: 'center'}}>
          <ActivityIndicator size="large"/>
        </View>
        }
        {!isLoading && this.renderPage()}
      </ThemeProvider>
    );
  }
}

DriverSignUp.propTypes = {
  onBackToLogIn: PropTypes.func.isRequired
};

DriverSignUp.defaultProps = {
  authData: {},
  authState: 'signUp'
};

export default DriverSignUp;
