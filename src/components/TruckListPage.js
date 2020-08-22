import React, {Component} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Dimensions, TouchableHighlight
} from 'react-native';
import {Card, Button} from 'react-native-elements';
import ProfileService from '../api/ProfileService';
import EquipmentService from '../api/EquipmentService';
import NavigationService from '../service/NavigationService';
import TCardsContainer from './common/TCardsContainer';
import {translate} from "../i18n";
import Icon from 'react-native-vector-icons/MaterialIcons';
import UserService from "../api/UserService";
import EquipmentDetailService from '../api/EquipmentDetailService';

const {
  width,
  height
} = Dimensions.get('window');

const pagesize = 50;
const offset = 0;

class TruckListPage extends Component {

  constructor(props) {
    super(props);

    this.handleUpdateTruckList = this.handleUpdateTruckList.bind(this);


    this.state = {
      isLoading: true,
      topMenu: 'activeNav',
      statusFilter: 'Booked',
      startTimeSort: 'Asc',
      companyId: 0,
      equipments: [],
      page: 0,
      rows: 10,
      screenHeight: 0,
      profile: [],
      companyDrivers: []
    };
  }

  async componentDidMount() {
    try {
      const {screenProps} = { ...this.props };
      const {companyId, rows, page} = { ...this.state };
      let {equipments, companyDrivers} = { ...this.state };
      const profile = await ProfileService.getProfile();
      // debugger;
      //this will change when we add pagination
      companyDrivers = await EquipmentDetailService.getDefaultDriverList(profile.companyId);
      companyDrivers = companyDrivers.data;
      companyDrivers = companyDrivers.map((companyDriver) => {
        return {
          id: companyDriver.driverId,
          name: `${companyDriver.firstName} ${companyDriver.lastName}`
        }
      });
      // debugger;
      equipments = await EquipmentService.getEquipmentByCompanyId(profile.companyId, pagesize, offset);
      equipments = equipments.data;
      equipments = equipments.map(equipment => {
        const companyDriverMatch = companyDrivers.find(companyDriver => {
          return companyDriver.id === equipment.defaultDriverId;
        });
        return {
          ...equipment,
          defaultDriverName: companyDriverMatch ? companyDriverMatch.name : translate('Unassigned')
        }
      });
      // debugger;
      this.setState({
        equipments,
        profile,
        isLoading: false,
        companyDrivers
      });

      screenProps.setReloadTrucks(false);

    } catch (err) {
      // console.error(err);
    }
  }

  async handleUpdateTruckList() {
    const {profile} = {...this.state};
    try {
      this.setState({isLoading: true});
      const equipments = await EquipmentService.getEquipmentByCompanyId(profile.companyId, pagesize, offset);
      this.setState({equipments: equipments.data, isLoading: false});
    } catch (err) {
      console.error(err);
    }
  }

  componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any): void {
    const {screenProps} = this.props;
    if (nextProps.screenProps.reloadTruckList) {
      this.handleUpdateTruckList();
      nextProps.screenProps.setReloadTrucks(false);
    }
  }

  onContentSizeChange = (contentWidth, contentHeight) => {
    this.setState({
      screenHeight: contentHeight
    });
  }

  renderCard(item) {
    return (
      <TouchableHighlight
        onPress={() => {
          NavigationService.navigate('AddTruckForm', {
            editTruck: true,
            truckToEdit: item
          });
        }}
        underlayColor='transparent'
      >
        <View style={styles.itemContainer}>
          <View style={styles.sectionInfo}>
            <View style={styles.subSectionInfo}>
              <View style={styles.subSectionRow}>
                <Icon name={'local-shipping'} size={30} color='rgb(62,110,86)'/>
                <Text style={styles.primaryText}>{item.externalEquipmentNumber}</Text>
              </View>
              <View style={styles.subSectionRow}>
                <Icon name={'sort'} size={30} color='rgb(102,102,102)'/>
                <Text style={styles.secondaryText}>{item.type}</Text>
              </View>
              <View style={styles.subSectionRow}>
                <Icon name={'landscape'} size={30} color='rgb(102,102,102)'/>
                <Text style={styles.secondaryText}>
                  {`${item.maxCapacity} ${translate('Tons')} (${translate('Capacity')})`}
                </Text>
              </View>
              <View style={styles.subSectionRow}>
                <Icon name={'timeline'} size={30} color='rgb(102,102,102)'/>
                <Text style={styles.secondaryText}>
                  {`${item.maxDistance ? item.maxDistance : '∞'} ${translate('Miles')} (${translate('Range')})`}
                </Text>
              </View>
              <View style={styles.subSectionRow}>
                <Icon name={'perm-identity'} size={30} color='rgb(102,102,102)'/>
                <Text style={styles.secondaryText}>
                  {item.defaultDriverName} ({translate('Default Driver')})
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    )
  }

  render() {
    const {
      equipments,
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
                title={translate('Add Truck')}
                buttonStyle={{
                  // width: 100,
                  backgroundColor: '#006F54'
                }}
                onPress={() => {
                  NavigationService.navigate('AddTruckForm');
                }}
              >
              </Button>
            </View>
          </View>
          {(equipments && equipments.length > 0) &&
          <TCardsContainer
            data={equipments}
            renderCard={this.renderCard}
          />
          }
        </ScrollView>
      </View>
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
  },
});

export default TruckListPage;
