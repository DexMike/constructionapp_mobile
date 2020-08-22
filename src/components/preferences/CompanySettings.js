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
  Linking
} from 'react-native';
import MultiSelect from 'react-native-quick-select';
import {Button} from 'react-native-elements';
import { SwipeListView } from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/FontAwesome';
import Amplify from 'aws-amplify-react-native';
import {Auth} from 'aws-amplify';
import moment from 'moment';
import CloneDeep from 'lodash.clonedeep';
// import AgentService from '../api/AgentService';
import ProfileService from '../../api/ProfileService';
import CompanyService from '../../api/CompanyService';
import LookupsService from '../../api/LookupsService';
import AddressService from '../../api/AddressService';

import JobSettings from './JobSettings';
import {translate} from "../../i18n";

const {
  width,
  height
} = Dimensions.get('window');

class CompanySettings extends Component {

  constructor(props) {
    super(props);
    // const company = {
    //   id: 0,
    //   legalName: '',
    //   dba: '',
    //   addressId: '0',
    //   phone: '',
    //   url: '',
    //   fax: '',
    //   rating: 0,
    //   operatingRange: 0,
    //   type: '0'
    // };

    this.state = {
      activeTab: '1',
      screenHeight: 0,
      loaded: false,
      profile: null,
      states: [],
      timeZones: [],
      timeZone: 'AT',
      isLegalNameValid: true,
      isPhoneValid: true,
      isAddress1Valid: true,
      isCityValid: true,
      isStateValid: true,
      isZipCodeValid: true,
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.saveCompany = this.saveCompany.bind(this);
  }

  async componentDidMount() {
    try {
      const profile = await ProfileService.getProfile();
      let company = await CompanyService.getCompanyById(profile.companyId);
      let address = await AddressService.getAddressById(company.addressId);
      company = { ...this.setCompany(company) };
      address = this.setAddress(address);
      const lookups = await this.fetchLookups();
      this.setState({
        profile,
        address,
        ...address,
        ...company,
        company,
        states: lookups.states,
        timeZones: lookups.timeZones,
        loaded: true
      });
    } catch (error) {
      // consoleconsole.error(error);
    }
  }

  onContentSizeChange = (contentWidth, contentHeight) => {
    this.setState({
      screenHeight: contentHeight
    });
  }

  setCompany(companyProps) {
    const company = companyProps;
    Object.keys(company)
      .map((key) => {
        if (company[key] === null) {
          company[key] = '';
        }
        return true;
    });
    return company;
  }

  setAddress(addressProps) {
    const address = addressProps;
    Object.keys(address)
      .map((key) => {
        if (address[key] === null) {
          address[key] = '';
        }
        return true;
    });
    return address;
  }

  setCompanyInfo() {
    const { company } = this.state;
    const {
      legalName,
      phone,
      url,
      fax
    } = this.state;
    const newCompany = company;

    newCompany.legalName = legalName;
    newCompany.phone = phone;
    newCompany.url = url;
    newCompany.fax = fax;
    return newCompany;
  }

  setAddressInfo() {
    const { address } = this.state;
    const {
      address1,
      address2,
      city,
      state,
      zipCode,
      country
    } = this.state;
    const newAddress = address;

    newAddress.address1 = address1;
    newAddress.address2 = address2;
    newAddress.city = city;
    newAddress.state = state;
    newAddress.zipCode = zipCode;
    newAddress.country = country;
    return newAddress;
  }

  async fetchLookups() {
    const lookups = await LookupsService.getLookups();

    let states = [];
    let timeZones = [];
    Object.values(lookups)
      .forEach((itm) => {
        if (itm.key === 'States') states.push(itm);
        if (itm.key === 'TimeZone') timeZones.push(itm);
      });
    states = states.map(state => ({
      id: String(state.val2),
      name: state.val1
    }));
    timeZones = timeZones.map(timeZone => ({
      id: String(timeZone.val2),
      name: timeZone.val1
    }));

    return {
      states,
      timeZones
    };
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
      legalName,
      phone,
      address1,
      city,
      state,
      zipCode,
    } = this.state;
    let {
      isLegalNameValid,
      isPhoneValid,
      isAddress1Valid,
      isCityValid,
      isStateValid,
      isZipCodeValid
    } = this.state;
    let isValid = true;

    if (legalName === null || legalName.length === 0) {
      isLegalNameValid = false;
      isValid = false;
    }

    if (phone === null || phone.length === 0) {
      isPhoneValid = false;
      isValid = false;
    }

    if (address1 === null || address1.length === 0) {
      isAddress1Valid = false;
      isValid = false;
    }

    if (city === null || city.length === 0) {
      isCityValid = false;
      isValid = false;
    }

    if (state === null || state.length === 0) {
      isStateValid = false;
      isValid = false;
    }

    if (zipCode === null || zipCode.length === 0) {
      isZipCodeValid = false;
      isValid = false;
    }

    this.setState({
      isLegalNameValid,
      isPhoneValid,
      isAddress1Valid,
      isCityValid,
      isStateValid,
      isZipCodeValid
    });
    if (isValid) {
      return true;
    }

    return false;
  }

