import React, {Component} from 'react';
// import { Link } from 'react-router-native';
import Dimensions from 'Dimensions';
import {
  View,
  Text,
  TextInput,
  SectionList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  Alert
} from 'react-native';
import moment from 'moment';
import {CheckBox, Button, ThemeProvider, Input} from 'react-native-elements';
import MultiSelect from 'react-native-quick-select';
import LookupsService from '../../api/LookupsService';
import CompanySettingService from '../../api/CompanySettingService';
import {translate} from "../../i18n";

class NotificationSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: [],
      operatingRange: '',
      equipmentTypes: [],
      materialTypes: [],
      rateTypes: [],
      companyEquipments: ['Any'],
      companyMaterials: ['Any'],
      companyOperatingRange: 0,
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleRateTypeChange = this.handleRateTypeChange.bind(this);
    this.handleCheckedMaterials = this.handleCheckedMaterials.bind(this);
    this.handleCheckedEquipments = this.handleCheckedEquipments.bind(this);
    this.saveCompanyNotificationsSettings = this.saveCompanyNotificationsSettings.bind(this);
  }

  async componentDidMount() {
    const {company} = this.props;
    await this.fetchCompanySettings(company.id);
    await this.fetchLookupsValues();
  }

  async fetchCompanySettings(companyId) {
    const settings = await CompanySettingService.getCompanySettings(companyId);

    let companyOperatingRange = '';
    let companyRateType = '';
    const companyEquipments = [];
    const companyMaterials = [];
    Object.values(settings)
      .forEach((itm) => {
        if (itm.key === 'operatingRange') companyOperatingRange = itm.value;
        if (itm.key === 'rateType') companyRateType = itm.value;
        if (itm.key === 'equipmentType') companyEquipments.push(itm.value);
        if (itm.key === 'materialType') companyMaterials.push(itm.value);
      });

    this.setState({
      settings,
      companyOperatingRange,
      companyRateType,
      companyEquipments,
      companyMaterials
    });
  }

  async fetchLookupsValues() {
    const lookups = await LookupsService.getLookups();

    let rateTypes = [];
    const equipmentTypes = [];
    const materialTypes = [];
    Object.values(lookups)
      .forEach((itm) => {
        if (itm.key === 'RateType') rateTypes.push(itm);
        if (itm.key === 'EquipmentType') equipmentTypes.push(itm.val1);
        if (itm.key === 'MaterialType') materialTypes.push(itm.val1);
      });

    rateTypes = rateTypes.map(rate => ({
      id: String(rate.val1),
      name: `${rate.val1}`
    }));

    let index = equipmentTypes.indexOf('Any');
    equipmentTypes.splice(index, 1);
    equipmentTypes.push('Any');
    index = materialTypes.indexOf('Any');
    materialTypes.splice(index, 1);
    materialTypes.push('Any');

    this.setState({
      equipmentTypes,
      materialTypes,
      rateTypes,
      loaded: true
    });
  }

  handleInputChange(name, value) {
    this.setState({
      [name]: value
    });
  }

  handleRateTypeChange(e) {
    this.setState({
      companyRateType: e.value
    });
  }

  handleCheckedEquipments(value) {
    let {companyEquipments} = this.state;
    if (value === 'Any') {
      companyEquipments = ['Any'];
      this.setState({
        companyEquipments
      });
      return;
    }

    if (companyEquipments.indexOf('Any') >= 0) {
      companyEquipments.splice(0, 1);
    }

    if (companyEquipments.indexOf(value) >= 0) {
      const index = companyEquipments.indexOf(value);
      companyEquipments.splice(index, 1);
    } else {
      companyEquipments.push(value);
    }

    if (companyEquipments.length < 1) {
      companyEquipments = ['Any'];
    }
    this.setState({
      companyEquipments
    });
  }

  handleCheckedMaterials(value) {
    let {companyMaterials} = this.state;
    if (value === 'Any') {
      companyMaterials = ['Any'];
      this.setState({
        companyMaterials
      });
      return;
    }

    if (companyMaterials.indexOf('Any') >= 0) {
      companyMaterials.splice(0, 1);
    }

    if (companyMaterials.indexOf(value) >= 0) {
      const index = companyMaterials.indexOf(value);
      companyMaterials.splice(index, 1);
    } else {
      companyMaterials.push(value);
    }

    if (companyMaterials.length < 1) {
      companyMaterials = ['Any'];
    }
    this.setState({
      companyMaterials
    });
  }

  createNewCompanyNotifications() {
    const {company, userId} = this.props;
    const {
      settings,
      companyOperatingRange,
      companyRateType,
      companyMaterials,
      companyEquipments
    } = this.state;

    const newSettings = [];
    let item = settings.find(x => x.key === 'rateType');
    item.value = companyRateType;
    delete item.id;
    newSettings.push(item);
    item = settings.find(x => x.key === 'operatingRange');
    item.value = companyOperatingRange.toString();
    delete item.id;
    newSettings.push(item);

    for (let i = 0; i < companyMaterials.length; i += 1) {
      const newItem = {
        companyId: company.id,
        key: 'materialType',
        value: companyMaterials[i],
        createdOn: moment.utc().format(),
        createdBy: userId,
        modifiedOn: moment.utc().format(),
        modifiedBy: userId
      };
      newSettings.push(newItem);
    }

    for (let i = 0; i < companyEquipments.length; i += 1) {
      const newItem = {
        companyId: company.id,
        key: 'equipmentType',
        value: companyEquipments[i],
        createdOn: moment.utc().format(),
        createdBy: userId,
        modifiedOn: moment.utc().format(),
        modifiedBy: userId
      };
      newSettings.push(newItem);
    }
    return newSettings;
  }

  async saveCompanyNotificationsSettings() {
    const {company} = this.props;
    const newSettings = this.createNewCompanyNotifications();
    try {
      await CompanySettingService.updateCompanySettings(newSettings, company.id);
      Alert.alert(
        "Settings updated",
        "Your Job preferences have been correctly updated.",
        [
          {text: "OK"}
        ],
        {cancelable: false}
      );
    } catch (error) {
      // console.log(e);
      Alert.alert(
        "Error",
        "Something went wrong...",
        [
          {text: "OK"}
        ],
        {cancelable: false}
      );
    }
    await this.fetchCompanySettings(company.id);
  }

  renderSection() {
    const {
      companyOperatingRange,
      materialTypes,
      equipmentTypes,
      rateTypes,
      companyMaterials,
      companyEquipments,
      companyRateType
    } = this.state;
    return (
      <React.Fragment>
        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingTop: 16}}>
          <View style={{flex: 4, flexDirection: 'column', paddingRight: 8}}>
            <Text style={styles.label}>Rate Type</Text>
            <MultiSelect
              items={rateTypes}
              uniqueKey="id"
              onSelectedItemsChange={(item) => {
                this.setState({companyRateType: item[0]})
              }}
              fixedHeight={false}
              selectedItems={[companyRateType]}
              selectText={companyRateType}
              single={true}
              searchInputPlaceholderText="Rate Type..."
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
          </View>
          <View style={{flex: 4, flexDirection: 'column'}}>
            <Text style={styles.label}>Location Radius</Text>
            <TextInput
              style={[styles.textInput, {paddingLeft: 16}]}
              keyboardType='numeric'
              returnKeyType="done"
              name="companyOperatingRange"
              value={companyOperatingRange.toString()}
              onChangeText={(value) => this.handleInputChange("companyOperatingRange", value)}
            />
          </View>
        </View>
        <View>
          <View style={styles.form}>
            <SectionList
              sections={[
                {title: 'Materials', data: materialTypes},
              ]}
              renderItem={({item}) => (
                <View style={{flexDirection: 'row', marginLeft: 15}}>
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CheckBox
                      checked={companyMaterials.includes(item)}
                      onPress={() => this.handleCheckedMaterials(item)}
                    />
                  </View>
                  <View style={{justifyContent: 'center'}}>
                    <Text>{item}</Text>
                  </View>
                </View>
              )}
              renderSectionHeader={({section}) => (
                <View style={{
                  marginBottom: 7,
                  padding: 7
                }}>
                  <Text>{section.title}</Text>
                </View>
              )}
              keyExtractor={item => item}
            />
          </View>
          <View style={styles.form}>
            <SectionList
              sections={[
                {title: 'Truck Types', data: equipmentTypes}
              ]}
              renderItem={({item}) => (
                <View style={{flexDirection: 'row', marginLeft: 15}}>
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CheckBox
                      checked={companyEquipments.includes(item)}
                      onPress={() => this.handleCheckedEquipments(item)}
                    />
                  </View>
                  <View style={{justifyContent: 'center'}}>
                    <Text>{item}</Text>
                  </View>
                </View>
              )}
              renderSectionHeader={({section}) => (
                <View style={{
                  marginBottom: 7,
                  padding: 7
                }}>
                  <Text>{section.title}</Text>
                </View>
              )}
              keyExtractor={item => item}
            />
          </View>
        </View>
      </React.Fragment>

    );
  }

  render() {
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
    };
    const {toMainControl} = this.props;
    const {loaded} = this.state;
    if (loaded) {
      return (
        <ThemeProvider theme={theme}>
          <ScrollView style={{
            flex: 1,
            backgroundColor: '#E7E7E2',
            marginTop: 16,
            paddingLeft: 32,
            paddingRight: 32,
            marginBottom: 16
          }}>
            {this.renderSection()}
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-end'}}>
              <View style={{flexDirection: 'column', paddingRight: 8}}>
                <Button
                  title={translate('Cancel')}
                  buttonStyle={{backgroundColor: '#B8B8B8', width: 100}}
                  onPress={() => this.props.navigation.navigate('HomeScreen')}
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
                  onPress={this.saveCompanyNotificationsSettings}
                >
                </Button>
              </View>
            </View>
          </ScrollView>
        </ThemeProvider>
      );
    }
    return (
      <View style={{flex: 1, padding: 20, backgroundColor: 'rgb(230,230,225)', justifyContent: 'center'}}>
        <ActivityIndicator size="large"/>
      </View>
    );
  }
}

let {width, height} = Dimensions.get('window');
height -= 150;
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    width: width,
    height: height
  },
  form: {
    backgroundColor: '#FFF',
    borderRadius: 5,
    padding: 16,
    marginBottom: 16,
    borderColor: '#CCCCCC',
    borderWidth: 1
  },
  textInput: {
    backgroundColor: '#FFF',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    height: 40,
    borderRadius: 3,
    paddingLeft: 5,
  },
});

export default NotificationSettings;
