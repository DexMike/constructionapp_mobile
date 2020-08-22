import React, {Component} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Dimensions
} from 'react-native';
import {Card, Button} from 'react-native-elements';
import ProfileService from '../api/ProfileService';
import UserService from '../api/UserService';
import NavigationService from '../service/NavigationService';
import TCardsContainer from './common/TCardsContainer';
import {translate} from "../i18n";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import {ThemeProvider} from 'react-native-elements';
import theme from '../Theme';
import JobService from "../api/JobService";

const {
  width,
  height
} = Dimensions.get('window');

class DriverListPage extends Component {

  constructor(props) {
    super(props);

    this.handleUpdateDriverList = this.handleUpdateDriverList.bind(this);

    this.state = {
      isLoading: true,
      topMenu: 'activeNav',
      statusFilter: 'Booked',
      startTimeSort: 'Asc',
      companyId: 0,
      drivers: [],
      page: 0,
      rows: 10,
      screenHeight: 0,
      profile: []
    };
  }

  async componentDidMount() {
    try {
      const {screenProps} = this.props;
      const {companyId, rows, page} = this.state;
      let {drivers} = this.state;
      const profile = await ProfileService.getProfile();

      // Just doing a high limit since this page currently does not support pagination yet.
      drivers = await UserService.getCompanyDrivers(profile.companyId, 0, 999);
      drivers = drivers.data;
      this.setState({
        drivers,
        profile,
        isLoading: false
      });

      screenProps.setReloadDrivers(false);
    } catch (err) {
      console.error(err);
    }
  }

  async handleUpdateDriverList() {
    const {profile} = {...this.state};
    try {
      this.setState({isLoading: true});
      const drivers = await UserService.getDriversWithUserInfoByCompanyId(profile.companyId);
      this.setState({drivers, isLoading: false});
    } catch (err) {
      console.error(err);
    }
  }

  componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any): void {
    const {screenProps} = this.props;
    if (nextProps.screenProps.reloadDriverList) {
      this.handleUpdateDriverList();
      nextProps.screenProps.setReloadDrivers(false);
    }
  }

  onContentSizeChange = (contentWidth, contentHeight) => {
    this.setState({
      screenHeight: contentHeight
    });
  }

  renderCard(item) {
    return (
      <View style={styles.itemContainer}>
        <View style={styles.sectionInfo}>
          <View style={styles.subSectionInfo}>
            <View style={styles.subSectionRow}>
              <Icon name={'account'} size={25} color='rgb(62,110,86)'/>
              <Text style={styles.primaryText}>{item.firstName} {item.lastName}</Text>
            </View>
            <View style={styles.subSectionRow}>
              <Icon name={'phone'} size={25} color='rgb(102,102,102)'/>
              <Text style={styles.secondaryText}>{item.mobilePhone}</Text>
            </View>
            <View style={styles.subSectionRow}>
              <Icon name={'email'} size={25} color='rgb(102,102,102)'/>
              <Text style={styles.secondaryText}>{item.email}</Text>
            </View>
            <View style={styles.subSectionRow}>
              <Icon name={'account-box'} size={25} color='rgb(102,102,102)'/>
              <Text style={styles.secondaryText}>{item.userStatus}</Text>
            </View>
            <View style={styles.subSectionRow}>
              <Icon2 name={'local-shipping'} size={25} color='rgb(102,102,102)' />
              <Text style={styles.secondaryText}>{`${item.defaultEquipment ? item.defaultEquipment : translate('Unassigned')} (${translate('Default Truck')})`}</Text>
            </View>
          </View>
        </View>
      </View>


    );
  }


  render() {
    const {
      drivers,
      isLoading
    } = this.state;
    // const scrollEnabled = this.state.screenHeight > height;
    if (isLoading) {
      return (
        <View style={{flex: 1, padding: 20, backgroundColor: 'rgb(230,230,225)', justifyContent: 'center'}}>
          <ActivityIndicator size="large"/>
        </View>
      );
    }
    return (
      <ThemeProvider theme={theme}>
        <View style={styles.container}>
          <ScrollView
            onContentSizeChange={this.onContentSizeChange}
            style={{backgroundColor: 'rgb(230,230,225)'}}
          >
            <View style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'flex-end',
              marginTop: 15,
              marginBottom: 2
            }}>
              <View style={{flexDirection: 'column', paddingRight: 15, marginBottom: 7}}>
                <Button
                  raised
                  title={translate('Add Driver')}
                  buttonStyle={{
                    // width: 100,
                    backgroundColor: '#006F54'
                  }}
                  onPress={() => {
                    NavigationService.navigate('AddDriverForm');
                  }}
                >
                </Button>
              </View>
            </View>
            {(drivers && drivers.length > 0) &&
            <TCardsContainer
              data={drivers}
              renderCard={this.renderCard}
            />
            }
          </ScrollView>
        </View>
      </ThemeProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(207,227,232)',
    width: width,
    height: height
  },
  cardInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch'
  },

  itemContainer: {
    backgroundColor: 'rgb(255,255,255)',
    margin: 5,
    marginLeft: 15,
    marginRight: 15,
    borderWidth: 2,
    borderRadius: 5,
    borderColor: 'rgb(255,255,255)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1
  },

  sectionInfo: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch'
  },

  subSectionInfo: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  subSectionRow: {
    flex: 1,
    flexDirection: 'row',
    paddingBottom: 5
  },

  primaryText: {
    fontSize: 14,
    color: 'rgb(62,110,86)',
    paddingLeft: 12,
    paddingTop: 5
  },

  secondaryText: {
    fontSize: 14,
    color: 'rgb(102,102,102)',
    paddingLeft: 12,
    paddingTop: 5
  }
});

export default DriverListPage;
