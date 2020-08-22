import React from 'react';
import {Auth} from 'aws-amplify/lib/index';
import {View, Picker, KeyboardAvoidingView, ScrollView, Platform, StatusBar, ActivityIndicator} from 'react-native';
import {Button, Input, Header, Text, ThemeProvider, Image, CheckBox, Overlay} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../shared.style';
import SignUp from 'aws-amplify-react-native/dist/Auth/SignUp';
import MultiSelect from 'react-native-quick-select';
import AppLogo from '../../img/logo.png';
import DeviceInfo from 'react-native-device-info';
import TMultiImageUploader from '../common/TMultiImageUploader';
import ConfigProperties from '../../ConfigProperties';
import CoiAttachmentService from '../../api/CoiAttachmentService';
import CompanyService from '../../api/CompanyService';
import UserNotificationService from '../../api/UserNotificationService';
import CompanySettingService from '../../api/CompanySettingService';
import DriverRatesService from '../../api/DriverRatesService';
import LookupsService from '../../api/LookupsService';
import UserManagementService from '../../api/UserManagementService';
import UserService from '../../api/UserService';
import AddressService from '../../api/AddressService';
import DriverService from '../../api/DriverService';
import TFormat from '../common/TFormat';
import GeoCodingService from '../../api/GeoCodingService';
import moment from 'moment';
import UserTOSService from '../../api/UserTOSService';
import {translate} from '../../i18n';
import {TextInputMask} from 'react-native-masked-text';
import DriverSignUp from './DriverSignUp';
import TDatePickerModal from '../common/TDatePickerModal';
import TPickerModal from '../common/TPickerModal';
import PropTypes from 'prop-types';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import PasswordValidator from '../../utils/PasswordValidator';
import OnboardingService from "../../api/OnboardingService";

const configObject = ConfigProperties.instance.getEnv();

