import React, {Component} from 'react';
// import {Link} from 'react-router-native';
import {
  View,
  ScrollView,
  Dimensions,
  Text,
  TextInput,
  Picker,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  TouchableHighlight
} from 'react-native';
import {Input} from 'react-native-elements';
import MultiSelect from 'react-native-quick-select';
import {Button} from 'react-native-elements';
import { SwipeListView } from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/FontAwesome';
import Amplify from 'aws-amplify-react-native';
import {Auth} from 'aws-amplify';
import moment from 'moment-timezone';
import CloneDeep from 'lodash.clonedeep';
// import AgentService from '../api/AgentService';
import ProfileService from '../../api/ProfileService';
import CompanyService from '../../api/CompanyService';
import UserService from '../../api/UserService';
import LookupsService from '../../api/LookupsService';
import AddressService from '../../api/AddressService';
import NotificationSettings from './NotificationSettings';
import UserSettingsService from '../../api/UserSettingsService';
// import I18n from "react-native-i18n";
import {translate} from "../../i18n";
import GPSTrackingService from '../../api/GPSTrackingService';
import SecuritySettings from './SecuritySettings';

const {
  width,
  height
} = Dimensions.get('window');

class UserSettings extends Component {
  constructor(props) {
    super(props);
    const user = {
      companyId: '',
      firstName: '',
      lastName: '',
      email: '',
      mobilePhone: '',
      phone: '',
      managerId: '',
      isBanned: 0,
      rating: '',
      driverId: '',
      preferredLanguage: '',
      userStatus: ''
    };

    this.state = {
      modal: false,
      activeTab: '1',
      screenHeight: 0,
      loaded: false,
      ...user,
      address: [],
      languages: [],
      states: [],
      timeZones: [],
      timeZone: '',
      isFirstNameValid: true,
      isLastNameValid: true,
      isMobilePhoneValid: true,
      hideOldPassword: true,
      hideNewPassword: true,
      hideConfirmationPassword: true,
      oldPassword: '',
      newPassword: '',
      passwordConfirmation: '',
      isOldPasswordValid: true,
      isNewPasswordValid: true,
      isPasswordConfirmationValid: true
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.saveUser = this.saveUser.bind(this);
  }

  async componentDidMount() {
    try {
      const profile = await ProfileService.getProfile();
      const user = await UserService.getUserById(profile.userId);
      const company = await CompanyService.getCompanyById(profile.companyId);
      const address = await AddressService.getAddressById(company.addressId);
      const timeZones = [];
      let selectedTimeZone = '';

      const {timeZone} = profile;
      if (timeZone === null || timeZone.length === 0) {
        selectedTimeZone = 'Auto';
        timeZones.push({
          id: 'Auto',
          name: `Automatic: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`
        });
      } else {
        selectedTimeZone = timeZone;
        timeZones.push({
          id: 'Auto',
          name: `Automatic: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`
        });
      }

      // Each one of the following time zones have one or more IANA time
      // zone identifiers which work in the same way as each other, we
      // will be saving the first/most important one to the database.
      // Ref for Easter Time: https://time.is/en/ET
      // TODO: move to Lookups table
      const easternTime = {
        id: 'America/Detroit',
        name: `Eastern Time - ${moment().tz('America/Detroit').format('z')}`
      };
      timeZones.push(easternTime);
      const centralTime = {
        id: 'America/Chicago',
        name: `Central Time - ${moment().tz('America/Chicago').format('z')}`
      };
      timeZones.push(centralTime);
      const mountainTime = {
        id: 'America/Denver',
        name: `Mountain Time - ${moment().tz('America/Denver').format('z')}`
      };
      timeZones.push(mountainTime);
      const pacificTime = {
        id: 'America/Los_Angeles',
        name: `Pacific Time - ${moment().tz('America/Los_Angeles').format('z')}`
      };
      timeZones.push(pacificTime);
      const alaskaTime = {
        id: 'America/Juneau',
        name: `Alaska Time - ${moment().tz('America/Juneau').format('z')}`
      };
      timeZones.push(alaskaTime);
      const hawaiiTime = {
        id: 'Pacific/Honolulu',
        name: `Hawaii Time - ${moment().tz('Pacific/Honolulu').format('z')}`
      };
      timeZones.push(hawaiiTime);

      await this.fetchUser(user);
      await this.fetchLookups();
      this.setState({
        user,
        address,
        timeZones,
        timeZone: selectedTimeZone,
        profile,
        loaded: true
      });
    } catch (e) {
      // console.error(e);
    }
  }

  onContentSizeChange = (contentWidth, contentHeight) => {
    this.setState({
      screenHeight: contentHeight
    });
  }

  async fetchUser(userProps) {
    const user = userProps;
    Object.keys(user)
      .map((key) => {
        if (user[key] === null) {
          user[key] = '';
        }
        return true;
      });
      this.setState({
        ...user,
    });
  }

  async fetchLookups() {
    const lookups = await LookupsService.getLookups();

    let languages = [];
    let states = [];
    let timeZones = [];
    Object.values(lookups)
      .forEach((itm) => {
        if (itm.key === 'Language') languages.push(itm);
        if (itm.key === 'States') states.push(itm);
        if (itm.key === 'TimeZone') timeZones.push(itm);
      });
    languages = languages.map(language => ({
      id: String(language.val1),
      name: language.val1
    }));
    states = states.map(state => ({
      id: String(state.val2),
      name: state.val1
    }));
    timeZones = timeZones.map(timeZone => ({
      id: String(timeZone.val2),
      name: timeZone.val1
    }));
    this.setState({
      languages,
      states/*,
      timeZones*/
    });
  }

  toggleModal(visible) {
    this.setState({ modal: visible });
 }

  handleInputChange(name, value) {
    const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);
    this.setState({
      [name]: value,
      [`is${nameCapitalized}Valid`]: true
    });
  }

