import React, {Component} from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  Text,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity
} from 'react-native';
import {Button, Image, Input, ThemeProvider} from 'react-native-elements';
import CloneDeep from 'lodash.clonedeep';
import moment from 'moment';
import PropTypes from 'prop-types';
import ProfileService from '../api/ProfileService';
import UserService from '../api/UserService';
import DriverService from '../api/DriverService';
import CompanyService from '../api/CompanyService';

// import ConfigProperties from '../ConfigProperties';
import NavigationService from '../service/NavigationService';
import {translate} from "../i18n";
import UserManagementService from "../api/UserManagementService";

const {
  width,
  height
} = Dimensions.get('window');

class AddDriverForm extends Component {
  constructor(props) {
    super(props);

    const user = {
      companyId: 0,
      firstName: '',
      lastName: '',
      email: '',
      mobilePhone: '',
      isBanned: 0,
      userStatus: 'Driver Invited',
      createdBy: 0,
      createdOn: ''
    };

    this.state = {
      screenHeight: 0,
      ...user,
      isFirstNameValid: true,
      isLastNameValid: true,
      isMobilePhoneValid: true,
      mobilePhoneAlreadyExists: false,
      profile: [],
      loaded: false,
      loggedInUser: null,
      isLoading: false
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.saveUser = this.saveUser.bind(this);
  }


  async componentDidMount() {
    let {profile, loggedInUser} = {...this.state};
    try {
      profile = await ProfileService.getProfile();
      // const configObject = ConfigProperties.instance.getEnv();
      loggedInUser = await UserService.getUserById(profile.userId);
    } catch (err) {
      console.log(err);
    }
    this.setState({
      profile,
      loaded: true,
      loggedInUser
    });
  }

  onContentSizeChange = (contentWidth, contentHeight) => {
    this.setState({
      screenHeight: contentHeight
    });
  }

  handleInputChange(name, value) {
    switch (name) {
      case "mobilePhone":
        value = value.replace(/\D/g, '');
        this.setState({mobilePhoneAlreadyExists: false});
        if (value.length > 10) {
          return;
        }
      default:
        const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);
        this.setState({
          [name]: value,
          [`is${nameCapitalized}Valid`]: true
        });
    }
  }

  async isFormValid() {
    let {
      firstName,
      lastName,
      mobilePhone
    } = this.state;
    let {
      isFirstNameValid,
      isLastNameValid,
      isMobilePhoneValid,
      mobilePhoneAlreadyExists
    } = this.state;

    let isValid = true;

    if (firstName === null || firstName.length === 0) {
      isFirstNameValid = false;
      isValid = false;
    }

    if (lastName === null || lastName.length === 0) {
      isLastNameValid = false;
      isValid = false;
    }

    if (mobilePhone === null || mobilePhone.length < 10) {
      isMobilePhoneValid = false;
      isValid = false;
    }

    const phone_number = `+1${mobilePhone}`;
    let user;
    try {
      user = await UserService.getUserByMobile(phone_number);
    } catch (err) {
      console.error(err);
    }

    const userStatusRequest = {phone: phone_number, driverFlow: true};
    let userStatusResponse = false;
    try {
      userStatusResponse = await UserManagementService.findCognito(userStatusRequest);
    } catch (err) {
      console.log(err);
    }

    if (userStatusResponse || user.id) {
      mobilePhoneAlreadyExists = true;
      isValid = false;
    }

    this.setState({
      isFirstNameValid,
      isLastNameValid,
      isMobilePhoneValid,
      mobilePhoneAlreadyExists
    });
    return isValid;
  }