  async saveCompany() {
    if (!this.isFormValid()) {
      Alert.alert(
        "Form error",
        "Required fields missing.",
        [
          { text: "OK", onPress: () => console.log("OK Pressed") }
        ],
        { cancelable: false }
      );
      return;
    }

    const company = this.setCompanyInfo();
    const address = this.setAddressInfo();

    if (company && company.id) {
      company.modifiedOn = moment.utc().format();
      try {
        await CompanyService.updateCompany(company);
        await AddressService.updateAddress(address);
        Alert.alert(
          "Company updated",
          "The company information has beeen correctly updated.",
          [
            { text: "OK"}
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

  renderForm() {
    let {
      states,
      timeZones,
      legalName,
      url,
      phone,
      address1,
      address2,
      timeZone,
      city,
      state,
      zipCode,
      isLegalNameValid,
      isPhoneValid,
      isAddress1Valid,
      isCityValid,
      isStateValid,
      isZipCodeValid
    } = this.state;
    let selectedState = states.find(x => x.id === state);
    // TODO: sometimes address state is shorthand and longhand, need to ensure that they are one or the other,
    //  this function excepts shorthand, I've put in a hotfix for now if it shows up as longhand.
    return (
      <React.Fragment>
        <View style={styles.form}>
          <View>
            <Text style={styles.title}>
              Company Profile
            </Text>
          </View>
          <Text style={styles.label}>Company Name</Text>
          <TextInput
            style={[styles.textInput, {paddingLeft: 16}]}
            name="legalName"
            type="text"
            value={legalName}
            autoCapitalize='none'
            onChangeText={(value) => this.handleInputChange("legalName", value)}
          />
          {
            !isLegalNameValid
            ? (
              <Text style={styles.errorMessage}>
                * Please enter company name.
              </Text>
              )
            : null
          }
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={[styles.textInput, {paddingLeft: 16}]}
            name="phone"
            type="text"
            value={phone}
            autoCapitalize='none'
            onChangeText={(value) => this.handleInputChange("phone", value)}
          />
          {
            !isPhoneValid
            ? (
              <Text style={styles.errorMessage}>
                * Please enter phone number.
              </Text>
              )
            : null
            }
          <Text style={styles.label}>Address #1</Text>
          <TextInput
            style={[styles.textInput, {paddingLeft: 16}]}
            name="address1"
            type="text"
            value={address1}
            autoCapitalize='none'
            onChangeText={(value) => this.handleInputChange("address1", value)}
          />
          {
            !isAddress1Valid
            ? (
              <Text style={styles.errorMessage}>
                * Please enter main address.
              </Text>
              )
            : null
          }
          <Text style={styles.label}>Address #2</Text>
          <TextInput
            style={[styles.textInput, {paddingLeft: 16}]}
            name="address2"
            type="text"
            value={address2}
            autoCapitalize='none'
            onChangeText={(value) => this.handleInputChange("address2", value)}
          />
          <Text style={styles.label}>City</Text>
          <TextInput
            style={[styles.textInput, {paddingLeft: 16}]}
            name="city"
            type="text"
            value={city}
            autoCapitalize='none'
            onChangeText={(value) => this.handleInputChange("city", value)}
          />
          {
            !isCityValid
            ? (
              <Text style={styles.errorMessage}>
                * Please enter city name.
              </Text>
              )
            : null
          }
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between',}}>
            <View style={{flex: 4, flexDirection: 'column', paddingRight:8}}>
              <Text style={styles.label}>State</Text>
              <MultiSelect
                items={states}
                uniqueKey="id"
                onSelectedItemsChange={(item) => {
                  this.setState({state: item[0]})
                }}
                fixedHeight={false}
                selectedItems={[state]}
                selectText={selectedState ? selectedState.name : ''}
                single={true}
                searchInputPlaceholderText="Search State..."
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
                !isStateValid
                ? (
                  <Text style={styles.errorMessage}>
                    * Please select a state.
                  </Text>
                  )
                : null
              }
            </View>
            <View style={{flex: 4, flexDirection: 'column'}}>
              <Text style={styles.label}>Zip Code</Text>
              <TextInput
                style={[styles.textInput, {paddingLeft: 16}]}
                name="zipCode"
                type="text"
                value={zipCode}
                autoCapitalize='none'
                onChangeText={(value) => this.handleInputChange("zipCode", value)}
              />
              {
                !isZipCodeValid
                ? (
                  <Text style={styles.errorMessage}>
                    * Please enter zip code.
                  </Text>
                  )
                : null
              }
            </View>
          </View>
          <Text style={styles.label}>Website</Text>
          <Text
            style={{fontSize: 16, color: '#009688'}}
            onPress={() => Linking.openURL(`https://${url}`)}>
            {url}
          </Text>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16}}>
            <View style={{flexDirection: 'column', paddingRight:8}}>
              <Button
                title={translate('Cancel')}
                buttonStyle={{
                  width: 100,
                  backgroundColor: '#B8B8B8'
                }}
                onPress={() => {
                  this.props.navigation.navigate('HomeScreen');
                  // this.props.screenProps.setBackButtonTitle("Job Dashboard");
                }}
                >
              </Button>
            </View>
            <View style={{flexDirection: 'column'}}>
              <Button
                raised
                title={'Save'}
                color="#841584"
                buttonStyle={{
                  width: 100,
                  backgroundColor: '#006F54'
                }}
                onPress={this.saveCompany}
              >
              </Button>
            </View>
          </View>

        </View>
      </React.Fragment>
    );
  }

  renderNotifications() {
    const {company, profile} = this.state;
    return(
      <React.Fragment>
        <JobSettings
          userId={profile.userId}
          company={company}
          navigation={this.props.navigation}
        />
      </React.Fragment>
    );
  }

  renderPayments() {
    return(
      <View style={styles.form}>
        <Text style={{fontFamily: 'Interstate-Regular', fontSize: 24, color: '#006F54' }}>
          Hello. {"\n"}
        </Text>
        <Text style={{fontFamily: 'Interstate-Regular', fontSize: 16}}>
          For your security we at Trelar do not keep or track your payment
          account information. That is kept securely at Hyperwallet, a PayPal company.{"\n"}
          {"\n"}
          To make changes to your account, please click this
          <Text
            style={{fontSize: 16, color: '#009688'}}
            onPress={() => Linking.openURL('https://trelar.hyperwallet.com/')}>
            &nbsp;link&nbsp;
          </Text>
          or go directly to https://trelar.hyperwallet.com.{"\n"}
          {"\n"}
          Please remember that no one at Trelar will ever ask you for your bank or
          account information.{"\n"}
          {"\n"}
          {"\n"}
          Thank you.{"\n"}
          <Text style={{ color: '#006F54'}}>Trelar CSR team.</Text>
        </Text>
      </View>
    );
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
            <Text style={activeTab == '3' ? {color: '#348A74'} : null}>{translate('PAYMENTS')}</Text>
          </TouchableOpacity>
      </View>
    );
  }

  renderSection(activeTab) {
    switch (activeTab) {
      case '1':
        return(
          this.renderForm()
        );
      case '2':
        return(
          this.renderNotifications()
        );
      case '3':
        return(
          this.renderPayments()
        );
      default:
        break;
    }
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
            {
              this.renderSection(activeTab)
            }
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
    borderBottomWidth: 1,
    borderRadius: 2,
    borderColor: 'rgb(183,182,179)',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 5,
  },
  activeTab: {
    backgroundColor: '#FFF',
    height:40,
    width: (width/3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  tab: {
    backgroundColor: '#FFF',
    height:40,
    width: (width/3),
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  disabledTextInput: {
    backgroundColor: '#EAEAEA',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    height: 40,
    borderRadius: 0,
    paddingLeft: 5,
    marginTop: 8,
    color: '#686868'
  },
  errorMessage: {
    fontSize: 12,
    color: '#D32F2F'
  }
});

export default CompanySettings;