class CarrierSignUp extends SignUp {
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
      companyName: '',
      streetAddress1: '',
      streetAddress2: '',
      city: '',
      state: '',
      zip: '',
      latitude: 0,
      longitude: 0,
      all_states: [],
      isCompanyOwner: '',
      isCompanyDriver: '',
      isCompanyDispatcher: '',
      dotNumber: '',
      company: null,
      user: null,
      termsChecked: false,
      startUpload: false,
      hidePassword: true,
      driver: null,
      driverUser: null,
      driverCompany: '',
      driverLicenseId: '',
      driverLicenseIssueDate: null,
      driverLicenseExpDate: null,
      driverLicenseState: '',
      signUpType: '',
      isHandlingNext: false,
      isLoading: true,
      cognitoId: '',
      accessToken: '',
      idToken: '',
      coiUploaded: true,
      cognitoAccountExists: false,
      responseEmail: '',
    };
    this.createCognitoAccount = this.createCognitoAccount.bind(this);
    this.onConfirmSignUp = this.onConfirmSignUp.bind(this);
    this.handleUserInputChange = this.handleUserInputChange.bind(this);
    this.handlePasswordInputChange = this.handlePasswordInputChange.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handleFinishedOnboarding = this.handleFinishedOnboarding.bind(this);
    this.handleUpdateCDL = this.handleUpdateCDL.bind(this);
    this.handleBack = this.handleBack.bind(this);
    this.validatePage = this.validatePage.bind(this);
    this.validateUserForm = this.validateUserForm.bind(this);
    this.validateCognitoPageTab = this.validateCognitoPageTab.bind(this);
    this.validateUserRecord = this.validateUserRecord.bind(this);
    this.validatePhoneVerificationForm = this.validatePhoneVerificationForm.bind(this);
    this.validateCompanyAddressForm = this.validateCompanyAddressForm.bind(this);
    this.validateDotForm = this.validateDotForm.bind(this);
    this.validateDriverLicenseForm = this.validateDriverLicenseForm.bind(this);
    this.resendSMSVerification = this.resendSMSVerification.bind(this);
    this.resendEmailVerification = this.resendEmailVerification.bind(this);
    this.createCompanyRecord = this.createCompanyRecord.bind(this);
    this.createUserRecord = this.createUserRecord.bind(this);
    this.userPhoneVerified = this.userPhoneVerified.bind(this);
    this.updateCompany = this.updateCompany.bind(this);
    this.updateCoiAttachments = this.updateCoiAttachments.bind(this);
    this.hidePassword = this.hidePassword.bind(this);
    this.getCoords = this.getCoords.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.validatePhoneNumber = this.validatePhoneNumber.bind(this);
    this.handleChangeValue = this.handleChangeValue.bind(this);
    this.handleSaveCarrier = this.handleSaveCarrier.bind(this);
  }

  componentDidMount(): void {
    const {goToCarrierSignUp} = this.props;
    this.setState({isLoading: goToCarrierSignUp});

  }

  async componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any): void {
    const {goToCarrierSignUp, signUpStatus, cognitoId, password, email, responseEmail} = this.props;
    let {all_states} = this.state;
    if (goToCarrierSignUp) {
      this.setState({cognitoId, password, responseEmail});
      switch (signUpStatus) {
        case "COGNITO_ACCOUNT_CREATED":
          this.resendSMSVerification(responseEmail);
          this.setState({
            step: 2,
            email,
            isLoading: false
          });
          break;
        case "COGNITO_ACCOUNT_VERIFIED":
          const authResponse = await UserManagementService.signIn({email: cognitoId, password});
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
            email,
            isLoading: false
          });
          break;
        default:
          this.props.onBackToLoginMain();
      }
    }
  }

  async onBackToLogIn() {
    this.changeState('signIn');
    this.setState({
      email: '',
      password: '',
      firstName: '',
      verificationCodeSMS: '',
      verificationCodeEmail: '',
      lastName: '',
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
      errorCheckbox: null,
      startUpload: false,
      hidePassword: true,
      driverUser: null,
      all_states: [],
      accessToken: null,
      idToken: null,
      cognitoId: null,
      coiUploaded: true
    });
  }

  async updateCoiAttachments(imageKeys) {
    let { step } = { ...this.state };
    this.setState({ isHandlingNext: true });
    const configObject = ConfigProperties.instance.getEnv();
    const API_UPLOADS_ENDPOINT = configObject.AWS_UPLOADS_ENDPOINT;
    let {accessToken, idToken, coiUploaded} = {...this.state};
    const attachments = [];
    for (const imageKey of imageKeys) {
      attachments.push(`${API_UPLOADS_ENDPOINT}/public/${imageKey}`);
    }
    // 1 update Load Invoices
    const coiAttachments = attachments.map(image => {
      return {
        image: image
      }
    });

    if (coiAttachments.length > 0) {
      await CoiAttachmentService.createCoiAttachmentsOnBoarding(coiAttachments, accessToken, idToken);

    } else {
      coiUploaded = false;
    }
    // user.userStatus = 'DOT Uploaded';
    // user = await UserService.updateUserOnBoarding(user, accessToken, idToken);
    // company.dotNumber = dotNumber;
    // company = await CompanyService.updateCompanyOnBoarding(company, accessToken, idToken);
    // this.setState({step, company, user, isHandlingNext: false, startUpload: false, coiUploaded});
    this.setState({isHandlingNext: false, startUpload: false, coiUploaded, step: (step + 1)});
  }

  async handleLogin() {
    const {cognitoId, password} = this.state;
    try {
      const data = await Auth.signIn(cognitoId, password);
      if (data.signInUserSession !== null) {
        if (this.props.onStateChange) {
          this.props.onStateChange('authenticated', data);
        }
      }
    } catch (err) {
      console.log(err);
      this.props.backToLogin();
    }
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
          <React.Fragment>
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
          </React.Fragment>
        </Overlay>
      </View>
    );
  }

  validatePhoneNumber = () => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return reg.test(text);
  };

  validateEmail = (text) => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return reg.test(text);
  };

  async validateUserRecord() {
    const {email, mobilePhoneNumber} = this.state;
    const phone_number = `+1${mobilePhoneNumber.replace(/\D/g, '')}`;
    // here call method to check if cognito account exists/is verified or onboarding is done
    const userStatusRequest = {email, phone: phone_number};

    const userStatusResponse = await OnboardingService.checkOnBoardingStatus(userStatusRequest);

    if (userStatusResponse.status !== "NOT_STARTED") {
        // user already has cognito account, in which case we make user go to login page
        this.setState({
          cognitoAccountExists: true
        });
        return false;
    }
    return true;
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

  async handleFinishedOnboarding() {
    const {coiUploaded} = {...this.state};
    if (coiUploaded) {     
      try {
        await OnboardingService.sendSuccessRegistrationEmail();
      } catch (err) {
        console.error(err);
      }
    }
    this.props.onBackToLoginMain();
  }

  async handleNext() {
    let {step, mobilePhoneNumber, user, accessToken, idToken, all_states} = this.state;
    const { email, password, responseEmail } = this.state;
    this.setState({ isHandlingNext: true });
    switch (step) {
      case 1:
        if (this.validateCognitoPageTab()) {
          if (await this.validateUserRecord()) {

            const phone_number = `+1${mobilePhoneNumber.replace(/\D/g, '')}`;
            try {
              await this.createCognitoAccount(phone_number);
              // user = await UserService.getUserByMobile(phone_number);
              // if (!user.id) {
              //   await this.createCognitoAccount(phone_number);
              // } else {
              //   // phone number already exists in DB
              //   this.setState({error: 'Phone number already taken.'});
              // }
            } catch (err) {
              console.error('failed to get user by phone number');
              this.setState({error: 'Failed to lookup user by phone number.'});
            }
          }
        }
        break;
      case 2:
        if (this.validatePhoneVerificationForm()) {
          try {
            // They can authenticate at this point.
            await this.onConfirmSignUp();
          } catch (err) {
            console.error('failed to confirm phone number');
            this.setState({error: 'Failed to confirm phone number.'});
          }
        }
        break;
      case 3:
        if (this.validateUserForm()) {
          step = step + 1;
          this.setState({step});
        }
        break;
      case 4:
        if (await this.validateCompanyAddressForm()) {
          step = step + 1;
          this.setState({step});
        }
        break;
        // let isPageThreeValid = false;
        // try {
        //   isPageThreeValid = await this.validateCompanyAddressForm();
        // } catch (err) {
        //   console.error('failed to validate step three');
        //   this.setState({error: 'Failed to valid step three.'});
        // }
        // if (isPageThreeValid) {
        //   const driver = {
        //     usersId: user.id,
        //     createdOn: moment().format(),
        //     modifiedOn: moment().format(),
        //     driverStatus: 'Created'
        //   };
        //   try {
        //     const response = await DriverService.createDriverOnBoarding(driver, accessToken, idToken);
        //     await this.updateCompany(response.id);
        //     step = step + 1;
        //     this.setState({step, error: null, driver: response});
        //   } catch (err) {
        //     console.error(err);
        //   }
        // }
        // break;
      case 5:
        const emailToUse = !responseEmail ? email : responseEmail;
        const authResponse = await UserManagementService.signIn({email: emailToUse, password});

        if (!authResponse.success) {
          this.props.onBackToLoginMain();
          return;
        }
        accessToken = authResponse.accessToken;
        idToken = authResponse.idToken;

        if (all_states.length < 1) {
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
        }
        const isPageFiveValid = this.validateDriverLicenseForm();
        if (isPageFiveValid) {
          try {
            // await this.handleUpdateCDL();
            try {
              const response = await UserManagementService.sendVerificationCodeByEmailOnBoarding({email, password}, accessToken, idToken);
              if (response.message !== "Successfully emailed the verification code.") {
                this.setState({
                  error: "Failed to send email verification code.",
                  loading: false,
                  step,
                  isHandlingNext: false
                });
                return false;
              }
              step = step + 1;
            } catch (err) {
              this.setState({
                error: "Failed to send email verification code.",
                loading: false,
                isHandlingNext: false
              });
              return false;
            }
          } catch (err) {
            console.error('failed to update CDL');
            this.setState({error: 'Failed to update CDL.', });
          }
        }
        this.setState({step, all_states, accessToken, idToken, loading: false, isHandlingNext: false});
        break;
      case 6:
        let isPageSixValid = false;
        try {
          isPageSixValid = await this.validateEmailValidationForm();
        } catch (err) {
          console.error('failed to validate step six');
          this.setState({error: 'Failed to valid step six.'});
        }
        if (isPageSixValid) {
          try {
            await this.handleSaveCarrier();
            // await this.sendRegistrationEmail();
          } catch (err) {
            console.error('Failed to complete registration');
            this.setState({error: 'Failed to complete registration.'});
          }
          // step = step + 1;
          // this.setState({step, error: null});
          // try {
          //   await this.sendRegistrationEmail();
          // } catch (err) {
          //   console.error('failed to send registration email');
          //   this.setState({error: 'Failed to send registration email.'});
          // }
        }
        this.setState({isHandlingNext: false, startUpload: false});
        break;
      case 7:
        this.setState({startUpload: true});
        break;
      case 8:
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

  async handleSaveCarrier() {
    let {
      driverLicenseId,
      step
    } = {...this.state};
    const {
      firstName,
      lastName,
      driverLicenseExpDate,
      driverLicenseIssueDate,
      driverLicenseState,
      cognitoId,
      email,
      companyName,
      termsChecked,
      streetAddress1,
      streetAddress2,
      city,
      state,
      zip,
      dotNumber,
      accessToken,
      idToken
    } = {...this.state};
    const deviceId = DeviceInfo.getUniqueID();
    const isDriverFlow = false;
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
    // const phone_number = `+1${mobilePhoneNumber.replace(/\D/g, '')}`;

    step = step + 1;

    const carrier = {
      firstName,
      lastName,
      email,
      companyName,
      driverLicenseId,
      driverLicenseExpDate,
      driverLicenseIssueDate,
      driverLicenseState,
      cognitoId,
      isTosAccepted: termsChecked,
      driverFlow: false,
      streetAddress1,
      streetAddress2,
      city,
      state,
      zipCode: zip,
      dot: dotNumber,
      deviceId
    };

    try {
      await OnboardingService.onboardCarrier(carrier, accessToken, idToken);
    } catch (err) {
      console.log(err);
    }

    this.setState({step, startUpload: true, isHandlingNext: true, error: null});
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

  async handleUpdateCDL() {
    const {
      driverLicenseId,
      driverLicenseIssueDate,
      driverLicenseExpDate,
      driverLicenseState,
      accessToken,
      idToken
      // driver
    } = {...this.state};
    let {user, step, driver} = {...this.state};
    let updateDriver = false;
    if (driverLicenseId.length > 0) {
      driver.driverLicenseId = driverLicenseId.trim();
      updateDriver = true;
    }
    if (driverLicenseIssueDate) {
      driver.driverLicenseIssueDate = driverLicenseIssueDate;
      updateDriver = true;
    }
    if (driverLicenseExpDate) {
      driver.driverLicenseExpDate = driverLicenseExpDate;
      updateDriver = true;
    }
    if (driverLicenseState.length > 0) {
      driver.driverLicenseState = driverLicenseState;
      updateDriver = true;
    }
    try {
      if (updateDriver) {
        driver = await DriverService.updateDriverOnBoarding(driver, accessToken, idToken);
      }
      step = step + 1;
      this.setState({driver, user, step});
    } catch (err) {
      console.error(err);
    }
  }

  async updateCompany(driverId) {
    const {
      companyName, streetAddress1, streetAddress2, city, state, zip, company, user, latitude,
      longitude, mobilePhoneNumber, accessToken, idToken
    } = {...this.state};

    const address = {
      name: companyName,
      address1: streetAddress1,
      address2: streetAddress2,
      city,
      country: 'US',
      state: state,
      zipCode: zip,
      type: 'Lookup',
      companyId: company.id,
      latitude,
      longitude
    };
    const response = await AddressService.createAddressOnBoarding(address, accessToken, idToken);
    company.addressId = response.id;
    company.legalName = companyName;
    company.adminId = user.id;
    company.phone = `+1${mobilePhoneNumber.replace(/\D/g, '')}`;

    user.userStatus = 'Address Created';
    user.driverId = driverId;
    const company_response = await CompanyService.updateCompanyOnBoarding(company, accessToken, idToken);
    const user_response = await UserService.updateUserOnBoarding(user, accessToken, idToken);
    this.setState({company: company_response, user: user_response});
  }

  hidePassword(e) {
    e.preventDefault();
    const {hidePassword} = this.state;
    this.setState({
      hidePassword: !hidePassword
    });
  }

  validateCognitoPageTab() {
    const {
      email,
      password,
      mobilePhoneNumber
    } = {...this.state};
    const mobilePhone = mobilePhoneNumber.replace(/\D/g, '');
    if (!email || email.length <= 0
      || !password || password.length <= 0
      || !mobilePhone || mobilePhone.length < 10) {
      this.setState({
        error: 'Missing fields.',
        loading: false
      });
      return false;
    }
    if (!this.validateEmail(email)) {
      this.setState({
        errorEmail: 'Invalid Email.',
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

  validateUserForm() {
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
    // const phone_number = `+1${mobilePhoneNumber.replace(/\D/g, '')}`;
    // const user = await UserService.getUserByMobile(phone_number);
    // if (user.id && user.userStatus !== 'Driver Invited') {
    //   this.setState({error: "User with this mobile phone already exists.", loading: false});
    //   return false;
    // } else if (user.id && user.userStatus === 'Driver Invited') {
    //   // This will show the driver fields only if userStatus is Driver Invited
    //   this.setState({
    //     driverSignUp: true,
    //     showDriverFields: true
    //   });
    //   if (!driverLicenseId || driverLicenseId.length <= 0
    //     || !driverLicenseIssueDate || driverLicenseIssueDate.length <= 0
    //     || !driverLicenseExpDate || driverLicenseExpDate.length <= 0
    //     || !driverLicenseState || driverLicenseState.length <= 0) {
    //     this.setState({
    //       error: 'Missing fields.',
    //       loading: false
    //     });
    //     return false;
    //   }
    // }
    return true;
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


  // async validateUserRecord(user) {
  //   if (user.id && user.userStatus === 'Driver Invited') {
  //     // continue driver sign up
  //     this.setState({
  //       driverExists: true
  //     });
  //     return true;
  //   } else {
  //     // no record of a user or user with this phone number already exists with status other than "Driver Invited"
  //     return false;
  //   }
  //
  //   // if (!driverLicenseId || driverLicenseId.length <= 0
  //   //   || !driverLicenseIssueDate || driverLicenseIssueDate.length <= 0
  //   //   || !driverLicenseExpDate || driverLicenseExpDate.length <= 0
  //   //   || !driverLicenseState || driverLicenseState.length <= 0) {
  //   //   this.setState({
  //   //     error: 'Missing fields.',
  //   //     loading: false
  //   //   });
  //   //   return false;
  //   // }
  // }

  validatePhoneVerificationForm() {
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

  async validateCompanyAddressForm() {
    const {companyName,
      streetAddress1,
      city,
      state,
      zip,
      dotNumber
    } = {...this.state};

    if (!companyName || companyName.length <= 0
      || !streetAddress1 || streetAddress1.length <= 0
      || !city || city.length <= 0
      || !state || state.length <= 0
      || !zip || zip.length <= 0
      || !dotNumber || dotNumber.length <= 0) {
      this.setState({
        error: 'Missing fields.',
        loading: false
      });
      return false;
    }

    const geoResponse = await this.getCoords();

    if (!geoResponse || geoResponse.features.length < 1
      || geoResponse.features[0].relevance < 0.90) {
      this.setState({
        error: 'Address not found.',
        loading: false
      });
      return false;
    }
    const coordinates = geoResponse.features[0].center;
    const latitude = coordinates[1];
    const longitude = coordinates[0];

    this.setState({
      latitude,
      longitude
    });
    return true;
  }

  validateDriverLicenseForm() {
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

  async validateEmailValidationForm() {
    // if email verification code entered and is correct

    const {verificationCodeEmail, email, password, user, accessToken, idToken, coiUploaded} = {...this.state};
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
      let response;
      try {
        response = await UserManagementService.verifyCodeByEmailOnBoarding(verificationDetails, accessToken, idToken);
      } catch (err) {
        console.log(err);
        return;
      }
      if (response.message !== 'Successfully verified the verification code.') {
        this.setState({
          error: 'Failed to validate email.',
          loading: false
        });
        return false;
      }
      // else {
      //   user.userStatus = coiUploaded ? 'Pending Review' : 'COI Pending';
      //   user.isEmailVerified = 1;
      //   const userResponse = await UserService.updateUserOnBoarding(user, accessToken, idToken);
      //   this.setState({user: userResponse});
      // }
    } catch (err) {
      this.setState({
        error: 'Failed to validate email.',
        loading: false
      });
      return false;
    }
    return true;
  }

  validateDotForm() {
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

  async getCoords() {
    const {streetAddress1, city, state, zip} = {...this.state};

    const addressString = `${streetAddress1}, ${city}, ${state}, ${zip}`;
    try {
      const geoResponse = await GeoCodingService.getGeoCode(addressString);
      return geoResponse;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async createCognitoAccount(phone_number) {
    let { step, cognitoId } = { ...this.state };
    const { email, password } = { ...this.state };
    this.setState({ loading: true });
    try {
      const username = email;
      const params = {
        username,
        password,
        attributes: {
          email,          // optional
          phone_number,   // optional - E.164 number convention
        }
      };
      try {
        let cognitoData = await Auth.signUp(params);
        cognitoId = cognitoData.userSub;

        step += 1;
        this.setState({ cognitoId, loading: false, step });
      } catch(err) {
        this.setState({ error: err.message, loading: false });
        console.error(err);
      }
    } catch (err) {
      this.setState({ error: err.message, loading: false });
    }
  }

  async createUserTOSRecord(userResponse, accessToken, idToken) {
    try {
      const userTOS = {
        userId: userResponse.id,
        device: DeviceInfo.getUniqueID(),
        dateAccepted: moment().format(),
        createdBy: userResponse.id,
        createdOn: moment().format(),
        modifiedBy: userResponse.id,
        modifiedOn: moment().format()
      };
      await UserTOSService.createOnBoardingUserTOS(userTOS, accessToken, idToken);
    } catch (err) {
      console.error(err);
    }
  }

  async createCompanyRecord(accessToken, idToken) {
    const {email} = this.state;
    const company = {
      legalName: `T_${email}`,
      type: 'Carrier',
      companyStatus: 'Created'
    };
    this.setState({company});
    let companyResponse;
    try {
      companyResponse = await CompanyService.createOnBoardingCompany(company, accessToken, idToken);
      const r1 = await CompanySettingService.createDefaultCompanySettingsOnBoarding(companyResponse.id, accessToken, idToken);
      // this api call isn't there in orion
      // const r2 = await DriverRatesService.createOnBoardingDefaultCompanyDriverRates(companyResponse.id, accessToken, idToken);
    } catch (err) {
      console.error(err);
    }
    return companyResponse;
  }

  async createUserRecord(company, accessToken, idToken) {
    const {
      email,
      firstName,
      mobilePhoneNumber,
      lastName,
      cognitoId
    } = this.state;
    const user = {
      companyId: company.id,
      email,
      firstName,
      lastName,
      isBanned: 0,
      cognitoId: cognitoId,
      isPhoneVerified: 0,
      isEmailVerified: 0,
      userStatus: 'Created',
      preferredLanguage: 'English',
      mobilePhone: `+1${mobilePhoneNumber.replace(/\D/g, '')}`
    };
    let response = user;
    try {
      response = await UserService.createOnBoardUser(user, accessToken, idToken);
      await UserNotificationService.getOrCreateOnBoardingDefaultUserNotifications(response.id, accessToken, idToken);
      await this.createUserTOSRecord(response, accessToken, idToken);
    } catch (err) {
      console.error(err);
    }
    return response;
  }

  async onConfirmSignUp() {
    let { step, all_states, user, company, accessToken, idToken } = { ...this.state };
    const {verificationCodeSMS, email, responseEmail,  password} = { ...this.state };
    this.setState({loading: true});
    try {
      const username = !responseEmail ? email : responseEmail;
      const code = verificationCodeSMS;
      if (code.length <= 0) {
        this.setState({
          error: 'Code cannot be empty',
          loading: false
        });
        return;
      }
      try {
        await Auth.confirmSignUp(username, code);

        const authResponse = await UserManagementService.signIn({email: username, password});

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
        // try {
        //   company = await this.createCompanyRecord(accessToken, idToken);
        //   user = await this.createUserRecord(company, accessToken, idToken);
        //   user = await this.userPhoneVerified(user, accessToken, idToken);
        //   this.setState({ user });
        // } catch (err) {
        //   console.error(err);
        // }
        step = step + 1;
        this.setState({
          all_states,
          step,
          // company,
          // user,
          error: null,
          isLoading: false,
          errorEmail: null,
          errorCheckbox: null,
          accessToken,
          idToken
        });
      } catch (err) {
        this.setState({
          error: err.message,
          loading: false
        });
      }
    } catch (err) {
      console.log('Error: ', err);
      this.setState({
        error: err.message,
        loading: false
      });
    }
  }

  async userPhoneVerified(user, accessToken, idToken) {
    user.userStatus = 'Phone Verified';
    user.isPhoneVerified = 1;
    const userResponse = await UserService.updateUserOnBoarding(user, accessToken, idToken);
    return userResponse;
  }

  validatePage(pageNum) {
    // make sure to validate for @ sign on page 1
  }

  async resendEmailVerification() {
    const {email, password, accessToken, idToken, responseEmail} = {...this.state};
    const username = !responseEmail ? email : responseEmail;
    try {
      const response = await UserManagementService.sendVerificationCodeByEmailOnBoarding({email: username, password}, accessToken, idToken);
      if (response.message !== 'Successfully emailed the verification code.') {
        this.setState({
          error: 'Failed to send email verification code.',
          loading: false
        });
        return false;
      }
    } catch (err) {
      this.setState({
        error: 'Failed to send email verification code.',
        loading: false
      });
      return false;
    }
    return true;
  }

  resendSMSVerification(responseEmail) {
    const {email} = this.state;
    this.setState({loading: true});
    try {
      const username = !responseEmail ? email : responseEmail;

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

  // handleUserTypeChange(val) {
  //   if (val !== 'Select') {
  //     this.setState({userType: val, error: null});
  //   }
  // }

  handleUserInputChange(username) {
    this.setState({username, error: null});
  }

  handlePasswordInputChange(password) {
    this.setState({password, error: null});
  }

  renderCognitoSignUpPage() {
    const {hidePassword, error} = this.state;
    // const items = this.state.all_states;
    let passwordError = false;

    if (error && error.includes("Value at 'password'")) {
      passwordError = true;
    }
    return (
      <React.Fragment>
        <View style={{flex: 1}}>
          <View style={styles.signUpPageTitle}>
            <Text style={{fontSize: 20}}>Account Details</Text>
          </View>
          <View style={styles.signUpFormPad}>
            {/*{!!this.state.error &&*/}
            {/*<TAlert visible={!!this.state.error} alertText={(!!this.state.error ? this.state.error : '')}/>}*/}
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={{fontSize: 15}}>Email Address</Text>
              {!!this.state.errorEmail &&
              <Text style={{fontSize: 15, color: 'red'}}
                    visible={!!this.state.errorEmail}>{this.state.errorEmail}</Text>}
            </View>
            <View style={styles.rowInput}>
              <Input
                name="email"
                keyboardType={'email-address'}
                placeholder="username@domain.com"
                value={this.state.email}
                autoCapitalize='none'
                onChangeText={(email) => this.setState({
                  email: email.toLowerCase(),
                  error: null,
                  errorEmail: null
                })}
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
              <Text style={{color: passwordError ? 'red' : null}}>
                {`8 ${translate('characters')}, ${translate('with at least one of')}:`} {'\n'}
                {translate('Upper, Lower, and a Number')}
              </Text>
            </View>
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
          </View>
        </View>
      </React.Fragment>
    );

  }

  renderUserForm() {
    const {hidePassword, error} = this.state;
    // const items = this.state.all_states;
    let passwordError = false;

    if (error && error.includes("Value at 'password'")) {
      passwordError = true;
    }
    return (
      <React.Fragment>
        <View style={{flex: 1}}>
          <View style={styles.signUpPageTitle}>
            <Text style={{fontSize: 20}}>Account Details</Text>
          </View>
          <View style={styles.signUpFormPad}>
            {/*{!!this.state.error &&*/}
            {/*<TAlert visible={!!this.state.error} alertText={(!!this.state.error ? this.state.error : '')}/>}*/}
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={{fontSize: 15}}>First Name</Text>
              {(!!this.state.error && !passwordError) &&
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
        </View>
      </React.Fragment>
    );
  }

  renderPhoneVerificationForm() {
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

  renderCompanyAddressForm() {
    const items = this.state.all_states;
    return (
      <React.Fragment>
        <View style={{flex: 1}}>

          <View style={styles.signUpPageTitle}>
            <Text style={{fontSize: 20}}>Company Profile</Text>
          </View>
          <View style={styles.signUpFormPad}>
            {/*{!!this.state.error &&*/}
            {/*<TAlert visible={!!this.state.error} alertText={(!!this.state.error ? this.state.error : '')}/>}*/}
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={{fontSize: 15}}>Company Name</Text>
              {!!this.state.error &&
              <Text style={{fontSize: 15, color: 'red'}} visible={!!this.state.error}>{this.state.error}</Text>}
            </View>
            <View style={styles.rowInput}>
              <Input
                name="companyName"
                value={this.state.companyName}
                onChangeText={(companyName) => this.setState({companyName, error: null})}
                errorStyle={{paddingTop: 0, backgroundColor: 'yellow'}}
              />
            </View>
            <Text style={{fontSize: 15}}>Street Address 1</Text>
            <View style={styles.rowInput}>
              <Input
                name="streetAddress1"
                value={this.state.streetAddress1}
                onChangeText={(streetAddress1) => this.setState({streetAddress1, error: null})}
              />
            </View>
            <Text style={{fontSize: 15}}>Street Address 2</Text>
            <View style={styles.rowInput}>
              <Input
                name="streetAddress2"
                value={this.state.streetAddress2}
                onChangeText={(streetAddress2) => this.setState({streetAddress2, error: null})}
              />
            </View>
            <Text style={{fontSize: 15}}>City</Text>
            <View style={styles.rowInput}>
              <Input
                name="city"
                value={this.state.city}
                onChangeText={(city) => this.setState({city, error: null})}
              />
            </View>
            <Text style={{fontSize: 15, paddingRight: 165}}>State</Text>
            <View style={[styles.rowInput, {paddingTop: 15}]}>
              <TPickerModal
                items={items}
                modalTitle="State"
                name="state"
                changeItem={this.handleChangeValue}
                buttonFontSize={14}
              />
            </View>
            <Text style={{fontSize: 15}}>Zip code</Text>

            {/*<View style={{flex: 1, flexDirection: 'row'}}>*/}
            {/*  <View style={{width: 200, paddingRight: 30}}>*/}
            {/*    <MultiSelect*/}
            {/*      items={items}*/}
            {/*      uniqueKey="id"*/}
            {/*      onSelectedItemsChange={(state) => {*/}
            {/*        this.setState({state, error: null});*/}
            {/*      }}*/}
            {/*      selectedItems={this.state.state}*/}
            {/*      selectText={this.state.state[0]}*/}
            {/*      single={true}*/}
            {/*      searchInputPlaceholderText="Search Items..."*/}
            {/*      fontFamily='Interstate-Regular'*/}
            {/*      tagRemoveIconColor='rgb(102, 102, 102)'*/}
            {/*      tagBorderColor='rgb(102, 102, 102)'*/}
            {/*      tagTextColor='rgb(102, 102, 102)'*/}
            {/*      selectedItemTextColor='rgb(102, 102, 102)'*/}
            {/*      selectedItemIconColor='rgb(102, 102, 102)'*/}
            {/*      itemTextColor='rgb(102, 102, 102)'*/}
            {/*      searchInputStyle={{color: 'rgb(102, 102, 102)'}}*/}
            {/*      submitButtonColor='rgb(102, 102, 102)'*/}
            {/*      submitButtonText="Submit"*/}
            {/*    />*/}
            {/*  </View>*/}
            <View style={styles.rowInput}>
              <Input
                name="zip"
                keyboardType="number-pad"
                returnKeyType="done"
                value={this.state.zip}
                onChangeText={(zip) => this.setState({zip, error: null})}
              />
            </View>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={{fontSize: 15}}>US Dot #</Text>
              {/*{!!this.state.error &&*/}
              {/*<Text style={{fontSize: 15, color: 'red'}} visible={!!this.state.error}>{this.state.error}</Text>}*/}
            </View>
            <View style={styles.rowInput}>
              <Input
                name="dotNum"
                keyboardType="number-pad"
                returnKeyType="done"
                placeholder=""
                value={this.state.dotNumber}
                autoCapitalize='none'
                onChangeText={(dotNumber) => this.setState({dotNumber})}
              />
            </View>
            {/*<View style={{paddingTop: 23}}>*/}
            {/*  <View style={{flexDirection: 'row'}}>*/}
            {/*    <CheckBox*/}
            {/*      center*/}
            {/*      containerStyle={{padding: 0}}*/}
            {/*      checked={this.state.isCompanyOwner}*/}
            {/*      onPress={() => this.setState({isCompanyOwner: !this.state.isCompanyOwner})}*/}
            {/*    />*/}
            {/*    <Text style={{paddingTop: 8, paddingRight: 40}}>I own this company*/}
            {/*    </Text>*/}
            {/*  </View>*/}
            {/*</View>*/}
            {/*<View style={{paddingTop: 10}}>*/}
            {/*  <View style={{flexDirection: 'row'}}>*/}
            {/*    <CheckBox*/}
            {/*      center*/}
            {/*      containerStyle={{padding: 0}}*/}
            {/*      checked={this.state.isCompanyDriver}*/}
            {/*      onPress={() => this.setState({isCompanyDriver: !this.state.isCompanyDriver})}*/}
            {/*    />*/}
            {/*    <Text style={{paddingTop: 8, paddingRight: 40}}>I drive for this company*/}
            {/*    </Text>*/}
            {/*  </View>*/}
            {/*</View>*/}
            {/*<View style={{paddingTop: 10}}>*/}
            {/*  <View style={{flexDirection: 'row'}}>*/}
            {/*    <CheckBox*/}
            {/*      center*/}
            {/*      containerStyle={{padding: 0}}*/}
            {/*      checked={this.state.isCompanyDispatcher}*/}
            {/*      onPress={() => this.setState({isCompanyDispatcher: !this.state.isCompanyDispatcher})}*/}
            {/*    />*/}
            {/*    <Text style={{paddingTop: 8, paddingRight: 40}}>I dispatch for this company*/}
            {/*    </Text>*/}
            {/*  </View>*/}
            {/*</View>*/}
          </View>
        </View>
      </React.Fragment>
    );
  }

  renderDriverLicenseForm() {
    const items = this.state.all_states;
    return (
      <React.Fragment>
        <View style={styles.signUpPageTitle}>
          <Text style={{fontSize: 20}}>CDL</Text>
        </View>
        <View style={styles.signUpFormPad}>
          {/*{!!this.state.error &&*/}
          {/*<TAlert visible={!!this.state.error} alertText={(!!this.state.error ? this.state.error : '')}/>}*/}
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

  renderEmailValidationForm() {
    return (
      <React.Fragment>
        <View>
          <View style={styles.signUpPageTitle}>
            <Text style={{fontSize: 20}}>Email Validation</Text>
          </View>
          <View style={styles.signUpPageBody}>
            <Text style={{fontSize: 15, paddingBottom: 30}}>
              We sent an email containing a 6-digit code.
              Please enter the code below to verify your email.
            </Text>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={{fontSize: 15, paddingBottom: 10}}>Verification code</Text>
              {!!this.state.error &&
              <Text style={{fontSize: 15, color: 'red', width: 200, paddingLeft: 20}}
                    visible={!!this.state.error}>{this.state.error}</Text>}
            </View>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
              <Input
                name="emailVerification"
                containerStyle={{width: 120}}
                value={this.state.verificationCodeEmail}
                onChangeText={(verificationCodeEmail) => this.setState({verificationCodeEmail, error: null})}
              />
              <Button
                title='Send Again'
                type='outline'
                onPress={this.resendEmailVerification}
                buttonStyle={{backgroundColor: 'transparent', borderColor: 'transparent'}}
              />
            </View>
          </View>
        </View>
      </React.Fragment>
    );
  }

  renderCOIForm() {
    const {step} = this.state;
    return (
      <React.Fragment>
        <View style={styles.signUpPageTitle}>
          <Text style={{fontSize: 20}}>Carrier Documentation</Text>
        </View>

        <View style={styles.signUpPageBody}>
          <View>
            <Text style={{fontSize: 15, paddingBottom: 20}}>
              In order to ACTIVATE you account, you will need to provide
              the information:
            </Text>
            <Text style={{fontSize: 15}}>Certificate of Insurance (COI) (optional)</Text>
          </View>
          {/*<Button*/}
          {/*  title="UPLOAD INSURANCE CERTIFICATE"*/}
          {/*  titleStyle={{fontSize: 15}}*/}
          {/*  containerStyle={{paddingTop: 15}}*/}
          {/*  // onPress={this.createCognitoAccount} upload photo*/}
          {/*  icon={*/}
          {/*    <Icon*/}
          {/*      name="download"*/}
          {/*      size={15}*/}
          {/*      color="white"*/}
          {/*      style={{paddingRight: 6}}*/}
          {/*    />*/}
          {/*  }*/}
          {/*/>*/}
          {/*<Button*/}
          {/*  title="TAKE PHOTO OF INSURANCE"*/}
          {/*  titleStyle={{fontSize: 15}}*/}
          {/*  containerStyle={{paddingTop: 7}}*/}
          {/*  // onPress={this.createCognitoAccount} upload photo*/}
          {/*  icon={*/}
          {/*    <Icon*/}
          {/*      name="camera"*/}
          {/*      size={15}*/}
          {/*      color="white"*/}
          {/*      style={{paddingRight: 6}}*/}
          {/*    />*/}
          {/*  }*/}
          {/*/>*/}
          {this.renderMultiUploader()}
        </View>
      </React.Fragment>
    );
  }

  renderAccountCreateSuccess() {
    const {coiUploaded} = {...this.state};
    let message = 'Thank you for signing up for Trelar. Your account is now in review.\n\n' +
      'This normally takes 1-2 business days. If you have any questions, you can email us at csr@trelar.com.\n\n' +
      'Thank you.\n';
    if (!coiUploaded) {
      message = 'Thank you for signing up for Trelar.\n\nTo complete your registration, please log in to the' +
        'app with your email or phone number to upload your COI.\n\nIf you have any questions, you can email us at csr@trelar.com.\n' +
        '\nThank you.\n';
    }
    return (
      <React.Fragment>
        <View style={styles.signUpPageBody}>
          <Text style={{fontSize: 15, paddingBottom: 20}}>
            {message}
          </Text>
        </View>
      </React.Fragment>
    );
  }

  renderMultiUploader() {
    const {startUpload, accessToken, idToken, step} = this.state;
    return (
      <View style={styles.mtFifteen}>
        <TMultiImageUploader
          buttonTitle={translate('SELECT IMAGE')}
          cameraTitle={translate('TAKE PHOTO')}
          startUpload={startUpload}
          imagesUploadedHandler={this.updateCoiAttachments}
          isServersideUpload={true}
          accessToken={accessToken}
          idToken={idToken}
          hide={step !== 7}
        />
      </View>
    );
  }

  renderFooterButtons() {
    const { step, termsChecked, isHandlingNext, startUpload } = this.state;
    return (
      <View style={styles.footerButtons}>
        <View style={{flex: 1, flexDirection: 'row', justifyContent: step === 8 ? 'flex-end' : 'space-between'}}>
          {(step === 1
          || step === 4
          || step === 5
          || step === 6)
            &&
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
          {step !== 8 &&
          <Text style={{paddingTop: 15, paddingRight: 15, paddingLeft: 15}}>{`Step ${step} of ${7}`}</Text>
          }
          <Button
            title={step === 8 ? 'Ok' : 'Next'}
            iconRight={true}
            disabled={(step === 3 && !termsChecked) || (isHandlingNext || startUpload) }
            onPress={step === 8 ? this.handleFinishedOnboarding : this.handleNext}
            loading={ isHandlingNext || startUpload }
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
    const {step} = this.state;

    return (
      <React.Fragment>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{flex: 1, backgroundColor: 'rgb(230, 230, 225)'}}>
          <View style={{marginTop: 20}}>
            {(step === 1) &&
            <View style={{flex: 1}}>
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null}>
                <KeyboardAwareScrollView
                  onContentSizeChange={this.onContentSizeChange}
                  keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                  enableOnAndroid
                >
                  {this.renderCognitoExistsModal()}
                  {this.renderCognitoSignUpPage()}
                  {this.renderFooterButtons()}
                </KeyboardAwareScrollView>
              </KeyboardAvoidingView>
            </View>
            }
            {step === 2 && this.renderPhoneVerificationForm()}
            {step === 3 && this.renderUserForm()}
            {step === 4 &&
            <View style={{flex: 1}}>
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null}>
                <KeyboardAwareScrollView
                  onContentSizeChange={this.onContentSizeChange}
                  keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                  enableOnAndroid={'true'}
                >
                  {this.renderCompanyAddressForm()}
                  {this.renderFooterButtons()}
                </KeyboardAwareScrollView>
              </KeyboardAvoidingView>
            </View>
            }
            {step === 5 && this.renderDriverLicenseForm()}
            {step === 6 && this.renderEmailValidationForm()}
            {step === 7 && this.renderCOIForm()}
            {step === 8 && this.renderAccountCreateSuccess()}
            {(step !== 1 && step !== 4) && this.renderFooterButtons()}

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
    return (
      <ThemeProvider theme={theme}>
        {isLoading &&
        <View style={{flex: 1, padding: 20, backgroundColor: 'rgb(230,230,225)', justifyContent: 'center'}}>
          <ActivityIndicator size="large"/>
        </View>
        }
        {!isLoading && this.renderPage()}
      </ThemeProvider>
    );
  }
}

CarrierSignUp.propTypes = {
  onBackToLogInMain: PropTypes.func
};

CarrierSignUp.defaultProps = {
  authData: {},
  authState: 'signUp',
  onBackToLogInMain: () => {}
};

export default CarrierSignUp;