  async saveUser() {
    const {profile, loggedInUser} = {...this.state};
    this.setState({ isLoading: true });
    const isValid = await this.isFormValid();
    if (!isValid) {
      this.setState({ isLoading: false });
      Alert.alert(
        "Form Error",
        "Required fields missing or phone number already taken.",
        [
          {text: "OK"}
        ],
        {cancelable: false}
      );
      return;
    }

    // console.log('>> SAVING USER >>');

    let user = CloneDeep(this.state);
    user.companyId = profile.companyId;
    user.mobilePhone = `+1${user.mobilePhone}`;
    user.email = `${user.mobilePhone}refBy${loggedInUser.email}`;
    user.isEmailVerified = 0;
    user.isPhoneVerified = 0;
    user.preferredLanguage = 'English';
    user.createdBy = profile.userId;
    user.createdOn = moment.utc().format();

    delete user.screenHeight;
    delete user.loaded;
    delete user.languages;
    delete user.isFirstNameValid;
    delete user.isLastNameValid;
    delete user.isMobilePhoneValid;
    delete user.mobilePhoneAlreadyExists;
    delete user.totalUsers;
    delete user.company;
    delete user.profile;

    try {
      const response = await DriverService.createAndInviteDriver(user);
      if (response.user && response.driver) {
        user = response.user;
        const driver = response.driver;
        Alert.alert(
          "Invite Sent!",
          `Your invite to ${user.firstName} ${user.lastName} at phone number ${user.mobilePhone} was sent.`,
          [
            {
              text: "OK",
              onPress: () => {
                this.props.onSuccess({ ...user, driverStatus: driver.driverStatus });
                if (this.props.navigation) {
                  this.props.navigation.goBack()
                }
              }
            }
          ],
          {cancelable: false}
        );
      } else {
        Alert.alert(
          "Error",
          `Your invite to ${user.firstName} ${user.lastName} at phone number ${user.mobilePhone} had a problem. Please try again.`,
          [
            {text: "OK"}
          ],
          {cancelable: false}
        );
      }
      
    } catch (err) {
      // console.log(err);
      Alert.alert(
        "Error",
        `Your invite to ${user.firstName} ${user.lastName} at phone number ${user.mobilePhone} had a problem. Please try again.`,
        [
          {text: "OK"}
        ],
        {cancelable: false}
      );
    }
    this.setState({ isLoading: false });
    if(this.props.screenProps) {
      this.props.screenProps.setReloadDrivers(true);
    }
  }

  // remove non numeric
  phoneToNumberFormat(phone) {
    const num = Number(phone.replace(/\D/g, ''));
    return num;
  }

  // check format ok
  checkPhoneFormat(phone) {
    const phoneNotParents = String(this.phoneToNumberFormat(phone));
    const areaCode3 = phoneNotParents.substring(0, 3);
    const areaCode4 = phoneNotParents.substring(0, 4);
    if (areaCode3.includes('555') || areaCode4.includes('1555')) {
      return false;
    }
    return true;
  }