  isFormValid() {
    let {
      firstName,
      lastName,
      mobilePhone
    } = this.state;
    let {
      isFirstNameValid,
      isLastNameValid,
      isMobilePhoneValid
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

    if (mobilePhone === null || mobilePhone.length === 0) {
      isMobilePhoneValid = false;
      isValid = false;
    }

    this.setState({
      isFirstNameValid,
      isLastNameValid,
      isMobilePhoneValid
    });
    if (isValid) {
      return true;
    }

    return false;
  }

  async saveUser() {
    if (!this.isFormValid()) {
      Alert.alert(
        "Form error",
        "Required fields missing.",
        [
          { text: "OK" }
        ],
        { cancelable: false }
      );
      return;
    }

    const {timeZone, profile} = this.state;
    let user = CloneDeep(this.state);


    let selectedTimeZone = '';
    if (timeZone === 'Auto') {
      selectedTimeZone = '';
    } else {
      selectedTimeZone = timeZone;
    }

    user.companyId = Number(user.companyId);
    user.userStatus = user.userStatus;

    delete user.user;
    delete user.loaded;
    delete user.languages;
    delete user.isFirstNameValid;
    delete user.isLastNameValid;
    delete user.isMobilePhoneValid;
    delete user.totalUsers;

    if (user && user.id) {
      user.modifiedOn = moment.utc().format();
      try {
        await UserService.updateUser(user);
        const newTimeZone = {
          userId: profile.userId,
          key: 'timeZone',
          value: selectedTimeZone,
          createdOn: moment.utc().format(),
          createdBy: profile.userId,
          modifiedOn: moment.utc().format(),
          modifiedBy: profile.userId
        };
        await UserSettingsService.updateUserTimeZone(newTimeZone);

        this.props.screenProps.setLanguage(user.preferredLanguage);
        this.props.screenProps.setReloadJobs(true);
        this.props.screenProps.setReloadMarketplace(true);
        this.props.screenProps.setReloadLoads(true);
        Alert.alert(
          "User updated",
          "The user information has beeen correctly updated.",
          [
            { text: "OK" }
          ],
          { cancelable: false }
        );
      } catch (err) {
        // console.log(err);
        Alert.alert(
          "Error",
          "Something went wrong...",
          [
            { text: "OK" }
          ],
          { cancelable: false }
        );
      }
    }
  }

  async changeUserPassword() {
    const { oldPassword, newPassword, passwordConfirmation } = this.state;
    let {
      isOldPasswordValid,
      isNewPasswordValid,
      isPasswordConfirmationValid
    } = this.state;
    let isValid = true;

    if (oldPassword === null || oldPassword.length === 0) {
      isOldPasswordValid = false;
      isValid = false;
    }

    if (newPassword === null || newPassword.length === 0) {
      isNewPasswordValid = false;
      isValid = false;
    }

    if (passwordConfirmation === null || passwordConfirmation.length === 0
      || passwordConfirmation !== newPassword) {
      isPasswordConfirmationValid = false;
      isValid = false;
    }
    this.setState({
      isOldPasswordValid,
      isNewPasswordValid,
      isPasswordConfirmationValid
    });
    if (isValid) {
      try {
        await Auth.currentAuthenticatedUser()
          .then(user => Auth.changePassword(user, oldPassword, newPassword))
          .then(() => {
            this.toggleModal(false);
            Alert.alert(
              "Password updated",
              "Your password has been updated successfully...",
              [
                { text: "OK" }
              ],
              { cancelable: false }
            );
          })
          .catch((error) => {
            // console.log(error);
            Alert.alert(
              error.message,
              "There was an error. Please try again...",
              [
                { text: "OK" }
              ],
              { cancelable: false }
            );
          });
      } catch (e) {
        Alert.alert(
          "Error!",
          "Please try again after some time...",
          [
            { text: "OK" }
          ],
          { cancelable: false }
        );
      }
      this.setState({
        oldPassword: '',
        newPassword: '',
        passwordConfirmation: ''
      });
      return true;
    }

    return false;
  }

  renderResetPasswordModal() {
    const {
      hideOldPassword,
      hideNewPassword,
      hideConfirmationPassword,
      oldPassword,
      newPassword,
      passwordConfirmation,
      isOldPasswordValid,
      isNewPasswordValid,
      isPasswordConfirmationValid } = this.state;
    return(
      <Modal
        animationType={"slide"}
        transparent
        visible={this.state.modal}
        onRequestClose = {() => { console.log("Modal has been closed.") } }>

        <View style={styles.modal}>
          <View style={styles.card}>
            <Text style={styles.title}>
              Change Password
            </Text>
            <Text style={styles.label}>Current Password</Text>
            <Input
              containerStyle={{paddingLeft: 0, paddingRight: 0}}
              inputContainerStyle={styles.inputContainer}
              inputStyle={styles.input}
              name="oldPassword"
              type={hideOldPassword ? 'password' : 'text'}
              autoCapitalize="none"
              secureTextEntry={hideOldPassword}
              value={oldPassword}
              onChangeText={(value) => this.handleInputChange("oldPassword", value)}
              rightIcon={(
                <Icon
                  style={hideOldPassword ? styles.eye : styles.eyeActive}
                  name="eye"
                  size={24}
                  onPress={() => this.setState({ hideOldPassword: !hideOldPassword })}
                />
              )}
              rightIconContainerStyle={
                hideOldPassword ? styles.eyeContainer : styles.eyeContainerActive
              }
            />
            {
            !isOldPasswordValid
            ? (
              <Text style={styles.errorMessage}>
                * Please enter your current password.
              </Text>
              )
            : null
            }
            <Text style={styles.label}>New Password</Text>
            <Input
              containerStyle={{paddingLeft: 0, paddingRight: 0}}
              inputContainerStyle={styles.inputContainer}
              inputStyle={styles.input}
              name="newPassword"
              type={hideNewPassword ? 'password' : 'text'}
              autoCapitalize="none"
              secureTextEntry={hideNewPassword}
              value={newPassword}
              onChangeText={(value) => this.handleInputChange("newPassword", value)}
              rightIcon={(
                <Icon
                  style={hideNewPassword ? styles.eye : styles.eyeActive}
                  name="eye"
                  size={24}
                  onPress={() => this.setState({ hideNewPassword: !hideNewPassword })}
                />
              )}
              rightIconContainerStyle={
                hideNewPassword ? styles.eyeContainer : styles.eyeContainerActive
              }
            />
            {
            !isNewPasswordValid
            ? (
              <Text style={styles.errorMessage}>
                * Please enter your new password.
              </Text>
              )
            : null
            }
            <Text style={styles.label}>Confirm New Password</Text>
            <Input
              style={{fontSize: 10}}
              containerStyle={{paddingLeft: 0, paddingRight: 0}}
              inputContainerStyle={styles.inputContainer}
              inputStyle={styles.input}
              name="passwordConfirmation"
              type={hideConfirmationPassword ? 'password' : 'text'}
              autoCapitalize="none"
              secureTextEntry={hideConfirmationPassword}
              value={passwordConfirmation}
              onChangeText={(value) => this.handleInputChange("passwordConfirmation", value)}
              rightIcon={(
                <Icon
                  style={hideConfirmationPassword ? styles.eye : styles.eyeActive}
                  name="eye"
                  size={24}
                  onPress={() => this.setState({ hideConfirmationPassword: !hideConfirmationPassword })}
                />
              )}
              rightIconContainerStyle={
                hideConfirmationPassword ? styles.eyeContainer : styles.eyeContainerActive
              }
            />
            {
            !isPasswordConfirmationValid
            ? (
              <Text style={styles.errorMessage}>
                * Passwords don't match.
              </Text>
              )
            : null
            }
            <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginTop: 32}}>
              <View style={{flexDirection: 'column', paddingRight:8}}>
                <Button
                  title={'Cancel'}
                  buttonStyle={{backgroundColor: '#B8B8B8', width: 100}}
                  onPress={() => {
                    this.toggleModal(!this.state.modal);
                    this.setState({
                      oldPassword: '',
                      newPassword: '',
                      passwordConfirmation: ''
                    });
                  }}
                  >
                </Button>
              </View>
              <View style={{flexDirection: 'column', width: 100}}>
                <Button
                  raised
                  title={'Save'}
                  buttonStyle={{
                    width: 100,
                    backgroundColor: '#006F54'
                  }}
                  onPress={() => this.changeUserPassword()}
                >
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  renderForm() {
    let {
      address,
      languages,
      states,
      timeZone,
      timeZones,
      firstName,
      lastName,
      email,
      mobilePhone,
      preferredLanguage,
      isFirstNameValid,
      isLastNameValid,
      isMobilePhoneValid
    } = this.state;
    const {profile} = this.state;
    let selectedState = states.find(x => x.id === address.state);
    // TODO: sometimes address state is shorthand and longhand, need to ensure that they are one or the other,
    //  this function excepts shorthand, I've put in a hotfix for now if it shows up as longhand.
    return (
      <React.Fragment>
        {this.renderResetPasswordModal()}
        <View style={styles.form}>
          <View>
            <Text style={styles.title}>
              {translate('Personal Profile')}
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
                * Please enter First name.
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
                * Please enter Last name.
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
            onChangeText={(value) => this.handleInputChange("mobilePhone", value)}
          />
          {
            !isMobilePhoneValid
            ? (
              <Text style={styles.errorMessage}>
                * Please enter Mobile Phone.
              </Text>
              )
            : null
            }
          <Text style={styles.label}>{translate('Work Phone')}</Text>
          <TextInput
            style={[styles.textInput, {paddingLeft: 16}]}
            name="name"
            type="text"
            autoCapitalize='none'
            onChangeText={(value) => this.handleInputChange("phone", value)}
          />
          <Text style={styles.label}>{translate('Address #1')}</Text>
          <TextInput
            style={[styles.disabledTextInput, {paddingLeft: 16}]}
            name="address1"
            type="text"
            value={address.address1}
            editable={false}
            autoCapitalize='none'
            onChangeText={(value) => this.handleInputChange("address1", value)}
          />
          <Text style={styles.label}>{translate('Address #2')}</Text>
          <TextInput
            style={[styles.disabledTextInput, {paddingLeft: 16}]}
            name="address2"
            type="text"
            value={address.address2}
            editable={false}
            autoCapitalize='none'
            onChangeText={(value) => this.handleInputChange("address2", value)}
          />
          <Text style={styles.label}>{translate('City')}</Text>
          <TextInput
            style={[styles.disabledTextInput, {paddingLeft: 16}]}
            name="city"
            type="text"
            value={address.city}
            editable={false}
            autoCapitalize='none'
            onChangeText={(value) => this.handleInputChange("city", value)}
          />
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between',}}>
            <View style={{flex: 4, flexDirection: 'column', paddingRight:8}}>
            <Text style={styles.label}>{translate('State')}</Text>
            <TextInput
                style={[styles.disabledTextInput, {paddingLeft: 16}]}
                name="state"
                type="text"
                autoCapitalize='none'
                value={selectedState ? selectedState.name : ''}
                editable={false}
                onChangeText={(value) => this.handleInputChange("state", value)}
              />
            </View>
            <View style={{flex: 4, flexDirection: 'column'}}>
              <Text style={styles.label}>{translate('Zip Code')}</Text>
              <TextInput
                style={[styles.disabledTextInput, {paddingLeft: 16}]}
                name="zipCode"
                type="text"
                autoCapitalize='none'
                value={address.zipCode}
                editable={false}
                onChangeText={(value) => this.handleInputChange("zipCode", value)}
              />
            </View>
          </View>
          <Text style={styles.label}>{translate('Time Zone')}</Text>
          <MultiSelect
            items={timeZones}
            uniqueKey="id"
            onSelectedItemsChange={(item) => {
              this.setState({ timeZone: item[0] })
            }}
            fixedHeight={false}
            selectedItems={[timeZone]}
            selectText={timeZone}
            single={true}
            searchInputPlaceholderText="Select time zone..."
            fontFamily='Interstate-Regular'
            tagRemoveIconColor='rgb(102, 102, 102)'
            tagBorderColor='rgb(102, 102, 102)'
            textColor='#000'
            tagTextColor='#000'
            selectedItemTextColor='#000'
            selectedItemIconColor='rgb(102, 102, 102)'
            itemTextColor='#000'
            searchInputStyle={{color: 'rgb(102, 102, 102)'}}
            submitButtonColor='rgb(102, 102, 102)'
            submitButtonText="Submit"
          />
          <Text style={styles.label}>{translate('Preferred Language')}</Text>
          <MultiSelect
            items={languages}
            uniqueKey="id"
            onSelectedItemsChange={(item) => {
              this.setState({ preferredLanguage: item[0] })
            }}
            fixedHeight={false}
            selectedItems={[preferredLanguage]}
            selectText={preferredLanguage}
            single={true}
            searchInputPlaceholderText="Search language..."
            fontFamily='Interstate-Regular'
            tagRemoveIconColor='rgb(102, 102, 102)'
            tagBorderColor='rgb(102, 102, 102)'
            textColor='#000'
            tagTextColor='#000'
            selectedItemTextColor='#000'
            selectedItemIconColor='rgb(102, 102, 102)'
            itemTextColor='#000'
            searchInputStyle={{color: 'rgb(102, 102, 102)'}}
            submitButtonColor='rgb(102, 102, 102)'
            submitButtonText="Submit"
          />
          {
            profile.isAdmin
            && (
              <React.Fragment>
                <Text style={[styles.label]}>{translate('Email')}</Text>
                <Text style={{color: '#000', fontSize: 16}}>
                  {email}
                </Text>
              </React.Fragment>
              )
            }
          <Button
            title={translate('Change Password')}
            buttonStyle={{backgroundColor: '#FF6E00', marginTop: 16}}
            onPress={() => this.toggleModal(true)}
          >
          </Button>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-end', marginTop: 32}}>
            <View style={{flexDirection: 'column', paddingRight:8}}>
              <Button
                title={translate('Cancel')}
                buttonStyle={{backgroundColor: '#B8B8B8', width: 100}}
                onPress={() => {
                  this.props.navigation.navigate('HomeScreen');
                  // this.props.screenProps.setBackButtonTitle("Job Dashboard");
                }}
                >
              </Button>
            </View>
            <View style={{flexDirection: 'column', width: 100}}>
              <Button
                raised
                title={translate('Save')}
                buttonStyle={{
                  width: 100,
                  backgroundColor: '#006F54'
                }}
                onPress={this.saveUser}
              >
              </Button>
            </View>
          </View>

        </View>
      </React.Fragment>
    );
  }

  renderNotifications() {
    const {user, profile} = this.state;
    return(
      <React.Fragment>
        <NotificationSettings
          profile={profile}
          user={user}
          navigation={this.props.navigation}
        />
      </React.Fragment>
    );
  }

  renderSecurity() {
    return <SecuritySettings />
  }

  renderTabs() {
    const { activeTab } = this.state;
    return(
      <View style={styles.tabNav}>
        <TouchableOpacity
          style={activeTab == '1' ? styles.activeTab : styles.tab}
          onPress={() => this.setState({ activeTab: '1' })}
        >
          <Text style={activeTab == '1' ? {color: '#348A74'} : null}>{translate('PROFILE')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={activeTab == '2' ? styles.activeTab : styles.tab}
          onPress={() => this.setState({ activeTab: '2' })}
        >
          <Text style={activeTab == '2' ? {color: '#348A74'} : null}>{translate('NOTIFICATIONS')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={activeTab == '3' ? styles.activeTab : styles.tab}
          onPress={() => this.setState({ activeTab: '3' })}
        >
          <Text style={activeTab == '3' ? {color: '#348A74'} : null}>{translate('SECURITY')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    const { loaded, activeTab } = this.state;
    const scrollEnabled = this.state.screenHeight > height;
    if (loaded) {
      return (
        <View style={{flex: 1, backgroundColor: '#E7E7E2'}}>
          {this.renderTabs()}
          <ScrollView
            onContentSizeChange={this.onContentSizeChange}
          >
            { activeTab === '1' && this.renderForm() }
            { activeTab === '2' && this.renderNotifications() }
            { activeTab === '3' && this.renderSecurity() }
          </ScrollView>
        </View>
      );
    }
    return (
      <View style={{flex: 1, padding: 20, backgroundColor: 'rgb(230,230,225)', justifyContent: 'center'}}>
        <ActivityIndicator size="large"/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
		justifyContent: 'center',
		width: width,
		height: height
  },
  tabNav: {
    flexDirection: 'row',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3
  },
  activeTab: {
    backgroundColor: '#FFF',
    height:40,
    width: (width/3),
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: '#348A74',
    borderBottomWidth: 3
  },
  tab: {
    backgroundColor: '#FFF',
    height:40,
    width: (width/3),
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: '#8A8A8A',
    borderBottomWidth: 1
  },
  card: {
    width: width - 64,
    backgroundColor: '#E7E7E3',
    borderRadius: 5,
    padding: 16
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
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 16
  },
  eyeContainer: {
    marginLeft: 0,
    marginRight: -1.5,
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: -4,
    backgroundColor: '#CCC',
    borderBottomRightRadius: 2,
    borderTopRightRadius: 2
  },
  eyeContainerActive: {
    marginRight: -1.5,
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: -4,
    backgroundColor: 'rgb(0, 111, 83)',
    borderBottomRightRadius: 2,
    borderTopRightRadius: 2
  },
  eye: {
    color: '#666666'
  },
  eyeActive: {
    color: '#FFF'
  },
  inputContainer: {
    height: 40,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    backgroundColor: 'white',
    borderRadius: 2,
    paddingTop: 4
  }
});

export default UserSettings;