  render() {
    const {job, loaded, isLoading} = this.state;
    let {
      firstName,
      lastName,
      mobilePhone,
      isFirstNameValid,
      isLastNameValid,
      isMobilePhoneValid,
      mobilePhoneAlreadyExists
    } = this.state;

    const { toggleOverlay, isFirstDriverPage } = {...this.props};

    if (!loaded) {
      return (
        <View style={{flex: 1, padding: 20, backgroundColor: 'rgb(230,230,225)', justifyContent: 'center'}}>
          <ActivityIndicator size="large"/>
        </View>
      )
    }

    return (
      <View style={{flex: 1, backgroundColor: '#E7E7E2'}}>
        <ScrollView
          onContentSizeChange={this.onContentSizeChange}
        >
          <React.Fragment>
            <View style={styles.form}>
              <View>
                <Text style={styles.title}>
                  {translate('Invite Driver')}
                </Text>
              </View>
              <Text style={styles.label}>{translate('First Name')}</Text>
              <TextInput
                style={[styles.textInput, {paddingLeft: 16}]}
                name="firstName"
                type="text"
                value={firstName}
                autoCapitalize='none'
                onChangeText={(value) => this.handleInputChange("firstName", value)}
              />
              {
                !isFirstNameValid
                  ? (
                    <Text style={styles.errorMessage}>
                      * Please enter First Name
                    </Text>
                  )
                  : null
              }
              <Text style={styles.label}>{translate('Last Name')}</Text>
              <TextInput
                style={[styles.textInput, {paddingLeft: 16}]}
                name="lastName"
                type="text"
                value={lastName}
                autoCapitalize='none'
                onChangeText={(value) => this.handleInputChange("lastName", value)}
              />
              {
                !isLastNameValid
                  ? (
                    <Text style={styles.errorMessage}>
                      * Please enter Last Name
                    </Text>
                  )
                  : null
              }
              <Text style={styles.label}>{translate('Mobile Phone')}</Text>
              <TextInput
                style={[styles.textInput, {paddingLeft: 16}]}
                name="mobilePhone"
                type="text"
                value={mobilePhone}
                autoCapitalize='none'
                keyboardType='number-pad'
                returnKeyType="done"
                onChangeText={(value) => this.handleInputChange("mobilePhone", value)}
              />
              {
                !isMobilePhoneValid
                  ? (
                    <Text style={styles.errorMessage}>
                      * Please enter Mobile Phone
                    </Text>
                  )
                  : null
              }
              {
                mobilePhoneAlreadyExists
                  ? (
                    <Text style={styles.errorMessage}>
                      * Mobile phone is already taken
                    </Text>
                  )
                  : null
              }
              <View style={{flex: 1, flexDirection: 'row', alignContent: 'space-between', marginTop: 32}}>             
                  <View style={{flex: 1}}>
                    {
                      isFirstDriverPage && (
                        <TouchableOpacity
                          style={[styles.button, styles.actionOutlinedButton, {marginRight: 5}]}
                          onPress={() => toggleOverlay()}
                          >
                          <Text style={styles.buttonDarkText}>
                            &nbsp;{translate('Cancel')}&nbsp;
                          </Text>
                        </TouchableOpacity>
                      )
                    }                    
                  </View>
                  <View style={{flex: 1}}>
                    <TouchableOpacity
                      disabled={isLoading}
                      style={[styles.button, styles.actionButton, {marginLeft: 5}]}
                      onPress={this.saveUser}
                    >
                      <Text style={styles.buttonLightText}>
                        &nbsp;{translate('Send Invite')}&nbsp;
                      </Text>
                      {
                        isLoading && (<ActivityIndicator color="#FFF"/>)
                      }
                    </TouchableOpacity>
                  </View>                        
                </View>  
            </View>
          </React.Fragment>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 17,
    backgroundColor: 'rgb(207,227,232)',
    width: width,
    height: height
  },
  form: {
    marginTop: 16,
    marginLeft: 32,
    marginRight: 32,
    marginBottom: 16
  },
  title: {
    fontFamily: 'Interstate-Regular',
    textAlign: 'center',
    fontSize: 18,
    color: '#348A74',
    fontWeight: 'bold'
  },
  label: {
    color: '#717171',
    paddingTop: 16,
    paddingBottom: 4
  },
  textInput: {
    backgroundColor: '#FFF',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    height: 40,
    borderRadius: 3,
    paddingLeft: 5,
    color: '#000'
  },
  disabledTextInput: {
    backgroundColor: '#EAEAEA',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    height: 40,
    borderRadius: 3,
    paddingLeft: 5,
    color: '#000'
  },
  errorMessage: {
    fontSize: 12,
    color: '#D32F2F'
  },
  button: {
    height: 48,
    paddingLeft: 8,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderRadius: 2,
    borderColor: 'rgb(183,182,179)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 5,
  },
  actionButton: {
    backgroundColor: '#006F53',
    borderRadius: 5,
    borderWidth: 3,
    borderColor: '#FFF'
  },
  buttonLightText: {
    fontWeight: 'bold',
    color: '#FFF'
  },
  row: {
    flexDirection: 'row',
    marginTop: 16
  },
  actionOutlinedButton: {
    backgroundColor: '#FFF',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#006F53'
  },
  buttonDarkText: {
    fontWeight: 'bold',
    color: '#006F53'
  }
});

AddDriverForm.propTypes = {
  navigation: PropTypes.object,
  screenProps: PropTypes.object,
  onSuccess: PropTypes.func,
  toggleOverlay: PropTypes.func,
  isFirstDriverPage: PropTypes.bool
};

AddDriverForm.defaultProps = {
  navigation: null,
  screenProps: null,
  onSuccess: () => {},
  toggleOverlay: () => {},
  isFirstDriverPage: false
};

export default AddDriverForm;
